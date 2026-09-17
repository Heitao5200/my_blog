export const dimensions = [
  "concept",
  "mechanism",
  "comparison",
  "application",
  "tradeoff",
] as const;
export type Dimension = (typeof dimensions)[number];
export const dimensionNames: Record<Dimension, string> = {
  concept: "概念理解",
  mechanism: "机制推演",
  comparison: "关联辨析",
  application: "场景应用",
  tradeoff: "权衡判断",
};
export type Question = {
  id: string;
  type: "single" | "multiple" | "reflection";
  objectiveId: string;
  dimension: Dimension | null;
  level: string;
  difficulty: string;
  stem: string;
  options: { id: string; text: string }[];
  answerIds: string[];
  explanation: string;
  optionExplanations: Record<string, string>;
  evidence: { section: string; quote: string; url: string }[];
  design: { purpose: string; misconception: string };
  referenceAnswer?: string;
  rubric?: string[];
};
export type ChapterMeta = {
  id: number;
  title: string;
  version: string;
  status: "ready" | "pending";
  file: string;
  questionCount: number;
};
export type Chapter = {
  id: number;
  title: string;
  version: string;
  source: {
    title: string;
    path: string;
    url: string;
    sha256: string;
    notebookId: string;
    sourceId: string;
    artifactId: string;
  };
  blueprint: {
    objectives: {
      id: string;
      title: string;
      sections: string[];
      reason: string;
    }[];
    slots: {
      id: string;
      type: string;
      objectiveId: string;
      dimension: Dimension | null;
      level: string;
      difficulty: string;
      section: string;
      purpose: string;
    }[];
    notes: string;
  };
  review: { status: string; checkedAt: string; notes: string[] };
  questions: Question[];
};
export type Answer = {
  selectedIds: string[];
  confidence: "sure" | "unsure" | "guess" | null;
  elapsedMs: number;
  submittedAt: string;
  reflectionText?: string;
  selfChecked?: number[];
};
export type Attempt = {
  id: string;
  chapterId: number;
  version: string;
  mode: "full" | "review";
  questionIds: string[];
  index: number;
  answers: Record<string, Answer>;
  startedAt: string;
  completedAt: string | null;
  source: "local";
  activeStartedAt: number | null;
  optionOrders: Record<string, string[]>;
};
