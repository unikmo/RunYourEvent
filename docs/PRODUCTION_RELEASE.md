# RunYourEvent production release

Target: `unikmo/RunYourEvent`, Vercel project `dengine`, team `unikmos-projects`, domain `https://runyourevent.com`, Supabase project `iemibyzizrvoxdxskfsx`.

## Configuration

Store all credentials in the hosting provider's encrypted environment settings. Never put service keys, SMTP credentials or worker secrets in `NEXT_PUBLIC_` variables, source control, screenshots or release logs.

Required public settings: `NEXT_PUBLIC_SITE_URL=https://runyourevent.com`, `NEXT_PUBLIC_SUPABASE_URL=https://iemibyzizrvoxdxskfsx.supabase.co`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Required server settings: `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET` (at least 32 random characters), `OPERATIONS_EMAIL`, `SMTP_HOST`, `SMTP_PORT` (465 or 587), `SMTP_FROM`, and the matching `SMTP_USER`/`SMTP_PASSWORD` pair if the provider requires authentication.

Billing requires `BILLING_SELLER_NAME`, `BILLING_SELLER_ADDRESS`, `BILLING_TAX_NOTE`, explicit `BILLING_TAX_BPS` (0–10000), and `BILLING_PAYMENT_INSTRUCTIONS`. Add `BILLING_SELLER_TAX_ID` where applicable. The legal notice identifies PlanetHike OÜ as the supplier; confirm the actual invoicing entity and tax treatment before issuing invoices. Never infer the tax rate or banking details.

Run `node scripts/check-production.mjs` with these variables loaded securely. It prints only check labels and pass/fail results. It checks SMTP connectivity without sending email and performs read-only API checks. A successful result does not replace the manual checks below.

## Supabase Auth and administration

Set the Auth site URL to the production domain and allow the exact `/access` redirect used by each authorized deployment. Apply `supabase/templates/magic-link.de.html` and `confirmation.de.html`, with subjects `Dein Anmeldelink für RunYourEvent` and `Bestätige deine E-Mail-Adresse für RunYourEvent`. Configure a verified SMTP sender; test both the code and magic-link journeys with an authorized operator account.

Provision the first `rye_admin_users` record through a trusted database session, storing only an `extensions.crypt` bcrypt hash. The administrator chooses a unique password; never commit or share a default password. Confirm login, expiry, logout and rejection of an invalid session.

## Background work

Enable Supabase `pg_cron` and `pg_net`; Vault is already installed. After the production environment variables are present, use `/admin/automation` to configure the scheduler. Its existing `rye_configure_worker` RPC stores the worker URL/secret in Vault and schedules a five-minute dispatch. Keep scheduler RPCs restricted to `service_role`. Confirm the authenticated worker responds, job leases complete, and exceptions are visible; never dispatch synthetic jobs to real recipients.

## Release checks

1. Run migration compilation, input checks, community/automation/Champsboard/sponsorship/localization suites, production build and discovery checks.
2. In the current deployment, test desktop and mobile club publication, volunteer registration/recovery, invitation acceptance, conversation, check-in/out, organizer verification, employee enquiries/invitations, sponsorship minimum of 25 hours, private reports and invoice states. Use disposable synthetic data in a separate test database, or explicitly authorized live records. Verify no private records leak through public URLs or anonymous API access.
3. Confirm invoice seller, tax, bank instructions and printable itemization with the operator. Payment activation requires actual bank receipt; never mark a test payment as received in production.
4. Merge only the tested commit. Verify the production build targets the intended Vercel project and domain before assigning production traffic.
5. Check production homepage/CTAs, public empty/error states, account access, robots, sitemap, canonicals, FAQ structured data, legacy redirects and private noindex headers. Record the released SHA and deployment URL for rollback.

## Verified on 29 October 2026

The original 24 migrations were applied. A subsequent `production_security_hardening` migration fixes both legacy mutable function search paths and removes public execution of the trigger helper. Anonymous/authenticated roles cannot create objects in `public`. Internal worker RPCs and renamed implementation functions are not publicly executable. The private tables intentionally use RLS without public row policies; capability-checked public RPCs expose only their permitted projections.

The hosting connector currently returns no projects for the owning team and cannot access the protected preview. Hosting/Auth/SMTP/billing values and real browser journeys are therefore not yet verified. No production merge or deployment has been performed as part of this activation.
