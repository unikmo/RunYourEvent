# Firebase Firestore — Volunteer Engine Mirror

RunYourEvent keeps Supabase as the current system of record and can mirror Volunteer Engine activity into Cloud Firestore. This adds Firebase without risking the existing production flow.

## What is mirrored

When `RYE_FIREBASE_MIRROR_ENABLED=true`, the server mirrors:

- volunteer registrations → `rye_volunteer_profiles`
- organizer / club requests → `rye_volunteer_organizer_requests`
- volunteer opportunities / micro-shifts → `rye_volunteer_opportunities`
- invitation + attendance events → `rye_volunteer_activity`

Supabase IDs are retained in Firestore where available so records can be reconciled later.

## Why mirror first

The existing Volunteer Engine already uses Supabase RPCs for invitations, QR attendance, admin operations and status transitions. Mirroring lets Firebase be introduced safely before any future cutover. It avoids a risky big-bang migration and prevents current recruiting flows from breaking.

## Firebase setup

1. Create or select a Firebase project.
2. Enable **Cloud Firestore** and choose the desired region before writing production data.
3. Create a server service account with Firestore access.
4. Add the following server-only environment variables to Vercel and local development:

```env
RYE_FIREBASE_MIRROR_ENABLED=true
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY_BASE64=base64-encoded-private-key
FIREBASE_DATABASE_ID=(default)
```

Do not prefix service-account values with `NEXT_PUBLIC_`.

For Vercel, `FIREBASE_PRIVATE_KEY_BASE64` is recommended because it avoids multiline PEM formatting issues.

## Health check

After the variables are configured and the preview is deployed:

```text
GET /api/health/firebase
```

Expected response:

```json
{
  "ok": true,
  "configured": true,
  "mirrorEnabled": true
}
```

If credentials are missing, the endpoint returns HTTP 503 with `firebase_credentials_missing`.

## Security model

Firebase writes are server-to-server only. No Firebase service-account credential is exposed to browser code. The integration authenticates with Google OAuth using the service account and writes through the Firestore REST API.

The Firestore copy contains personal volunteer / organizer information, so production rollout must use an appropriate Firestore region, access controls, retention policy and privacy documentation.

## Cutover policy

Firebase is currently a mirror, not the source of truth. Do not disable Supabase volunteer RPCs until:

1. Firestore mirroring is verified in preview,
2. sample records reconcile correctly,
3. invitation / attendance behavior has a Firebase-native equivalent,
4. rollback has been tested.
