import { describe, expect, it } from "vitest";

import {
  EXPIRE_TIMER_OPTIONS,
  MAX_EXPIRE_TIMER,
  expireTimerSeconds,
  formatExpireTimer,
} from "./expireTimer";

describe("expireTimerSeconds", () => {
  it("defaults to off when no timer is chosen", () => {
    expect(expireTimerSeconds({})).toBe(0);
    expect(expireTimerSeconds({ expireTimer: "" })).toBe(0);
  });

  it("converts each preset from the form's string value", () => {
    EXPIRE_TIMER_OPTIONS.forEach(({ value }) => {
      expect(expireTimerSeconds({ expireTimer: String(value) })).toBe(value);
    });
  });

  it("rejects a value that isn't a preset", () => {
    expect(expireTimerSeconds({ expireTimer: "42" })).toBeNull();
  });

  it("multiplies a custom amount by its unit", () => {
    expect(
      expireTimerSeconds({
        expireTimer: "custom",
        expireTimerCustomValue: "3",
        expireTimerCustomUnit: "86400",
      }),
    ).toBe(259200);
  });

  it("rejects custom amounts that aren't positive whole numbers", () => {
    ["0", "-1", "1.5", "abc", ""].forEach((amount) => {
      expect(
        expireTimerSeconds({
          expireTimer: "custom",
          expireTimerCustomValue: amount,
          expireTimerCustomUnit: "60",
        }),
      ).toBeNull();
    });
  });

  it("rejects an unknown custom unit", () => {
    expect(
      expireTimerSeconds({
        expireTimer: "custom",
        expireTimerCustomValue: "1",
        expireTimerCustomUnit: "7",
      }),
    ).toBeNull();
  });

  it("rejects custom timers larger than the database column allows", () => {
    expect(
      expireTimerSeconds({
        expireTimer: "custom",
        expireTimerCustomValue: String(MAX_EXPIRE_TIMER + 1),
        expireTimerCustomUnit: "1",
      }),
    ).toBeNull();
  });

  it("accepts a number already stored on the bot", () => {
    expect(expireTimerSeconds({ expireTimer: 604800 })).toBe(604800);
  });
});

describe("formatExpireTimer", () => {
  it("uses the preset label", () => {
    expect(formatExpireTimer(0)).toBe("Off");
    expect(formatExpireTimer(604800)).toBe("1 week");
  });

  it("formats custom values in the largest whole unit", () => {
    expect(formatExpireTimer(259200)).toBe("3 days");
    expect(formatExpireTimer(120)).toBe("2 minutes");
    expect(formatExpireTimer(1209600)).toBe("2 weeks");
    expect(formatExpireTimer(45)).toBe("45 seconds");
  });
});
