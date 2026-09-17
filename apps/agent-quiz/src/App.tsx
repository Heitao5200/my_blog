import { useEffect, useState } from "react";
import type { Attempt, Chapter, ChapterMeta, Question, Answer } from "./types";
import { dimensionNames } from "./types";
import {
  correct,
  diagnose,
  makeAttempt,
  parseAttempts,
  saveAttempts,
  score,
  storageKey,
  completeObjectives,
  objectiveEvidence,
  recommendations,
  markdownReview,
  quoteText,
} from "./model";

import "./style.css";
const names = { single: "单选题", multiple: "多选题", reflection: "思考题" };
const labels: Record<string, string> = {
  understand: "理解",
  mechanism: "机制",
  application: "应用",
  reflection: "反思",
  easy: "基础",
  medium: "进阶",
  hard: "挑战",
};
const duration = (ms: number) =>
  `${Math.floor(ms / 60000)}分${Math.floor(ms / 1000) % 60}秒`;
const date = (v: string) =>
  new Date(v).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
function safeLoad(user: string) {
  try {
    return parseAttempts(localStorage.getItem(storageKey(user)));
  } catch {
    return [];
  }
}
function getActiveId() {
  try {
    return localStorage.getItem("hello-agents:active");
  } catch {
    return null;
  }
}
function persist(user: string, attempts: Attempt[]) {
  try {
    return saveAttempts(localStorage, user, attempts);
  } catch {
    return false;
  }
}
function Radar({
  rows,
  prior,
}: {
  rows: ReturnType<typeof diagnose>;
  prior?: ReturnType<typeof diagnose> | null;
}) {
  const p = (i: number, r: number) =>
    `${150 + Math.sin((i * 2 * Math.PI) / 5) * r},${147 - Math.cos((i * 2 * Math.PI) / 5) * r}`;
  const complete = rows.every((r) => r.sufficient);
  return (
    <div className="radar">
      <svg
        viewBox="0 0 300 295"
        role="img"
        aria-label={
          complete ? "五维正确率雷达图" : "五维样本不足，暂不连成能力雷达图"
        }
      >
        {[25, 50, 75, 100].map((r) => (
          <polygon
            key={r}
            points={rows.map((_, i) => p(i, r)).join(" ")}
            fill="none"
            stroke="#d8dcd0"
          />
        ))}
        {rows.map((r, i) => (
          <g key={r.key}>
            <line
              x1="150"
              y1="147"
              x2={p(i, 100).split(",")[0]}
              y2={p(i, 100).split(",")[1]}
              stroke="#d8dcd0"
            />
            <text
              x={p(i, 127).split(",")[0]}
              y={p(i, 127).split(",")[1]}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fill="#435448"
            >
              {dimensionNames[r.key]}
            </text>
          </g>
        ))}
        {complete && prior?.every((r) => r.sufficient) && (
          <polygon
            points={prior.map((r, i) => p(i, r.pct)).join(" ")}
            fill="none"
            stroke="#b08a54"
            strokeWidth="2"
            strokeDasharray="5 4"
          />
        )}
        {complete ? (
          <polygon
            points={rows.map((r, i) => p(i, r.pct)).join(" ")}
            fill="#43795c33"
            stroke="#3f775b"
            strokeWidth="2"
          />
        ) : null}
        {rows.map((r, i) =>
          r.sufficient ? (
            <circle
              key={r.key}
              cx={p(i, r.pct).split(",")[0]}
              cy={p(i, r.pct).split(",")[1]}
              r="4"
              fill="#315d46"
            />
          ) : null,
        )}
      </svg>
      {complete && prior?.every((r) => r.sufficient) && (
        <p className="small">绿色实线：本次 · 棕色虚线：上次同版本完整测评</p>
      )}
      {!complete && (
        <span className="small">每个维度至少 3 道作答，才生成完整雷达</span>
      )}
    </div>
  );
}
export default function App() {
  const [manifest, setManifest] = useState<ChapterMeta[]>([]),
    [chapters, setChapters] = useState<Record<number, Chapter>>({});
  const [route, setRoute] = useState(location.hash.slice(1) || "home"),
    [user] = useState("guest");
  const [attempts, setAttempts] = useState<Attempt[]>(() => safeLoad("guest")),
    [activeId, setActiveId] = useState<string | null>(getActiveId),
    [selectedChapter, setSelectedChapter] = useState(1);
  const [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]),
    [confidence, setConfidence] = useState<Answer["confidence"]>(null),
    [reflection, setReflection] = useState(""),
    [checks, setChecks] = useState<number[]>([]);

  const go = (r: string) => {
    location.hash = r;
    setRoute(r);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  useEffect(() => {
    const change = () => setRoute(location.hash.slice(1) || "home");
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/manifest.json`)
      .then((r) => {
        if (!r.ok) throw Error("章节目录加载失败");
        return r.json();
      })
      .then((d) => {
        setManifest(d.chapters);
        const restored = attempts.find((a) => a.id === activeId);
        setSelectedChapter(
          d.chapters.find((c: ChapterMeta) => c.status === "ready" && c.id === restored?.chapterId && c.version === restored.version)?.id ||
          d.chapters.find((c: ChapterMeta) => c.status === "ready")?.id || 1,
        );
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (!persist(user, attempts))
      setNotice(
        "浏览器存储不可用或空间不足，请及时导出记录；刷新可能丢失本次作答。",
      );
  }, [attempts, user]);
  useEffect(() => {
    try {
      if (activeId) localStorage.setItem("hello-agents:active", activeId);
    } catch {}
  }, [activeId]);
  useEffect(() => {
    const a = attempts.find((x) => x.id === activeId);
    if (a && manifest.length && !chapters[a.chapterId]) {
      loadChapter(a.chapterId)
        .then((ch) => {
          if (ch.version !== a.version) {
            setActiveId(null);
            setError(
              "此记录属于旧版题库，无法使用新版题目重新诊断。请导出保留原始作答。",
            );
          }
        })
        .catch((e) => setError(e.message));
    }
  }, [activeId, manifest]);
  const active = attempts.find((a) => a.id === activeId),
    chapter =
      active && chapters[active.chapterId]?.version === active.version
        ? chapters[active.chapterId]
        : undefined,
    q =
      active && chapter
        ? chapter.questions.find(
            (q) => q.id === active.questionIds[active.index],
          )
        : undefined,
    answer = q && active?.answers[q.id];
  useEffect(() => {
    setSelected(answer?.selectedIds || []);
    setConfidence(answer?.confidence || null);
    setReflection(answer?.reflectionText || "");
    setChecks(answer?.selfChecked || []);
  }, [q?.id, activeId, answer]);
  async function loadChapter(id: number) {
    if (chapters[id]) return chapters[id];
    const meta = manifest.find((c) => c.id === id);
    if (!meta || meta.status !== "ready")
      throw Error("此章题库尚未通过审核，暂不开放测评。");
    const r = await fetch(
      `${import.meta.env.BASE_URL}data/${meta.file.replace(/^data\//, "")}`,
    );
    if (!r.ok) throw Error("题库加载失败，请稍后重试。");
    const ch = (await r.json()) as Chapter;
    setChapters((prev) => ({ ...prev, [id]: ch }));
    return ch;
  }
  async function task(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败，请重试。");
    } finally {
      setBusy(false);
    }
  }
  function put(a: Attempt) {
    setAttempts((prev) => [a, ...prev.filter((p) => p.id !== a.id)]);
  }
  async function start(
    id: number,
    mode: "full" | "review" = "full",
    previous?: Attempt,
    reviewKind: "wrong" | "uncertain" = "wrong",
  ) {
    await task(async () => {
      const ch = await loadChapter(id);
      let a = makeAttempt(ch, mode, previous, reviewKind);
      if (!a.questionIds.length) {
        setNotice("这份记录中没有符合条件的复习题。");
        return;
      }
      put(a);
      setActiveId(a.id);
      setSelectedChapter(id);
      go("quiz");
    });
  }
  async function open(a: Attempt) {
    await task(async () => {
      const ch = await loadChapter(a.chapterId);
      if (ch.version !== a.version)
        throw Error(
          "此记录属于旧版题库，当前无法按新版题目重新诊断。可以导出保留原始作答。",
        );
      setActiveId(a.id);
      setSelectedChapter(a.chapterId);
      go(a.completedAt ? "result" : "quiz");
    });
  }
  async function submit() {
    if (!q || !active || answer) return;
    await task(async () => {
      let value: Answer = {
        selectedIds: selected,
        confidence,
        elapsedMs: Math.max(
          0,
          Date.now() - (active.activeStartedAt || Date.now()),
        ),
        submittedAt: new Date().toISOString(),
        ...(q.type === "reflection"
          ? { reflectionText: reflection, selfChecked: checks }
          : {}),
      };
      put({
        ...active,
        answers: { ...active.answers, [q.id]: value },
        activeStartedAt: null,
      });
    });
  }
  async function next() {
    if (!active) return;
    await task(async () => {
      const nextIndex = active.index + 1;
      const nextQ = chapter?.questions.find(
        (q) => q.id === active.questionIds[nextIndex],
      );
      const objectiveDone =
        chapter &&
        completeObjectives(chapter, active) &&
        q?.type !== "reflection";
      if (nextIndex >= active.questionIds.length || objectiveDone) {
        const completedAt = active.completedAt || new Date().toISOString();
        put({
          ...active,
          completedAt,
          index: Math.min(nextIndex, active.questionIds.length - 1),
          activeStartedAt: nextQ?.type === "reflection" ? Date.now() : null,
        });
        go("result");
      } else {
        put({ ...active, index: nextIndex, activeStartedAt: Date.now() });
      }
    });
  }
  function exportMarkdown() {
    if (!chapter || !active) return;
    const url = URL.createObjectURL(
      new Blob([markdownReview(chapter, active)], {
        type: "text/markdown;charset=utf-8",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `Hello-Agents-第${chapter.id}章-复盘.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function exportRecords() {
    const blob = new Blob(
      [
        JSON.stringify(
          { schemaVersion: 1, exportedAt: new Date().toISOString(), attempts },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `hello-agents-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  useEffect(() => {
    if (["method", "leaderboard"].includes(route) && manifest.length)
      task(async () => {
        await loadChapter(selectedChapter);
      });
  }, [route, selectedChapter, manifest]);
  const finished = attempts.filter((a) => a.completedAt),
    doneChapters = new Set(
      finished.filter((a) => a.mode === "full").map((a) => a.chapterId),
    );
  const result = active && chapter ? score(chapter, active) : null,
    rows = active && chapter ? diagnose(chapter, active) : null;
  const prev =
    active &&
    finished
      .filter(
        (a) =>
          a.id !== active.id &&
          a.chapterId === active.chapterId &&
          a.version === active.version &&
          a.mode === "full" &&
          a.completedAt! < active.completedAt!,
      )
      .sort((a, b) =>
        (b.completedAt || "").localeCompare(a.completedAt || ""),
      )[0];
  const prior = prev && chapter ? diagnose(chapter, prev) : null;
  const picker = (
    <label className="chapter-picker">
      选择章节{" "}
      <select
        value={selectedChapter}
        onChange={(e) => setSelectedChapter(Number(e.target.value))}
      >
        {manifest
          .filter((c) => c.status === "ready")
          .map((c) => (
            <option key={c.id} value={c.id}>
              第 {c.id} 章 · {c.title}
            </option>
          ))}
      </select>
    </label>
  );
  return (
    <>
      <header className="topbar">
        <a className="brand" href="#home">
          <span className="brand-mark">
            H<span>·</span>A
          </span>
          <span>
            Hello-Agents<small>学习测评 / LEARNING ATLAS</small>
          </span>
        </a>
        <nav aria-label="主导航">
          {[
            ["home", "章节"],
            ["history", "学习记录"],
            ["method", "出题逻辑"],
            ["leaderboard", "个人成绩"],
          ].map(([id, title]) => (
            <a
              className={route === id ? "active" : ""}
              key={id}
              href={`#${id}`}
            >
              {title}
            </a>
          ))}
        </nav>
        <div className="account">
          <span className="user-dot" />
          本地学习空间
        </div>
      </header>
      <main>
        {error && (
          <div role="alert" className="message error">
            {error}
            <button aria-label="关闭错误提示" onClick={() => setError("")}>
              ×
            </button>
          </div>
        )}
        {notice && (
          <div role="status" className="message">
            {notice}
            <button aria-label="关闭提示" onClick={() => setNotice("")}>
              ×
            </button>
          </div>
        )}
        {route === "home" && (
          <>
            <section className="hero">
              <div>
                <div className="eyebrow">HELLO-AGENTS / 学习进阶</div>
                <h1>
                  把「看懂了」，
                  <br />
                  变成<span className="serif-accent">真正掌握。</span>
                </h1>
                <p>
                  以章节为起点，用问题检验理解。
                  <br />
                  每一道反馈，都能回到知识本身。
                </p>
                <div className="hero-actions">
                  <a
                    className="button primary"
                    href="#chapters"
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .getElementById("chapters")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    选择章节 <span>↗</span>
                  </a>
                  <a className="quiet-link" href="#method">
                    看看问题如何设计 →
                  </a>
                </div>
                <div className="hero-note">
                  <span>◎</span> 逐题反馈 <i /> 五维诊断 <i /> 原文可溯源
                </div>
              </div>
              <div className="atlas-art" aria-hidden="true">
                <div className="orbit o1" />
                <div className="orbit o2" />
                <div className="orbit o3" />
                <div className="atlas-center">
                  知<small>LEARN · REFLECT · GROW</small>
                </div>
                <span className="orbit-label l1">理解</span>
                <span className="orbit-label l2">推演</span>
                <span className="orbit-label l3">应用</span>
                <span className="art-index">
                  FIELD NOTES
                  <br />
                  01 — 16
                </span>
              </div>
            </section>
            <section className="stats">
              <div>
                <strong>
                  {String(doneChapters.size).padStart(2, "0")}
                  <small> / {manifest.length || 16}</small>
                </strong>
                <span>已完成章节</span>
              </div>
              <div>
                <strong>{String(finished.length).padStart(2, "0")}</strong>
                <span>测评与复习记录</span>
              </div>
              <div>
                <strong>05</strong>
                <span>知识诊断维度</span>
              </div>
              <p>
                进步不只是一个分数。
                <br />
                <b>发现理解的边界，找到下一步。</b>
              </p>
            </section>
            <section id="chapters">
              <div className="section-heading">
                <div>
                  <div className="eyebrow">CHAPTER INDEX</div>
                  <h2>从这一章开始</h2>
                </div>
                <span className="small">每章 18 道客观题 + 2 道思考题</span>
              </div>
              {loading ? (
                <p className="empty">正在加载章节目录…</p>
              ) : (
                <div className="chapter-grid">
                  {manifest.map((c) => {
                    const unfinished = attempts.find(
                        (a) =>
                          a.chapterId === c.id &&
                          a.version === c.version &&
                          !a.completedAt,
                      ),
                      latest = finished.find(
                        (a) => a.chapterId === c.id && a.version === c.version,
                      );
                    return (
                      <article
                        className={`chapter-card ${c.status === "pending" ? "pending" : ""}`}
                        key={c.id}
                      >
                        <div className="card-top">
                          <span className="chapter-number">
                            {String(c.id).padStart(2, "0")}
                          </span>
                          <span className={`pill ${latest ? "green" : ""}`}>
                            {c.status === "pending"
                              ? "题库筹备中"
                              : unfinished
                                ? "进行中"
                                : latest
                                  ? "已测评"
                                  : "可开始"}
                          </span>
                        </div>
                        <h3>{c.title}</h3>
                        <p>
                          {c.status === "pending"
                            ? "正在生成并校验课件依据，审核后开放。"
                            : "概念 · 机制 · 辨析 · 应用 · 权衡"}
                        </p>
                        <div className="card-bottom">
                          <span>
                            {c.status === "ready"
                              ? `${c.questionCount} 道题`
                              : "尚未开放"}
                          </span>
                          {c.status === "ready" && (
                            <button
                              disabled={busy}
                              className="link"
                              onClick={() =>
                                unfinished ? open(unfinished) : start(c.id)
                              }
                            >
                              {unfinished ? "继续测评" : "开始测评"} ↗
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
            <div className="footnote-panel">
              <b>一个更诚实的学习刻度</b>
              <p>
                思考题用于自我反思，不进入正确率。用时只用于个人成绩榜同分排序，不代表理解能力。答题记录保存在当前浏览器，建议定期导出。
              </p>
            </div>
          </>
        )}
        {route === "quiz" &&
          (!active || !chapter || !q ? (
            <div className="empty">
              <h2>选择一章，开始探索</h2>
              <p>你可以从章节页继续未完成的测评。</p>
              <a href="#home" className="button primary">
                返回章节
              </a>
            </div>
          ) : (
            <>
              <div className="page-kicker">
                <a href="#home">← 章节目录</a>
                <span>
                  第 {chapter.id} 章 · {chapter.title}
                </span>
                <span className="pill">
                  本地练习{active.mode === "review" ? " / 错题重练" : ""}
                </span>
              </div>
              <div className="quiz-layout">
                <aside className="quiz-aside">
                  <div className="eyebrow">YOUR PROGRESS</div>
                  <h2>
                    {String(active.index + 1).padStart(2, "0")}
                    <small> / {active.questionIds.length}</small>
                  </h2>
                  <div className="progress">
                    <div
                      style={{
                        width: `${(Object.keys(active.answers).length / active.questionIds.length) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="question-dots">
                    {active.questionIds.map((id, i) => (
                      <span
                        key={id}
                        className={`${active.answers[id] ? "done" : ""} ${i === active.index ? "current" : ""}`}
                        aria-label={`第${i + 1}题${active.answers[id] ? "已提交" : ""}`}
                      >
                        {i + 1}
                      </span>
                    ))}
                  </div>
                  <p className="small">
                    提交后答案锁定。
                    <br />
                    先检验自己，再阅读依据。
                  </p>
                </aside>
                <section className="question-panel">
                  <div className="question-tags">
                    <span className="pill green">{names[q.type]}</span>
                    {q.dimension && <span>{dimensionNames[q.dimension]}</span>}
                    <span>{labels[q.difficulty] || q.difficulty}</span>
                  </div>
                  <h1 className="question-stem">{q.stem}</h1>
                  {q.type === "reflection" ? (
                    <>
                      <p className="muted">
                        写下你的推理，再对照参考要点自评。思考题不计分。
                      </p>
                      <textarea
                        aria-label="我的思考"
                        placeholder="用自己的话组织答案……"
                        value={reflection}
                        disabled={!!answer || busy}
                        onChange={(e) => setReflection(e.target.value)}
                        rows={7}
                      />
                      {!answer && (
                        <p className="small">提交后展开参考答案与自评清单。</p>
                      )}
                    </>
                  ) : (
                    <>
                      <fieldset className="options" disabled={!!answer || busy}>
                        <legend className="sr-only">
                          {q.type === "multiple"
                            ? "选择所有正确选项"
                            : "选择一个答案"}
                        </legend>
                        {(
                          active.optionOrders[q.id] ||
                          q.options.map((o) => o.id)
                        ).map((id, i) => {
                          const o = q.options.find((o) => o.id === id);
                          if (!o) return null;
                          return (
                            <label
                              key={id}
                              className={`option ${selected.includes(id) ? "selected" : ""} ${answer && q.answerIds.includes(id) ? "correct" : ""} ${answer && selected.includes(id) && !q.answerIds.includes(id) ? "wrong" : ""}`}
                            >
                              <input
                                type={
                                  q.type === "single" ? "radio" : "checkbox"
                                }
                                name={q.id}
                                checked={selected.includes(id)}
                                onChange={() =>
                                  setSelected(
                                    q.type === "single"
                                      ? [id]
                                      : selected.includes(id)
                                        ? selected.filter((s) => s !== id)
                                        : [...selected, id],
                                  )
                                }
                              />
                              <span className="option-letter">
                                {String.fromCharCode(65 + i)}
                              </span>
                              <span>{o.text}</span>
                              {answer && q.answerIds.includes(id) && (
                                <b aria-label="正确选项">✓</b>
                              )}
                            </label>
                          );
                        })}
                      </fieldset>
                      <div className="confidence">
                        <span>你有多确定？（可选）</span>
                        {(
                          [
                            ["sure", "很确定"],
                            ["unsure", "不太确定"],
                            ["guess", "凭直觉"],
                          ] as const
                        ).map(([value, label]) => (
                          <button
                            key={value}
                            className={confidence === value ? "chosen" : ""}
                            aria-pressed={confidence === value}
                            disabled={!!answer || busy}
                            onClick={() => setConfidence(value)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {answer && (
                    <div className="feedback" aria-live="polite">
                      <div className="feedback-title">
                        {q.type === "reflection"
                          ? "留给自己的思考"
                          : correct(q, answer.selectedIds)
                            ? "✓ 回答正确"
                            : "○ 找到了一处可以深入的地方"}
                      </div>
                      <p>
                        {q.type === "reflection"
                          ? q.referenceAnswer
                          : q.explanation}
                      </p>
                      {q.type === "reflection" ? (
                        <div className="rubric">
                          <b>对照要点，自我检查</b>
                          {(q.rubric || []).map((item, i) => (
                            <label key={i}>
                              <input
                                type="checkbox"
                                checked={checks.includes(i)}
                                onChange={(e) => {
                                  const v = e.target.checked
                                    ? [...checks, i]
                                    : checks.filter((x) => x !== i);
                                  setChecks(v);
                                  put({
                                    ...active,
                                    answers: {
                                      ...active.answers,
                                      [q.id]: { ...answer, selfChecked: v },
                                    },
                                  });
                                }}
                              />
                              {item}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <details>
                          <summary>逐项理解：为什么选 / 不选</summary>
                          {q.options.map((o) => (
                            <p key={o.id}>
                              <b>{o.text}</b>
                              <br />
                              {q.optionExplanations[o.id]}
                            </p>
                          ))}
                        </details>
                      )}
                      <div className="source-title">回到课件 · 原文依据</div>
                      {q.evidence.map((e, i) => (
                        <blockquote key={i}>
                          <p>{quoteText(e.quote)}</p>
                          <cite>
                            {e.url ? (
                              <a href={e.url} target="_blank" rel="noreferrer">
                                {e.section} ↗
                              </a>
                            ) : (
                              e.section
                            )}
                          </cite>
                        </blockquote>
                      ))}
                      <details>
                        <summary>这道题在检验什么？</summary>
                        <p>{q.design.purpose}</p>
                        {q.design.misconception && (
                          <p>可能的混淆：{q.design.misconception}</p>
                        )}
                      </details>
                    </div>
                  )}
                  <div className="question-actions">
                    {q.type === "reflection" && !answer && (
                      <button className="link" disabled={busy} onClick={next}>
                        暂时跳过
                      </button>
                    )}
                    <span className="small">
                      {answer
                        ? "已提交 · 答案已锁定"
                        : q.type === "multiple"
                          ? "多选题：少选、多选均不得分"
                          : "按自己的理解作答"}
                    </span>
                    {answer ? (
                      <button
                        className="button primary"
                        disabled={busy}
                        onClick={next}
                      >
                        {active.index + 1 === active.questionIds.length ||
                        (chapter &&
                          completeObjectives(chapter, active) &&
                          q.type !== "reflection")
                          ? "查看学习诊断"
                          : "下一题"}{" "}
                        →
                      </button>
                    ) : (
                      <button
                        className="button primary"
                        disabled={
                          busy ||
                          (q.type === "reflection"
                            ? !reflection.trim()
                            : !selected.length)
                        }
                        onClick={submit}
                      >
                        {busy ? "提交中…" : "提交答案"}
                      </button>
                    )}
                  </div>
                </section>
              </div>
            </>
          ))}
        {route === "result" &&
          (!active || !chapter || !result || !rows ? (
            <div className="empty">
              <h2>还没有选择测评记录</h2>
              <a href="#history">前往学习记录 →</a>
            </div>
          ) : (
            <>
              <div className="page-kicker">
                <a href="#history">← 学习记录</a>
                <span>
                  第 {chapter.id} 章 · {chapter.title}
                </span>
                <span className="pill">
                  {active.mode === "review" ? "错题重练" : "完整测评"} /{" "}
                  {active.version.slice(0, 12)}
                </span>
              </div>
              <div className="result-heading">
                <div>
                  <div className="eyebrow">LEARNING DIAGNOSIS</div>
                  <h1>看见掌握，也看见空间。</h1>
                  <p>诊断基于本次客观题作答，反映这份题库覆盖的知识。</p>
                </div>
                <div className="score-circle">
                  <strong>
                    {result.pct}
                    <small>%</small>
                  </strong>
                  <span>客观题正确率</span>
                </div>
              </div>
              <div className="result-stats">
                <span>
                  答对{" "}
                  <b>
                    {result.hits} / {result.total}
                  </b>{" "}
                  道
                </span>
                <span>
                  客观题用时 <b>{duration(result.elapsedMs)}</b>
                </span>
                <span>
                  思考题 <b>不计分</b>
                </span>
              </div>
              <div className="diagnosis-grid">
                <section className="paper-panel">
                  <h2>五维知识画像</h2>
                  <Radar
                    rows={rows}
                    prior={active.mode === "full" ? prior : null}
                  />
                  <p className="small">
                    ≥80% 优势 · 60–79% 需巩固 · &lt;60% 优先复习
                    <br />
                    每个维度少于 3 题标记样本不足。
                  </p>
                </section>
                <section className="paper-panel">
                  <h2>下一步，学得更具体</h2>
                  {rows.map((r, i) => (
                    <div className="dimension-row" key={r.key}>
                      <div>
                        <b>{dimensionNames[r.key]}</b>
                        <span
                          className={`status-text ${r.sufficient && r.pct < 60 ? "warm" : ""}`}
                        >
                          {r.label}
                        </span>
                      </div>
                      <div className="dimension-bar">
                        <span style={{ width: `${r.pct}%` }} />
                      </div>
                      <div className="small">
                        证据 {r.total} 题 · 正确 {r.hits} 题{" "}
                        {r.sufficient ? `· ${r.pct}%` : ""}
                        {prior &&
                        active.mode === "full" &&
                        r.sufficient &&
                        prior[i].sufficient
                          ? ` · 较上次 ${r.pct - prior[i].pct >= 0 ? "+" : ""}${r.pct - prior[i].pct} 个百分点`
                          : ""}
                      </div>
                    </div>
                  ))}
                </section>
              </div>
              <section className="paper-panel">
                <h2>知识点证据</h2>
                <p className="small">
                  这些是本次作答的具体证据，不等同于对整个知识点的掌握判断。
                </p>
                <div className="objective-grid">
                  {objectiveEvidence(chapter, active).map((o) => (
                    <article className="objective-card" key={o.id}>
                      <h3>{o.title}</h3>
                      <p>
                        本次答对 {o.hits} 题 · 答错 {o.answered - o.hits} 题
                      </p>
                      <span className="small">
                        已作答 {o.answered} / 覆盖 {o.total} 题
                        {o.answered === 0 ? " · 暂无作答证据" : ""}
                      </span>
                      <div>
                        {[...new Set(o.sections)].map((section) => (
                          <a
                            className="small"
                            key={section}
                            href={chapter.source.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {section} ↗{" "}
                          </a>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
              <section className="paper-panel">
                <h2>
                  优先复习这 {recommendations(chapter, active).length} 个问题
                </h2>
                <p className="small">
                  先看确定但答错的问题，再看其他错题，最后巩固答对但犹豫的问题。
                </p>
                {recommendations(chapter, active).map((q) => (
                  <div className="recommendation" key={q.id}>
                    <h3>{q.stem}</h3>
                    <p>{q.explanation}</p>
                    {q.evidence.map((e, i) => (
                      <a
                        className="small"
                        href={e.url}
                        target="_blank"
                        rel="noreferrer"
                        key={i}
                      >
                        重读：{e.section} ↗{" "}
                      </a>
                    ))}
                  </div>
                ))}
              </section>
              <section className="paper-panel review-panel">
                <h2>复习线索</h2>
                {chapter.questions
                  .filter(
                    (q) =>
                      q.type !== "reflection" &&
                      active.answers[q.id] &&
                      (!correct(q, active.answers[q.id].selectedIds) ||
                        ["unsure", "guess"].includes(
                          active.answers[q.id].confidence || "",
                        )),
                  )
                  .map((q) => (
                    <details key={q.id}>
                      <summary>
                        <span className="pill">
                          {correct(q, active.answers[q.id].selectedIds)
                            ? "信心待巩固"
                            : "错题"}
                        </span>{" "}
                        {q.stem}
                      </summary>
                      <p>{q.explanation}</p>
                      {q.evidence.map((e, i) => (
                        <blockquote key={i}>
                          {quoteText(e.quote)}
                          <cite>
                            <a href={e.url} target="_blank" rel="noreferrer">
                              {e.section} ↗
                            </a>
                          </cite>
                        </blockquote>
                      ))}
                    </details>
                  ))}
                {result.hits === result.total && (
                  <p>
                    客观题全部答对。可以回到课件，用自己的例子讲清每个机制。
                  </p>
                )}
                <div className="result-actions">
                  <button
                    className="button"
                    disabled={
                      busy ||
                      !chapter.questions.some(
                        (q) =>
                          active.answers[q.id] &&
                          ["unsure", "guess"].includes(
                            active.answers[q.id].confidence || "",
                          ),
                      )
                    }
                    onClick={() =>
                      start(chapter.id, "review", active, "uncertain")
                    }
                  >
                    犹豫题重练
                  </button>
                  <button
                    className="button primary"
                    disabled={busy || result.hits === result.total}
                    onClick={() => start(chapter.id, "review", active)}
                  >
                    错题重练 →
                  </button>
                  <button
                    className="button"
                    disabled={busy}
                    onClick={() => start(chapter.id)}
                  >
                    重新完整测评
                  </button>
                  <button className="link" onClick={exportMarkdown}>
                    Markdown 复盘 ↓
                  </button>
                  <button className="link" onClick={exportRecords}>
                    JSON 备份 ↓
                  </button>
                </div>
              </section>
              {active.mode === "full" && (
                <section className="paper-panel">
                  <h2>思考笔记 · 可选，不计分</h2>
                  <p className="small">
                    这部分只保存在当前浏览器，写下推理后可对照参考要点自评。
                  </p>
                  {chapter.questions
                    .filter((q) => q.type === "reflection")
                    .map((q) => (
                      <details key={q.id}>
                        <summary>{q.stem}</summary>
                        <h3>我的思考</h3>
                        <p style={{ whiteSpace: "pre-wrap" }}>
                          {active.answers[q.id]?.reflectionText || "尚未填写"}
                        </p>
                        {active.answers[q.id] && (
                          <>
                            <h3>参考要点</h3>
                            <p style={{ whiteSpace: "pre-wrap" }}>
                              {q.referenceAnswer}
                            </p>
                            {q.rubric?.map((r, i) => (
                              <p key={i}>
                                {active.answers[q.id].selfChecked?.includes(i)
                                  ? "☑"
                                  : "☐"}{" "}
                                {r}
                              </p>
                            ))}
                          </>
                        )}
                      </details>
                    ))}
                  <button
                    className="button"
                    onClick={() => {
                      const reflectionQ =
                        chapter.questions.find(
                          (q) =>
                            q.type === "reflection" && !active.answers[q.id],
                        ) ||
                        chapter.questions.find((q) => q.type === "reflection");
                      if (reflectionQ) {
                        put({
                          ...active,
                          index: active.questionIds.indexOf(reflectionQ.id),
                          activeStartedAt: Date.now(),
                        });
                        go("quiz");
                      }
                    }}
                  >
                    继续思考与自评 →
                  </button>
                </section>
              )}
            </>
          ))}
        {route === "history" && (
          <>
            <div className="section-heading page-heading">
              <div>
                <div className="eyebrow">LEARNING JOURNAL</div>
                <h1>每一次思考，都算数。</h1>
                <p className="muted">
                  记录保存在此浏览器，清除浏览器数据会删除记录。
                  相同题库版本的完整测评可比较。
                </p>
              </div>
              <button className="button" onClick={exportRecords}>
                导出记录 ↓
              </button>
            </div>
            {!attempts.length ? (
              <div className="empty">
                <span className="empty-symbol">✧</span>
                <h2>你的学习记录，从第一题开始</h2>
                <p>选择熟悉的一章，看看自己掌握到了哪里。</p>
                <a className="button primary" href="#home">
                  选择章节 ↗
                </a>
              </div>
            ) : (
              <div className="history-list">
                {[...attempts]
                  .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
                  .map((a) => (
                    <article key={a.id}>
                      <div className="history-number">
                        {String(a.chapterId).padStart(2, "0")}
                      </div>
                      <div>
                        <h3>
                          {manifest.find((c) => c.id === a.chapterId)?.title ||
                            `第 ${a.chapterId} 章`}
                        </h3>
                        <p>
                          {date(a.startedAt)} ·{" "}
                          {a.mode === "review" ? "错题重练" : "完整测评"} · 本地
                          · 版本 {a.version.slice(0, 10)}
                        </p>
                      </div>
                      <span className="pill">
                        {a.completedAt
                          ? "已完成"
                          : `进行中 ${Object.keys(a.answers).length}/${a.questionIds.length}`}
                      </span>
                      <button
                        disabled={busy}
                        className="link"
                        onClick={() => open(a)}
                      >
                        {a.completedAt ? "查看诊断" : "继续作答"} →
                      </button>
                    </article>
                  ))}
              </div>
            )}
          </>
        )}
        {route === "method" && (
          <>
            <div className="page-heading">
              <div className="eyebrow">BEHIND THE QUESTIONS</div>
              <h1>每一道题，都有来处。</h1>
              <p className="muted">
                学习目标决定问题，课件原文支撑答案。这里公开真实使用的出题蓝图。
              </p>
            </div>
            <div className="footnote-panel">
              <b>题库如何形成</b>
              <p>
                NotebookLM
                基于指定章节来源生成初稿，再经过编辑与课件核验，整理题干、选项、解析及原文引用。页面展示的是核验后的题库；原始生成产物与来源标识保留用于追溯，具体校验状态见本章记录。
              </p>
              <p className="small">
                课件来自 <a href="https://github.com/datawhalechina/hello-agents" target="_blank" rel="noreferrer">Datawhale Hello-Agents</a>。
                课件摘录与整理题库按 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noreferrer">CC BY-NC-SA 4.0</a> 署名、非商业、相同方式共享。
                这是辅助学习材料；难度为出题时的预设，尚未经实际作答数据校准。
              </p>
            </div>
            <div className="method-intro">
              <div>
                <span>01</span>
                <h3>先定义学习目标</h3>
                <p>从章节原文抽取可检验的目标，解释为什么值得检验。</p>
              </div>
              <div>
                <span>02</span>
                <h3>再安排问题槽位</h3>
                <p>平衡五个维度、认知层次与难度，避免只考记忆。</p>
              </div>
              <div>
                <span>03</span>
                <h3>逐题回到原文</h3>
                <p>保存来源与版本。展示引用和干扰项解释，支持追溯。</p>
              </div>
            </div>
            {picker}
            {chapters[selectedChapter] &&
              (() => {
                const ch = chapters[selectedChapter];
                return (
                  <>
                    <section className="paper-panel">
                      <h2>第 {ch.id} 章 · 学习目标</h2>
                      {ch.blueprint.objectives.map((o, i) => (
                        <div className="objective" key={o.id}>
                          <span>{String(i + 1).padStart(2, "0")}</span>
                          <div>
                            <h3>{o.title}</h3>
                            <p>{o.reason}</p>
                            <small>{o.sections.join(" / ")}</small>
                          </div>
                        </div>
                      ))}
                      <p>{ch.blueprint.notes}</p>
                    </section>
                    <section className="paper-panel">
                      <h2>实际出题槽位 · {ch.blueprint.slots.length} 题</h2>
                      <div className="table-scroll">
                        <table>
                          <thead>
                            <tr>
                              <th>题号</th>
                              <th>题型 / 维度</th>
                              <th>认知 / 难度</th>
                              <th>章节依据</th>
                              <th>检验目的</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ch.blueprint.slots.map((s, i) => (
                              <tr key={s.id}>
                                <td>{String(i + 1).padStart(2, "0")}</td>
                                <td>
                                  {names[s.type as keyof typeof names] ||
                                    s.type}
                                  <small>
                                    {s.dimension
                                      ? dimensionNames[s.dimension]
                                      : "自我反思"}
                                  </small>
                                </td>
                                <td>
                                  {labels[s.level] || s.level}
                                  <small>
                                    {labels[s.difficulty] || s.difficulty}
                                  </small>
                                </td>
                                <td>{s.section}</td>
                                <td>{s.purpose}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                    <section className="provenance">
                      <h2>来源与校验记录</h2>
                      <p>
                        <a
                          href={ch.source.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {ch.source.title} ↗
                        </a>
                      </p>
                      <dl>
                        <dt>题库版本</dt>
                        <dd>{ch.version}</dd>
                        <dt>原文 SHA-256</dt>
                        <dd>{ch.source.sha256}</dd>
                        <dt>NotebookLM 来源</dt>
                        <dd>{ch.source.sourceId}</dd>
                        <dt>生成产物</dt>
                        <dd>{ch.source.artifactId}</dd>
                        <dt>校验状态</dt>
                        <dd>
                          {ch.review.status} ·{" "}
                          {ch.review.checkedAt || "未记录时间"}
                        </dd>
                      </dl>
                      {ch.review.notes.map((n, i) => (
                        <p className="small" key={i}>
                          {n}
                        </p>
                      ))}
                    </section>
                  </>
                );
              })()}
          </>
        )}
        {route === "leaderboard" && (
          <>
            <div className="page-heading">
              <div className="eyebrow">PERSONAL BEST</div>
              <h1>和过去的自己，一起向前。</h1>
              <p className="muted">
                个人成绩榜保存在此浏览器。每章、每个题库版本独立比较，正确率优先，同分按客观题用时排序。
              </p>
            </div>
            {picker}
            <div className="footnote-panel">
              <b>只比较完整测评</b>
              <p>
                错题重练保留在学习记录中，不参与成绩榜。速度只用于同分排序，不计入五维诊断。这是你的本地个人记录，不是公开排名。
              </p>
            </div>
            {(() => {
              const ch = chapters[selectedChapter];
              const records = ch
                ? finished
                    .filter(
                      (a) =>
                        a.chapterId === selectedChapter &&
                        a.version === ch.version &&
                        a.mode === "full" &&
                        completeObjectives(ch, a),
                    )
                    .map((a) => ({ a, s: score(ch, a) }))
                    .sort(
                      (a, b) =>
                        b.s.pct - a.s.pct || a.s.elapsedMs - b.s.elapsedMs,
                    )
                : [];
              return !records.length ? (
                <div className="empty">
                  <span className="empty-symbol">◎</span>
                  <h2>这一版本还没有完整测评记录</h2>
                  <p>完成本章测评后，在这里查看个人最佳与历次表现。</p>
                  <button
                    className="button primary"
                    disabled={busy || !ch}
                    onClick={() => start(selectedChapter)}
                  >
                    开始本章测评 ↗
                  </button>
                </div>
              ) : (
                <section className="paper-panel table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>顺序</th>
                        <th>完成时间</th>
                        <th>正确率</th>
                        <th>客观题用时</th>
                        <th>记录</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map(({ a, s }, i) => (
                        <tr key={a.id}>
                          <td>
                            {i === 0
                              ? "个人最佳"
                              : String(i + 1).padStart(2, "0")}
                          </td>
                          <td>{date(a.completedAt!)}</td>
                          <td>
                            {s.pct}%{" "}
                            <small>
                              {s.hits}/{s.total}
                            </small>
                          </td>
                          <td>{duration(s.elapsedMs)}</td>
                          <td>
                            <button
                              className="link"
                              disabled={busy}
                              onClick={() => open(a)}
                            >
                              查看诊断 →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              );
            })()}
          </>
        )}
        {![
          "home",
          "quiz",
          "result",
          "history",
          "method",
          "leaderboard",
        ].includes(route) && (
          <div className="empty">
            <h2>这一页还没有内容</h2>
            <a href="#home">返回章节目录</a>
          </div>
        )}
      </main>
      <footer>
        <a className="footer-brand" href="#home">
          Hello-Agents <span>学习测评</span>
        </a>
        <span>理解有依据，进步有方向。</span>
        <a href="#method">关于测评 →</a>
      </footer>
    </>
  );
}
