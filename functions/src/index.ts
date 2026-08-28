import { setGlobalOptions } from "firebase-functions/v2";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { decideNotification } from "./notifications/engine";
import { sendPush } from "./notifications/send";
import { enqueueReminder, processUser, sweepDueJobs } from "./notifications/scheduler";

setGlobalOptions({ region: "us-central1", maxInstances: 2 });

export { decideNotification, sendPush, enqueueReminder, sweepDueJobs };

export const sweepNotifications = onSchedule(
  { schedule: "every 15 minutes", timeZone: "Africa/Dar_es_Salaam" },
  async () => {
    await sweepDueJobs();
  },
);

export const debugSendNotification = onCall(async (request) => {
  if (request.auth?.token?.owner !== true) {
    throw new HttpsError("permission-denied", "Owner only.");
  }
  const uid = request.auth.uid;
  return processUser(uid);
});
