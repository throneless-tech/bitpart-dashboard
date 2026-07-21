import { afterEach, describe, expect, it, vi } from "vitest";

// formatCsml reads its template from disk via fs.readFile; mock it so the
// template string is controlled by each test.
let template = "";

vi.mock("node:fs/promises", () => ({
  default: {
    readFile: vi.fn(async () => template),
  },
}));

import { formatCsml } from "./formatBot";

const setTemplate = (str) => {
  template = str;
};

afterEach(() => {
  template = "";
});

describe("formatCsml placeholder substitution", () => {
  it("replaces scalar fields and passcode", async () => {
    setTemplate("Hi [name], code [passcode], time [responseTime].");

    const result = await formatCsml(
      { botType: "helpdesk", name: "Acme", responseTime: "fast" },
      "ABC123",
    );

    expect(result).toBe("Hi Acme, code ABC123, time fast.");
  });

  it("replaces every occurrence of a scalar placeholder", async () => {
    setTemplate("[name] [name] [passcode] [passcode]");

    const result = await formatCsml({ botType: "vpn", name: "Acme" }, "XYZ");

    expect(result).toBe("Acme Acme XYZ XYZ");
  });
});

describe("formatCsml faq formatting", () => {
  it("builds a numbered question list and an if-chain of answers", async () => {
    setTemplate("[faq]\n---\n[faq.answers]\nLEN=[faq.length]");

    const result = await formatCsml(
      {
        botType: "broadcast",
        faq: [
          { question: "How do I start?", answer: "Tap begin." },
          { question: "Is it free?", answer: "Yes." },
        ],
      },
      "PC",
    );

    expect(result).toContain(
      "FAQ\n\nHere are some frequently asked questions. Does your question fall under one of these?\n",
    );
    expect(result).toContain("1. How do I start?\n");
    expect(result).toContain("2. Is it free?\n");
    expect(result).toContain("3. Other\n\nReply with the number.");
    expect(result).toContain("if (event == 1) {");
    expect(result).toContain('say "Tap begin."');
    expect(result).toContain('say "Yes."');
    expect(result).toContain("goto check_if_solved_step");
    expect(result).toContain("LEN=3");
  });

  it("emits an apology when faq is empty", async () => {
    setTemplate("[faq][faq.answers]");

    const result = await formatCsml({ botType: "broadcast", faq: [] }, "PC");

    expect(result).toBe("Apologies, no FAQ have been entered for this bot.");
  });
});

describe("formatCsml problems formatting", () => {
  it("builds a numbered problem list and an if-chain of solutions", async () => {
    setTemplate("[problems]\n---\n[problems.solutions]\nLEN=[problems.length]");

    const result = await formatCsml(
      {
        botType: "helpdesk",
        problems: [
          { problem: "App crashes", solution: "Reinstall it." },
          { problem: "No signal", solution: "Move location." },
        ],
      },
      "PC",
    );

    expect(result).toContain(
      "FAQ\n\nHere are some frequently asked questions. Does your question fall under one of these? If so, please enter the number:\n\n",
    );
    expect(result).toContain("1. App crashes\n");
    expect(result).toContain("2. No signal\n");
    expect(result).toContain("if (event == 1) {");
    expect(result).toContain('say "Reinstall it."');
    expect(result).toContain('say "Move location."');
    expect(result).toContain("LEN=3");
  });
});

describe("formatCsml locations formatting", () => {
  it("renders a numbered list for esim bots", async () => {
    setTemplate("[locations]\nLEN=[locations.length]");

    const result = await formatCsml(
      {
        botType: "esim",
        locations: [{ place: "NYC" }, { place: "LA" }],
      },
      "PC",
    );

    expect(result).toBe("\n1. NYC\n2. LA\nLEN=3");
  });

  it("renders a comma-joined list for vpn bots", async () => {
    setTemplate("[locations]\nLEN=[locations.length]");

    const result = await formatCsml(
      {
        botType: "vpn",
        locations: [{ place: "NYC" }, { place: "LA" }],
      },
      "PC",
    );

    expect(result).toBe("NYC, LA\nLEN=3");
  });
});
