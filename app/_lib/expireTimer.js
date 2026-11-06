// disappearing message timer presets, matching the Signal client
export const EXPIRE_TIMER_OPTIONS = [
  { label: "Off", value: 0 },
  { label: "30 seconds", value: 30 },
  { label: "5 minutes", value: 300 },
  { label: "1 hour", value: 3600 },
  { label: "8 hours", value: 28800 },
  { label: "1 day", value: 86400 },
  { label: "1 week", value: 604800 },
  { label: "4 weeks", value: 2419200 },
];

export const EXPIRE_TIMER_UNITS = [
  { label: "Seconds", value: 1 },
  { label: "Minutes", value: 60 },
  { label: "Hours", value: 3600 },
  { label: "Days", value: 86400 },
  { label: "Weeks", value: 604800 },
];

// expire_timer is a u32 on the bitpart server, but it's stored in a postgres
// integer column, so cap it at the smaller of the two
export const MAX_EXPIRE_TIMER = 2147483647;

// convert the form fields to a number of seconds, or null if invalid
export const expireTimerSeconds = ({
  expireTimer,
  expireTimerCustomValue,
  expireTimerCustomUnit,
}) => {
  if (expireTimer === undefined || expireTimer === null || expireTimer === "") {
    return 0;
  }

  // already stored on the bot
  if (typeof expireTimer === "number") {
    return Number.isInteger(expireTimer) &&
      expireTimer >= 0 &&
      expireTimer <= MAX_EXPIRE_TIMER
      ? expireTimer
      : null;
  }

  if (expireTimer === "custom") {
    const amount = Number(expireTimerCustomValue);
    const unit = Number(expireTimerCustomUnit);

    if (
      !Number.isInteger(amount) ||
      amount <= 0 ||
      !EXPIRE_TIMER_UNITS.some((u) => u.value === unit)
    ) {
      return null;
    }

    const seconds = amount * unit;
    return seconds <= MAX_EXPIRE_TIMER ? seconds : null;
  }

  const seconds = Number(expireTimer);
  return EXPIRE_TIMER_OPTIONS.some((o) => o.value === seconds) ? seconds : null;
};

export const formatExpireTimer = (seconds) => {
  const value = Number(seconds) || 0;
  const preset = EXPIRE_TIMER_OPTIONS.find((o) => o.value === value);

  if (preset) {
    return preset.label;
  }

  const unit = [...EXPIRE_TIMER_UNITS]
    .reverse()
    .find((u) => value % u.value === 0);
  const amount = value / unit.value;
  const name = unit.label.toLowerCase();

  return `${amount} ${amount === 1 ? name.slice(0, -1) : name}`;
};
