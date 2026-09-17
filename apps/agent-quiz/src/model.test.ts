import { describe, it, expect } from "vitest";
import {
  correct,
  diagnose,
  parseAttempts,
  saveAttempts,
  score,
  shuffled,
  storageKey,
} from "./model";
import type { Chapter, Attempt, Question } from "./types";
const q = {
  id: "q",
  type: "multiple",
  answerIds: ["a", "c"],
  dimension: "concept",
} as Question;
const ch = { questions: [q, { ...q, id: "r", type: "reflection" }] } as Chapter;
const a = {
  questionIds: ["q", "r"],
  answers: {
    q: { selectedIds: ["c", "a"], elapsedMs: 2000 },
    r: { selectedIds: [], elapsedMs: 9999 },
  },
} as unknown as Attempt;
describe("objective scoring boundaries", () => {
  it("requires exact unordered selection without duplicate IDs", () => {
    expect(correct(q, ["c", "a"])).toBe(true);
    expect(correct(q, ["a"])).toBe(false);
    expect(correct(q, ["a", "a"])).toBe(false);
    expect(correct(q, ["a", "b", "c"])).toBe(false);
  });
  it("excludes reflection and time from capability", () => {
    expect(score(ch, a)).toMatchObject({
      hits: 1,
      total: 1,
      pct: 100,
      elapsedMs: 2000,
    });
  });
  it("suppresses sparse diagnosis even if correct", () => {
    expect(diagnose(ch, a)[0]).toMatchObject({
      sufficient: false,
      label: "样本不足",
      total: 1,
    });
  });
});
describe("resilience and persistence", () => {
  it("rejects corrupt storage", () => {
    expect(parseAttempts("{bad")).toEqual([]);
    expect(parseAttempts('[{"id":"x"}]')).toEqual([]);
  });
  it("isolates user namespaces and reports quota errors", () => {
    expect(storageKey("guest")).not.toBe(storageKey("u1"));
    expect(
      saveAttempts(
        {
          setItem() {
            throw Error("quota");
          },
        },
        "guest",
        [],
      ),
    ).toBe(false);
  });
  it("shuffles without losing stable IDs or mutating source", () => {
    const ids = ["a", "b", "c", "d"];
    const result = shuffled(ids, () => 0);
    expect(result).not.toEqual(ids);
    expect([...result].sort()).toEqual(ids);
    expect(ids).toEqual(["a", "b", "c", "d"]);
  });
});

import {
  completeObjectives,
  makeAttempt,
  markdownReview,
  quoteText,
  objectiveEvidence,
  recommendations,
} from "./model";
import rawChapter from "../public/data/chapter-1.json";
const realChapter = rawChapter as unknown as Chapter;
describe("completed assessment and targeted review", () => {
  it("accepts18 objectives without reflections and rejects partial/review/oldversion for scoreboards", () => {
    const a = makeAttempt(realChapter, "full");
    for (const q of realChapter.questions.filter(
      (q) => q.type !== "reflection",
    ))
      a.answers[q.id] = {
        selectedIds: q.answerIds,
        confidence: null,
        elapsedMs: 150,
        submittedAt: new Date().toISOString(),
      };
    expect(completeObjectives(realChapter, a)).toBe(true);
    expect(completeObjectives(realChapter, { ...a, mode: "review" })).toBe(
      false,
    );
    expect(completeObjectives(realChapter, { ...a, version: "old" })).toBe(
      false,
    );
    expect(completeObjectives(realChapter, { ...a, answers: {} })).toBe(false);
  });
  it("ranks high-confidence errors first, caps suggestions at3, isolates uncertainty practice", () => {
    const a = makeAttempt(realChapter, "full");
    for (const [i, q] of realChapter.questions.slice(0, 4).entries())
      a.answers[q.id] = {
        selectedIds: i === 0 ? q.answerIds : [],
        confidence: i === 0 ? "unsure" : i === 3 ? "sure" : null,
        elapsedMs: 10,
        submittedAt: new Date().toISOString(),
      };
    const suggestions = recommendations(realChapter, a);
    expect(suggestions).toHaveLength(3);
    expect(suggestions[0].id).toBe(realChapter.questions[3].id);
    const review = makeAttempt(realChapter, "review", a, "uncertain");
    expect(review.questionIds).toEqual([realChapter.questions[0].id]);
    expect(review.mode).toBe("review");
    expect(
      objectiveEvidence(realChapter, a).reduce((n, o) => n + o.answered, 0),
    ).toBe(4);
  });
  it("exports actual explanations, citations and private reflection self-checks", () => {
    const a = makeAttempt(realChapter, "full"),
      q = realChapter.questions[19];
    a.answers[q.id] = {
      selectedIds: [],
      confidence: null,
      elapsedMs: 0,
      submittedAt: new Date().toISOString(),
      reflectionText: "我的真实笔记",
      selfChecked: [0],
    };
    const md = markdownReview(realChapter, a);
    expect(md).toContain("我的真实笔记");
    expect(md).toContain(q.evidence[0].url);
    expect(md).toContain("- [x]");
    expect(md).toContain("思考题不计分");
  });
  it("rejects corrupted clocks and option-order data but round-trips a valid attempt", () => {
    const a = makeAttempt(realChapter, "full");
    expect(parseAttempts(JSON.stringify([a]))).toHaveLength(1);
    expect(
      parseAttempts(JSON.stringify([{ ...a, activeStartedAt: "NaN" }])),
    ).toEqual([]);
    expect(
      parseAttempts(JSON.stringify([{ ...a, optionOrders: { q: 42 } }])),
    ).toEqual([]);
  });
});

describe("evidence display", () => {
  it("removes only limited formatting without changing original source or interpreting unknown HTML", () => {
    const original =
      "<strong>机制</strong>与<em>权衡</em>：`step()`，x < y <script>alert(1)</script>";
    expect(quoteText(original)).toBe(
      "机制与权衡：step()，x < y <script>alert(1)</script>",
    );
    expect(original).toContain("<strong>");
    expect(quoteText("未配对 ` 和正常内容")).toBe("未配对 ` 和正常内容");
  });
  it("exports readable plain quotes and escapes other HTML in Markdown", () => {
    const q = {
      ...realChapter.questions[0],
      evidence: [
        {
          section: "测试引用",
          quote:
            "<strong>原文</strong> `code`\n<em>第二行</em> <script>bad</script>",
          url: "https://example.com/source",
        },
      ],
    };
    const ch = { ...realChapter, questions: [q] };
    const a = makeAttempt(ch, "full");
    a.answers[q.id] = {
      selectedIds: q.answerIds,
      confidence: null,
      elapsedMs: 1,
      submittedAt: new Date().toISOString(),
    };
    const result = markdownReview(ch, a);
    expect(result).toContain(
      "> 原文 code\n> 第二行 &lt;script&gt;bad&lt;/script&gt;",
    );
    expect(q.evidence[0].quote).toContain("<strong>");
  });
});
