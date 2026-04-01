import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";

export const GEOFENCING_TASK_NAME = "GEOFENCING_TASK";

TaskManager.defineTask(GEOFENCING_TASK_NAME, async ({ data: { eventType, region }, error }: any) => {
  if (error) {
    console.error(`[Geofencing] Task Error: ${error.message}`);
    return;
  }

  const identifier = region.identifier;
  const parts = identifier.includes('|') ? identifier.split('|') : [identifier, "Promotion Zone", "green"];
  const [regionId, regionName, regionType] = parts.length >= 3 ? parts : [...parts, "green"];

  if (eventType === Location.GeofencingEventType.Enter) {
    console.log(`[Geofencing] Entered ${regionType} region: ${regionId}`);

    if (regionType === 'red') {
      Notifications.scheduleNotificationAsync({
        content: {
          title: "⚠️ RED ZONE: Leave Immediately!",
          body: `You have entered ${regionName}. This is an unauthorized area. Please exit now.`,
          data: { locationId: regionId, type: 'red_zone_enter' },
          sound: true,
          priority: 'max',
        },
        trigger: null,
      });
    } else {
      Notifications.scheduleNotificationAsync({
        content: {
          title: "You've entered an Activation Zone!",
          body: `Welcome to ${regionName}. Scan the QR code to track your compliance.`,
          data: { locationId: regionId, type: 'geofence_enter' },
        },
        trigger: null,
      });
    }
  }
  // else if (eventType === Location.GeofencingEventType.Exit) {
  //   console.log(`[Geofencing] Exited region: ${regionId}`);

  //   Notifications.scheduleNotificationAsync({
  //     content: {
  //       title: "Exited Activation Zone",
  //       body: `You have left ${regionName}. Stay safe!`,
  //       data: { locationId: regionId, type: 'geofence_exit' },
  //     },
  //     trigger: null,
  //   });
  // }
});
