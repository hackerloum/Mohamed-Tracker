/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & typeof globalThis & WorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

self.addEventListener("push", (event) => {
  const payload = event.data
    ? (event.data.json() as {
        notification?: { title?: string; body?: string };
        data?: { url?: string };
      })
    : undefined;
  const title = payload?.notification?.title ?? "Mohamed";
  const body = payload?.notification?.body ?? "";
  const url = payload?.data?.url ?? "/today";
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      data: { url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url =
    (event.notification.data as { url?: string } | undefined)?.url ?? "/today";
  event.waitUntil(self.clients.openWindow(url));
});

serwist.addEventListeners();
