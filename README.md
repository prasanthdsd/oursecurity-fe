# OurSecurity mobile app

Gate security app for gated communities, for **Android and iOS** from one codebase
(React Native with [Expo](https://expo.dev), TypeScript). The backend is the Java Spring Boot API in
[oursecurity-be](https://github.com/prasanthdsd/oursecurity-be).

## What each role can do

**Resident**
- Approve or deny a visitor waiting at the gate
- Pre-approve guests and share a 6-digit gate pass
- See parcels at the gate and say "send it up" or "keep at gate"
- Raise an SOS (medical, fire, security, other)
- Read community notices

**Guard**
- Verify a pass code and check the visitor in
- Register a walk-in visitor and ask the resident to approve
- Check approved visitors in, and everyone out
- Log deliveries and mark them handed over or returned
- See SOS alerts, respond, call the resident, mark resolved

**Management committee**
- Dashboard: visitors today, pending approvals, parcels at the gate, open alerts
- Add or remove residents, guards and committee members
- Post notices to everyone
- See and respond to alerts

## Run it

```bash
npm install
npm start          # then scan the QR code with Expo Go (Android) or the Camera app (iOS)
```

`npm run android` / `npm run ios` open an emulator or simulator. `npm run web` opens a browser preview.

### Connect to the backend

Copy `.env.example` to `.env.local` and set the backend URL:

```
EXPO_PUBLIC_API_URL=http://<your-computer-LAN-IP>:8080/api
```

A physical phone cannot reach `localhost` on your computer; use its LAN IP. The Android emulator reaches the host at `10.0.2.2`.

Without `EXPO_PUBLIC_API_URL` the app runs in **demo mode** with in-memory data, so it works with no server.

### Demo logins

Same as the backend's dev seed data. The login screen has buttons that fill them in.

| Role | Phone | Password |
|---|---|---|
| Committee | 9000000001 | admin123 |
| Guard | 9000000002 | guard123 |
| Resident (A-101) | 9000000003 | resident123 |
| Resident (B-202) | 9000000004 | resident123 |

## Code layout

```
App.tsx                    providers + navigator
src/api/                   the only place that talks to the backend
  types.ts                 request/response shapes and the Api interface
  http.ts                  fetch client (JWT bearer, error handling)
  mock.ts                  in-memory demo backend
src/auth/AuthContext.tsx   login, logout, token in the iOS Keychain / Android Keystore
src/navigation/            role-based bottom tabs + modal forms
src/screens/resident|guard|committee|shared/
src/components/            UI kit, visit/delivery/alert cards, SOS button
```

See [docs/API.md](docs/API.md) for the endpoints used.

## Building store apps

Use [EAS Build](https://docs.expo.dev/build/introduction/): `npx eas build --platform all`.
Bundle id / package name is `com.oursecurity.app` in `app.json`; change it before publishing.

## Push notifications

The app registers the phone with the backend after login (`POST /api/devices`) and unregisters it on logout.
The backend sends through Expo's push service, so it needs no Firebase or Apple keys of its own.

| Event | Who gets it | Tapping opens |
|---|---|---|
| Walk-in visitor waiting | Residents of the flat | Resident: Home |
| Visitor approved / denied / guest arrived | Guards, or the resident | Gate / Visitors |
| Parcel logged, or resident's instruction | Residents of the flat, or guards | Home / Deliveries |
| Emergency alert raised, acknowledged, resolved | Guards and committee, or the person who raised it | Alerts |
| Notice posted | Everyone | Notices |

Android gets three channels people can tune in system settings: **Emergency alerts** (max priority, loud,
bypasses Do Not Disturb where allowed), **Visitors at the gate** (high), **Deliveries and notices** (normal).
A push that arrives while the app is open refreshes the screen at once; screens still refresh every 15 seconds as a fallback.

One-time setup (needed before pushes work):

1. `npx eas init` links the app to an Expo project and writes `extra.eas.projectId` into `app.json`. Commit that.
2. Android: add a Firebase project's FCM credentials with `npx eas credentials` (Expo's push service uses them to reach Android phones).
   iOS: `npx eas credentials` creates the APNs key for you (needs an Apple Developer account).
3. Install a development build on the phone: `npx eas build --profile development --platform android` (or `ios`).
   **Expo Go cannot receive remote pushes on Android**, and simulators and the web preview never get them.

Without a project id the app still works and just skips push registration.

## Not done yet
- Visitor photos, QR passes, and offline mode for the guard phone.
- Self sign-up and password reset. The committee creates accounts.
