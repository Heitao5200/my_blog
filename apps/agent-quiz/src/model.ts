import {
  type Attempt,
  type Chapter,
  type Question,
  dimensions,
  dimensionNames,
} from "./types";
export function correct(q: Question, selected: string[]) {
  return (
    q.type !== "reflection" &&
    selected.length === q.answerIds.length &&
    new Set(selected).size === selected.length &&
    selected.every((id) => q.answerIds.includes(id))
  );
}
export function shuffled<T>(items: T[], random = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function makeAttempt(
  ch: Chapter,
  mode: "full" | "review",
  previous?: Attempt,
  reviewKind: "wrong" | "uncertain" = "wrong",
): Attempt {
  const qs =
    mode === "review"
      ? ch.questions.filter(
          (q) =>
            q.type !== "reflection" &&
            previous?.answers[q.id] &&
            (reviewKind === "wrong"
              ? !correct(q, previous.answers[q.id].selectedIds)
              : ["unsure", "guess"].includes(
                  previous.answers[q.id].confidence || "",
                )),
        )
      : ch.questions;
  return {
    id: crypto.randomUUID(),
    chapterId: ch.id,
    version: ch.version,
    mode,
    questionIds: qs.map((q) => q.id),
    index: 0,
    answers: {},
    startedAt: new Date().toISOString(),
    completedAt: null,
    source: "local",
    activeStartedAt: Date.now(),
    optionOrders: Object.fromEntries(
      qs.map((q) => [q.id, shuffled(q.options.map((o) => o.id))]),
    ),
  };
}
export function diagnose(ch: Chapter, a: Attempt) {
  return dimensions.map((key) => {
    const qs = ch.questions.filter(
      (q) => q.dimension === key && q.type !== "reflection" && a.answers[q.id],
    );
    const hits = qs.filter((q) =>
      correct(q, a.answers[q.id].selectedIds),
    ).length;
    const pct = qs.length ? Math.round((hits / qs.length) * 100) : 0;
    return {
      key,
      total: qs.length,
      hits,
      pct,
      sufficient: qs.length >= 3,
      label:
        qs.length < 3
          ? "样本不足"
          : pct >= 80
            ? "优势"
            : pct >= 60
              ? "需巩固"
              : "优先复习",
    };
  });
}
export function score(ch: Chapter, a: Attempt) {
  const qs = ch.questions.filter(
    (q) => q.type !== "reflection" && a.questionIds.includes(q.id),
  );
  const answered = qs.filter((q) => a.answers[q.id]);
  const hits = answered.filter((q) =>
    correct(q, a.answers[q.id].selectedIds),
  ).length;
  return {
    hits,
    total: qs.length,
    answered: answered.length,
    pct: qs.length ? Math.round((hits / qs.length) * 100) : 0,
    elapsedMs: answered.reduce((sum, q) => sum + a.answers[q.id].elapsedMs, 0),
  };
}
export function storageKey(userId: string) {
  return `hello-agents:assessment:v1:${userId}`;
}
export function parseAttempts(raw: string | null): Attempt[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    const strings = (v: unknown): v is string[] =>
      Array.isArray(v) && v.every((x) => typeof x === "string");
    const record = (v: unknown): v is Record<string, any> =>
      !!v && typeof v === "object" && !Array.isArray(v);
    const time = (v: unknown) =>
      typeof v === "string" && Number.isFinite(Date.parse(v));
    return value.filter(
      (a) =>
        record(a) &&
        typeof a.id === "string" &&
        Number.isInteger(a.chapterId) &&
        typeof a.version === "string" &&
        strings(a.questionIds) &&
        new Set(a.questionIds).size === a.questionIds.length &&
        Number.isInteger(a.index) &&
        a.index >= 0 &&
        a.index < a.questionIds.length &&
        record(a.answers) &&
        Object.entries(a.answers).every(
          ([id, v]) =>
            a.questionIds.includes(id) &&
            record(v) &&
            strings(v.selectedIds) &&
            Number.isFinite(v.elapsedMs) &&
            v.elapsedMs >= 0 &&
            time(v.submittedAt) &&
            [null, "sure", "unsure", "guess"].includes(v.confidence) &&
            (v.reflectionText === undefined ||
              typeof v.reflectionText === "string") &&
            (v.selfChecked === undefined ||
              (Array.isArray(v.selfChecked) &&
                v.selfChecked.every(
                  (x: unknown) => Number.isInteger(x) && Number(x) >= 0,
                ))),
        ) &&
        record(a.optionOrders) &&
        Object.values(a.optionOrders).every(strings) &&
        time(a.startedAt) &&
        (a.completedAt === null || time(a.completedAt)) &&
        (a.activeStartedAt === null ||
          (Number.isFinite(a.activeStartedAt) && a.activeStartedAt >= 0)) &&
        ["full", "review"].includes(a.mode) &&
        a.source === "local",
    ) as Attempt[];
  } catch {
    return [];
  }
}
export function saveAttempts(
  storage: Pick<Storage, "setItem">,
  userId: string,
  attempts: Attempt[],
) {
  try {
    storage.setItem(storageKey(userId), JSON.stringify(attempts));
    return true;
  } catch {
    return false;
  }
}

export function completeObjectives(ch: Chapter, a: Attempt) {
  const qs = ch.questions.filter((q) => q.type !== "reflection");
  return (
    a.version === ch.version &&
    a.mode === "full" &&
    qs.length === 18 &&
    qs.every((q) => a.questionIds.includes(q.id) && !!a.answers[q.id])
  );
}
export function objectiveEvidence(ch: Chapter, a: Attempt) {
  return ch.blueprint.objectives.map((o) => {
    const questions = ch.questions.filter(
      (q) => q.type !== "reflection" && q.objectiveId === o.id,
    );
    const answered = questions.filter((q) => a.answers[q.id]);
    return {
      ...o,
      total: questions.length,
      answered: answered.length,
      hits: answered.filter((q) => correct(q, a.answers[q.id].selectedIds))
        .length,
    };
  });
}
export function recommendations(ch: Chapter, a: Attempt) {
  return ch.questions
    .filter(
      (q) =>
        q.type !== "reflection" &&
        a.answers[q.id] &&
        (!correct(q, a.answers[q.id].selectedIds) ||
          ["unsure", "guess"].includes(a.answers[q.id].confidence || "")),
    )
    .sort((x, y) => {
      const priority = (q: Question) =>
        !correct(q, a.answers[q.id].selectedIds)
          ? a.answers[q.id].confidence === "sure"
            ? 0
            : 1
          : 2;
      return priority(x) - priority(y);
    })
    .slice(0, 3);
}
/** Display-only normalization. Original evidence remains untouched for exact-source audits.
 * Unknown markup remains literal text; React renders it through text nodes.
 */
export function quoteText(quote: string): string {
  return quote
    .replace(/<\/?(?:strong|em|b|i|code)\s*>/gi, "")
    .replace(/`+([^`]*?)`+/g, "$1");
}
function markdownQuote(quote: string): string {
  return quoteText(quote)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
}
export function markdownReview(ch: Chapter, a: Attempt) {
  const s = score(ch, a);
  return [
    `# ${ch.title} · 学习复盘`,
    `题库版本：${a.version}`,
    `完成时间：${a.completedAt || "尚未完成"}`,
    `客观题正确率：${s.pct}%（${s.hits}/${s.total}）`,
    `思考题不计分；用时不代表理解能力。`,
    `## 五维诊断`,
    ...diagnose(ch, a).map(
      (r) =>
        `- ${dimensionNames[r.key]}：${r.label}；${r.hits}/${r.total}，${r.sufficient ? r.pct + "%" : "样本不足"}`,
    ),
    `## 知识点证据`,
    ...objectiveEvidence(ch, a).map(
      (o) =>
        `- ${o.title}：本次答对 ${o.hits} 题 / 作答 ${o.answered} 题 / 覆盖 ${o.total} 题`,
    ),
    ...ch.questions
      .filter((q) => a.answers[q.id])
      .flatMap((q) => {
        const ans = a.answers[q.id];
        return [
          `## ${q.stem}`,
          q.type === "reflection"
            ? `我的思考：\n${ans.reflectionText || ""}`
            : `我的选择：${q.options
                .filter((o) => ans.selectedIds.includes(o.id))
                .map((o) => o.text)
                .join(
                  "；",
                )}\n\n本次${correct(q, ans.selectedIds) ? "答对" : "答错"}。`,
          q.type === "reflection" ? q.referenceAnswer || "" : q.explanation,
          ...q.evidence.map(
            (e) => `${markdownQuote(e.quote)}\n\n[${e.section}](${e.url})`,
          ),
          ...(q.rubric || []).map(
            (r, i) => `- [${ans.selfChecked?.includes(i) ? "x" : " "}] ${r}`,
          ),
        ];
      }),
  ].join("\n\n");
}
