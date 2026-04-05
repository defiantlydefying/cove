import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

interface ReminderNotification {
  id: string;
  title: string;
  body?: string;
  scheduleAt?: Date;
  every?: "minute" | "hour" | "day";
}

function stringIdToNumber(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export async function requestPermission(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    const result = await LocalNotifications.requestPermissions();
    return result.display === "granted";
  }
  if (typeof Notification !== "undefined") {
    const result = await Notification.requestPermission();
    return result === "granted";
  }
  return false;
}

export async function scheduleReminder(notification: ReminderNotification): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  const notifId = stringIdToNumber(notification.id);

  await LocalNotifications.schedule({
    notifications: [
      {
        id: notifId,
        title: notification.title,
        body: notification.body ?? "",
        ...(notification.scheduleAt
          ? { schedule: { at: notification.scheduleAt, every: notification.every } }
          : {}),
      },
    ],
  });
}

export async function cancelReminder(id: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  await LocalNotifications.cancel({
    notifications: [{ id: stringIdToNumber(id) }],
  });
}
