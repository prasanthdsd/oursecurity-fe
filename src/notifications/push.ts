// Push notifications through Expo's push service. The backend stores the token from
// POST /devices and sends to it via https://exp.host/--/api/v2/push/send.
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/** `data.type` on every push the backend sends; `data.id` is the visit, delivery, alert or notice id. */
export type PushType = 'VISIT_REQUEST' | 'VISIT_UPDATE' | 'DELIVERY' | 'ALERT' | 'NOTICE';
export interface PushData {
  type?: PushType;
  id?: number;
}

// Show banners and play sound even while the app is open.
if (Platform.OS !== 'web') Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Android channels the backend picks with `channelId`. Users can tune each one in system settings.
async function ensureAndroidChannels() {
  if (Platform.OS !== 'android') return;
  await Promise.all([
    Notifications.setNotificationChannelAsync('alerts', {
      name: 'Emergency alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500, 250, 500],
      lightColor: '#C62828',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
      sound: 'default',
    }),
    Notifications.setNotificationChannelAsync('gate', {
      name: 'Visitors at the gate',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    }),
    Notifications.setNotificationChannelAsync('default', {
      name: 'Deliveries and notices',
      importance: Notifications.AndroidImportance.DEFAULT,
    }),
  ]);
}

function projectId(): string | undefined {
  return Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
}

/**
 * Asks for permission and returns this phone's Expo push token, or null when push is not
 * possible (web, simulator, permission denied, or no EAS project id configured yet).
 */
export async function getPushToken(): Promise<string | null> {
  if (Platform.OS === 'web' || !Device.isDevice) return null;
  await ensureAndroidChannels();

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') status = (await Notifications.requestPermissionsAsync()).status;
  if (status !== 'granted') return null;

  const id = projectId();
  if (!id) {
    console.warn('Push notifications need an EAS project id. Run `npx eas init` (see README).');
    return null;
  }
  return (await Notifications.getExpoPushTokenAsync({ projectId: id })).data;
}

export const devicePlatform = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';

// Screens subscribe so a push that arrives while the app is open refreshes them at once.
type Listener = (data: PushData) => void;
const listeners = new Set<Listener>();
export function onPushReceived(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
if (Platform.OS !== 'web') {
  Notifications.addNotificationReceivedListener((n) => {
    const data = (n.request.content.data ?? {}) as PushData;
    listeners.forEach((fn) => fn(data));
  });
}
