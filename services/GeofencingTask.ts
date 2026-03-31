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
  const [regionId, regionName] = identifier.includes('|') ? identifier.split('|') : [identifier, "Promotion Zone"];

  if (eventType === Location.GeofencingEventType.Enter) {
    console.log(`[Geofencing] Entered region: ${regionId}`);

    Notifications.scheduleNotificationAsync({
      content: {
        title: "You've entered an Activation Zone!",
        body: `Welcome to ${regionName}. Scan the QR code to track your compliance.`,
        data: { locationId: regionId, type: 'geofence_enter' },
      },
      trigger: null,
    });
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
