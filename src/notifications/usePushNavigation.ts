import { createNavigationContainerRef } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import type { Role } from '../api';
import type { RootStackParamList } from '../navigation/types';
import type { PushData, PushType } from './push';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// Which tab a tapped notification opens, per role. Tab names are the ones in RootNavigator.
const TARGET: Record<PushType, Record<Role, string>> = {
  VISIT_REQUEST: { RESIDENT: 'Home', GUARD: 'Gate', COMMITTEE: 'Dashboard' },
  VISIT_UPDATE: { RESIDENT: 'Visitors', GUARD: 'Gate', COMMITTEE: 'Dashboard' },
  DELIVERY: { RESIDENT: 'Home', GUARD: 'Deliveries', COMMITTEE: 'Dashboard' },
  ALERT: { RESIDENT: 'Alerts', GUARD: 'Alerts', COMMITTEE: 'Alerts' },
  NOTICE: { RESIDENT: 'Notices', GUARD: 'Notices', COMMITTEE: 'Notices' },
};

export function tabForPush(type: PushType | undefined, role: Role): string | null {
  return type && TARGET[type] ? TARGET[type][role] : null;
}

/** Opens the matching tab when the user taps a notification, including one that launched the app. */
export function usePushNavigation(role: Role | undefined) {
  const response = Platform.OS === 'web' ? null : Notifications.useLastNotificationResponse();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!response || !role) return;
    if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const key = response.notification.request.identifier;
    if (handled.current === key) return;

    const tab = tabForPush((response.notification.request.content.data as PushData | undefined)?.type, role);
    if (!tab) return;
    const go = () => {
      if (!navigationRef.isReady()) return false;
      handled.current = key;
      navigationRef.navigate('Tabs', { screen: tab });
      return true;
    };
    if (go()) return;
    // On a cold start the navigator may not be mounted yet.
    const t = setInterval(() => go() && clearInterval(t), 200);
    return () => clearInterval(t);
  }, [response, role]);
}
