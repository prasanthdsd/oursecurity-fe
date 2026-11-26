# Backend API used by the app

The app talks to the Spring Boot backend in [oursecurity-be](https://github.com/prasanthdsd/oursecurity-be).
The full OpenAPI spec lives there (`docs/openapi.json`, and Swagger UI at `/swagger-ui.html` when it runs).
Every call the app makes is in `src/api/http.ts`; the TypeScript shapes are in `src/api/types.ts`.

Base path `/api`, JSON bodies, `Authorization: Bearer <jwt>`. Errors come back as `{ "message": "..." }`. Timestamps are ISO-8601.

| Area | Method and path | Who |
|---|---|---|
| Auth | `POST /auth/login` `{phone,password}` → `{token,user}` | anyone |
| | `GET /auth/me` | signed in |
| Visitors | `POST /visits/preapprove` `{visitorName,visitorPhone,purpose,expectedAt}` → visit with 6-digit `passCode` | resident |
| | `POST /visits/walk-in` `{visitorName,visitorPhone,purpose,flatNumber}` → `PENDING_APPROVAL` | guard |
| | `POST /visits/verify` `{passCode}` → `CHECKED_IN` | guard |
| | `GET /visits?status=` (residents see their own flat) | all |
| | `POST /visits/{id}/approve`, `/deny`, `/cancel` | resident |
| | `POST /visits/{id}/check-in`, `/check-out` | guard |
| Deliveries | `POST /deliveries` `{flatNumber,courier,description}` | guard |
| | `GET /deliveries?status=` | all |
| | `POST /deliveries/{id}/instruction` `{instruction: LEAVE_AT_GATE \| SEND_UP}` | resident |
| | `POST /deliveries/{id}/collect`, `/return` | guard (collect: resident too) |
| Emergencies | `POST /alerts` `{type: MEDICAL \| FIRE \| SECURITY \| OTHER, message}` | all |
| | `GET /alerts?status=` | all |
| | `POST /alerts/{id}/acknowledge`, `/resolve` | guard, committee |
| Committee | `GET /users?role=`, `POST /users`, `DELETE /users/{id}` | committee |
| | `GET /reports/summary` | committee |
| Notices | `GET /notices`, `POST /notices` `{title,body}` (post: committee) | all |
| Push | `POST /devices` `{token, platform: IOS \| ANDROID}` (Expo push token) | signed in |
| | `POST /devices/unregister` `{token}` (on logout) | signed in |

Visit status flow:

```
resident pre-approves ─► PRE_APPROVED ─(guard verifies code)─► CHECKED_IN ─► CHECKED_OUT
                              └─(resident cancels)─► CANCELLED
guard logs walk-in ─► PENDING_APPROVAL ─(resident approves)─► APPROVED ─(guard)─► CHECKED_IN ─► CHECKED_OUT
                              └─(resident denies)─► DENIED
```

Pushes carry `data: {type, id}` with `type` one of `VISIT_REQUEST`, `VISIT_UPDATE`, `DELIVERY`, `ALERT`, `NOTICE`, and an Android `channelId` of `gate`, `alerts` or `default`.

The backend also offers `GET /notifications` and `POST /notifications/{id}/read`; the app does not use them yet.
