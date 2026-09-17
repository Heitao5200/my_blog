// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import rawChapter from "../public/data/chapter-1.json";
import type { Chapter } from "./types";
import { makeAttempt, storageKey } from "./model";
const chapter = rawChapter as unknown as Chapter;
beforeEach(() => {
  localStorage.clear();
  location.hash = "home";
  window.scrollTo = vi.fn();
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => ({
      ok: true,
      json: async () =>
        url.includes("manifest")
          ? {
              chapters: [
                {
                  id: 1,
                  title: chapter.title,
                  version: chapter.version,
                  status: "ready",
                  file: "chapter-1.json",
                  questionCount: 20,
                },
              ],
            }
          : chapter,
    })),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("local learning flow", () => {
  it("restores the active chapter in the score picker when several chapters are ready", async () => {
    const second = { ...chapter, id: 2, title: "第二章" };
    const a = makeAttempt(second, "full");
    localStorage.setItem(storageKey("guest"), JSON.stringify([a]));
    localStorage.setItem("hello-agents:active", a.id);
    location.hash = "leaderboard";
    vi.stubGlobal("fetch", vi.fn(async (url: string) => ({
      ok: true,
      json: async () => url.includes("manifest")
        ? { chapters: [chapter, second].map((c) => ({ id: c.id, title: c.title, version: c.version, status: "ready", file: `chapter-${c.id}.json`, questionCount: 20 })) }
        : url.includes("chapter-2") ? second : chapter,
    })));
    render(<App />);
    await waitFor(() => expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("2"));
  });
  it("allows optional confidence, locks submitted answers, completes after18 and keeps thoughts optional", async () => {
    const user = userEvent.setup({ delay: null });
    render(<App />);
    await user.click(await screen.findByRole("button", { name: "开始测评 ↗" }));
    for (let i = 0; i < 18; i++) {
      const q = chapter.questions[i];
      await screen.findByRole("heading", { name: q.stem });
      for (const id of q.answerIds) {
        const option = q.options.find((o) => o.id === id)!;
        await user.click(
          screen.getByRole(q.type === "single" ? "radio" : "checkbox", {
            name: new RegExp(
              option.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            ),
          }),
        );
      }
      const submit = screen.getByRole("button", { name: "提交答案" });
      expect((submit as HTMLButtonElement).disabled).toBe(false);
      await user.click(submit);
      expect(
        (
          screen.getAllByRole(
            q.type === "single" ? "radio" : "checkbox",
          )[0] as HTMLInputElement
        ).disabled ||
          (
            screen
              .getAllByRole(q.type === "single" ? "radio" : "checkbox")[0]
              .closest("fieldset") as HTMLFieldSetElement
          ).disabled,
      ).toBe(true);
      await user.click(
        screen.getByRole("button", {
          name: i === 17 ? "查看学习诊断 →" : "下一题 →",
        }),
      );
    }
    await screen.findByRole("heading", { name: "看见掌握，也看见空间。" });
    const saved = JSON.parse(localStorage.getItem(storageKey("guest"))!)[0];
    expect(saved.completedAt).toBeTruthy();
    expect(Object.keys(saved.answers)).toHaveLength(18);
    expect(saved.answers[chapter.questions[0].id].confidence).toBeNull();
    expect(screen.getByRole("heading", { name: "知识点证据" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "继续思考与自评 →" }));
    await screen.findByRole("heading", { name: chapter.questions[18].stem });
    await user.click(screen.getByRole("button", { name: "暂时跳过" }));
    await screen.findByRole("heading", { name: chapter.questions[19].stem });
    await user.type(
      screen.getByRole("textbox", { name: "我的思考" }),
      "我自己的推理",
    );
    await user.click(screen.getByRole("button", { name: "提交答案" }));
    await user.click(screen.getAllByRole("checkbox")[0]);
    await user.click(screen.getByRole("button", { name: "查看学习诊断 →" }));
    await screen.findByRole("heading", { name: "看见掌握，也看见空间。" });
    const updated = JSON.parse(localStorage.getItem(storageKey("guest"))!)[0];
    expect(updated.answers[chapter.questions[19].id].reflectionText).toBe(
      "我自己的推理",
    );
    expect(updated.answers[chapter.questions[19].id].selfChecked).toEqual([0]);
    expect(updated.completedAt).toBe(saved.completedAt);
  }, 15000);
  it("blocks stale-version restored records and excludes partial completions from personal best", async () => {
    const a = makeAttempt(chapter, "full");
    a.version = "obsolete";
    localStorage.setItem(storageKey("guest"), JSON.stringify([a]));
    localStorage.setItem("hello-agents:active", a.id);
    location.hash = "quiz";
    render(<App />);
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: chapter.questions[0].stem }),
    ).toBeNull();
  });
  it("never ranks an incomplete objective record even if marked completed", async () => {
    const a = makeAttempt(chapter, "full");
    const q = chapter.questions[0];
    a.questionIds = [q.id];
    a.completedAt = new Date().toISOString();
    a.answers[q.id] = {
      selectedIds: q.answerIds,
      confidence: null,
      elapsedMs: 100,
      submittedAt: a.completedAt,
    };
    localStorage.setItem(storageKey("guest"), JSON.stringify([a]));
    location.hash = "leaderboard";
    render(<App />);
    await screen.findByRole("heading", { name: "这一版本还没有完整测评记录" });
    expect(screen.queryByText("个人最佳")).toBeNull();
  });
});
