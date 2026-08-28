const MAX_DIGITS = 12;

function assertInteger(value: number, label: string): void {
  if (!Number.isInteger(value)) {
    throw new Error(`${label} must be an integer number of TZS`);
  }
}

export function addTzs(a: number, b: number): number {
  assertInteger(a, "left");
  assertInteger(b, "right");
  return a + b;
}

export function subtractTzs(a: number, b: number): number {
  assertInteger(a, "left");
  assertInteger(b, "right");
  return a - b;
}

export function formatTzs(
  amount: number,
  options: { withCode?: boolean } = {},
): string {
  assertInteger(amount, "amount");
  const formatted = new Intl.NumberFormat("en-TZ", {
    maximumFractionDigits: 0,
  }).format(amount);
  return options.withCode ? `TZS ${formatted}` : formatted;
}

export function parseKeypadDigits(digits: string): number {
  if (digits.length === 0) return 0;
  if (!/^\d+$/.test(digits)) {
    throw new Error("keypad input must be an integer digit string");
  }
  return Number.parseInt(digits, 10);
}

export function appendKeypadDigit(current: string, digit: string): string {
  if (!/^\d$/.test(digit)) return current;
  if (current === "0") return digit === "0" ? "0" : digit;
  if (current.length >= MAX_DIGITS) return current;
  return `${current}${digit}`;
}

export function backspaceKeypad(current: string): string {
  if (current.length <= 1) return "";
  return current.slice(0, -1);
}
