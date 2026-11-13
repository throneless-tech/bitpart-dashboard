import { describe, expect, it } from "vitest";
import {
  isPlaceholderEmail,
  newPlaceholderEmail,
  realEmail,
} from "./placeholderEmail";

describe("placeholder emails", () => {
  it("makes unique placeholders on the reserved domain", () => {
    const a = newPlaceholderEmail();

    expect(a).toMatch(/^[0-9a-f-]{36}@no-email\.invalid$/);
    expect(newPlaceholderEmail()).not.toBe(a);
    expect(isPlaceholderEmail(a)).toBe(true);
    expect(isPlaceholderEmail(a.toUpperCase())).toBe(true);
  });

  it("only treats the reserved domain as a placeholder", () => {
    expect(isPlaceholderEmail("alice@mail.org")).toBe(false);
    expect(isPlaceholderEmail(null)).toBe(false);
  });

  it("gives the real email or null", () => {
    expect(realEmail({ email: "alice@mail.org" })).toBe("alice@mail.org");
    expect(realEmail({ email: newPlaceholderEmail() })).toBeNull();
    expect(realEmail({ email: null })).toBeNull();
    expect(realEmail(null)).toBeNull();
  });
});
