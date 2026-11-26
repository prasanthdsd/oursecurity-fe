// EXPO_PUBLIC_API_URL points at the Spring Boot backend, e.g. http://192.168.1.10:8080/api.
// On the Android emulator, the host machine is 10.0.2.2, not localhost.
// When it is not set, the app runs in demo mode against an in-memory mock.
const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

export const config = {
  apiUrl: apiUrl ?? '',
  demoMode: !apiUrl,
  /** How often open lists refresh, until push notifications are added. */
  pollMs: 15000,
};
