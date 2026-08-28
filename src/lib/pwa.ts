export function isIosDevice(userAgent: string = ""): boolean {
  return /iPad|iPhone|iPod/.test(userAgent);
}

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const media = window.matchMedia("(display-mode: standalone)").matches;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return media || nav.standalone === true;
}

export function iosNeedsInstall(userAgent: string = ""): boolean {
  return isIosDevice(userAgent) && !isStandaloneDisplay();
}

export type DevicePlatform = "web" | "ios-pwa" | "android";

export function detectPlatform(userAgent: string = ""): DevicePlatform {
  if (isIosDevice(userAgent) && isStandaloneDisplay()) return "ios-pwa";
  if (/Android/i.test(userAgent)) return "android";
  return "web";
}

export function deviceId(): string {
  if (typeof window === "undefined") return "server";
  const key = "mohamed.deviceId";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const next = crypto.randomUUID();
  window.localStorage.setItem(key, next);
  return next;
}
