# PWA Migration Plan

## Goal

Create a separate PWA app without weakening the current mobile app.

- Keep the existing Expo app as the mobile source of truth.
- Build the PWA as a separate app in the same repo.
- Share only business logic, API code, types, and activation-zone math.
- Do not port native-only behavior that the browser cannot reliably support.

## Recommended Repo Shape

- `app/`, `components/`, `context/`, `services/`: keep as the current mobile app for now.
- `apps/pwa/`: new web-first app.
- `packages/shared/`: extracted shared logic used by both apps.

## File-By-File Migration Inventory

### Extract To `packages/shared`

| Source file | PWA action | Notes |
| --- | --- | --- |
| `constants/Api.ts` | Extract | Reuse API base URL and config. |
| `constants/theme.ts` | Extract selectively | Reuse tokens and brand colors, but do not force the native theme structure on the web app. |
| `context/ApiContext.tsx` | Split and extract | Pull out API request helpers, DTOs, and domain types. Keep UI/provider wiring app-specific. |
| `app/(drawer)/map.tsx` | Extract pure logic only | Reuse `LatLng`, activation-zone types, distance math, nearest-zone logic, and zone formatting helpers. |
| `hooks/use-api.ts` | Rebuild around shared client | The PWA can use the same domain client with web-specific providers. |

### Rebuild For The PWA

| Source file | PWA action | Notes |
| --- | --- | --- |
| `app/_layout.tsx` | Rewrite | Remove native notification bootstrapping and any geofencing startup assumptions. |
| `app/(drawer)/_layout.tsx` | Rewrite | Keep navigation structure as a reference, but rebuild with web navigation patterns. |
| `context/AuthContext.tsx` | Split and rewrite | Reuse auth API flows, but replace notification permission logic and native settings handling. |
| `app/login.tsx` | Rewrite | Keep username/password login, drop biometrics and secure-store behavior. |
| `app/forgot-password.tsx` | Rewrite lightly | Reuse reset flow, replace native back handling. |
| `app/(drawer)/change-password.tsx` | Rewrite lightly | Reuse validation and auth calls, adapt navigation. |
| `app/(drawer)/incidents.tsx` | Rewrite lightly | Reuse incident listing/filtering logic, replace `BackHandler` assumptions. |
| `app/(drawer)/report.tsx` | Rewrite | Reuse incident/reporting rules, replace `expo-image-picker` with browser file upload. |
| `app/(drawer)/profile.tsx` | Rewrite | Reuse profile update logic, replace image picker and native back handling. |
| `app/(drawer)/qr-code.tsx` | Rewrite | Replace `react-native-qrcode-svg` with a browser-safe QR library or SVG renderer. |
| `app/(drawer)/settings.tsx` | Simplify and rewrite | Keep account/settings actions that matter on web, remove Expo push-token flows. |
| `app/(drawer)/map.tsx` | Rebuild from scratch for web | Use a browser-safe map library; support current location, red/green zones, and live distance only. |
| `app/onboarding.tsx` | Optional rewrite | Keep only if the PWA needs onboarding. |
| `app/activation.tsx` | Optional rewrite | Keep only if this screen is still part of the product flow. |

### Keep Mobile-Only

| Source file | Decision | Notes |
| --- | --- | --- |
| `services/GeofencingTask.ts` | Leave in mobile app | Browser version should not try to mimic background geofencing. |
| `app/(drawer)/map.tsx` native geofencing and push setup | Leave in mobile app | The PWA should not register push tokens or start geofencing here. |
| `app/login.tsx` biometric and secure-store code | Leave in mobile app | Browser login should use normal web storage/session handling. |
| `app/_layout.tsx` notification startup code | Leave in mobile app | Do not run Expo notifications in the PWA shell. |
| `app/(drawer)/settings.tsx` Expo push-token management | Leave in mobile app | Revisit later only if browser notifications become a real requirement. |
| `BackHandler` usage across screens | Leave in mobile app | Replace with browser navigation patterns instead of porting it. |

## PWA V1 Feature Scope

### Keep In V1

- Login
- Forgot password
- Change password
- Profile
- Incident history
- Report incident
- QR code screen
- Activation map with live browser location
- Red and green zone display
- Distance from current location to green zones

### Drop In V1

- Background geofencing
- Background zone notifications
- Expo push token registration
- Biometrics
- Secure-store credential restore
- Native settings redirects as a core flow

## Feature Mapping

### Activation Map

- Shared: zone typing, zone parsing, distance math, nearest-zone logic.
- PWA-specific: browser geolocation, web map rendering, foreground-only updates.
- Mobile-only: `react-native-maps`, `expo-task-manager`, background notifications.

### Auth

- Shared: login, logout, reset password, update password, update profile, API key/session handling.
- PWA-specific: browser storage/session strategy.
- Mobile-only: biometric login and secure credential storage.

### Incidents And Reporting

- Shared: API payloads, list/detail models, validation rules.
- PWA-specific: browser file upload and web navigation.
- Mobile-only: image picker behavior tied to native APIs.

## Migration Order

### Phase 1: Shared Extraction

- Create `packages/shared/`.
- Extract API config, request helpers, types, and activation-zone math.
- Keep the current mobile app untouched while extracting.

### Phase 2: PWA Shell And Auth

- Create `apps/pwa/`.
- Build login, session persistence, and route shell.
- Wire the PWA to the shared API client.

### Phase 3: Activation Map

- Build the web-only map screen.
- Render current location, red zones, green zones, and live distance.
- Do not include geofencing or background notifications.

### Phase 4: Remaining Screens

- Add incidents, reporting, profile, settings, password change, and QR code.
- Replace native file/image behavior with browser-safe inputs.

### Phase 5: PWA Polish

- Add manifest, icons, and installability.
- Add caching only after the live API flows are stable.
- Evaluate browser notifications later as a separate feature.

## First Build Targets

- A PWA that can authenticate.
- A PWA that can show the activation map safely in the browser.
- A PWA that preserves the incident/report/profile flows needed by users.
- A mobile app that remains unchanged while the PWA is being built.
