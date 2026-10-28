# RunYourEvent

RunYourEvent is a **sports volunteer platform** built around clear **2–4 hour activities**.

## Core model

### For sports clubs and organizers
- Post a specific sports volunteer activity with role, venue, date and a 2–4 hour time window.
- RunYourEvent helps match and invite suitable local volunteers.
- Volunteers accept or decline a specific activity.
- Attendance is recorded with personal invitation links plus event QR check-in/check-out.
- The organizer pays **€10 per volunteer who completes the activity**.
- Invitation, acceptance or a no-show does not create the €10 platform fee.

### For volunteers
- Join free.
- Choose only the sports activities that fit.
- No season-long commitment.
- Build verified volunteer hours.
- Students become eligible for a **RunYourEvent Sports Volunteer Certificate at 20 verified hours**.

## Positioning

RunYourEvent is **not volunteer scheduling software**.

Clubs already have calendars, spreadsheets, WhatsApp groups and low-cost helper-list tools. RunYourEvent is focused on the harder problem: **supplying people for concrete sports activities by reducing the commitment to 2–4 hours**.

## Existing product infrastructure

- Organizer intake
- Volunteer profiles
- 2–4 hour opportunity validation
- Personal invite links
- Accept / decline / reconfirm flow
- Event QR check-in
- Check-out and verified time
- Admin operations console
- Stripe attendance/completion invoicing
- Volunteer protection workflow
- Certificate-progress foundation

## Commercial model

- **€10 per completed volunteer activity**
- Volunteer signup: free
- Separate Volunteer Protection charge may apply where offered/required, subject to insurer terms and availability.

## Technical stack

- Next.js
- Supabase
- Vercel
- Stripe

## Self-service community and corporate workflows

- Clubs create seasonal needs, publish insured community activities, invite suitable local volunteers, coordinate in private conversations and verify completed time in `/club`.
- Volunteers discover activities, confirm their own places, bring friends by sharing a group link, manage invitations and attendance, and see recognition in `/volunteer`.
- Community activities last 2–4 hours. Corporate projects can last up to 8 hours, with planned breaks and an agreed project price before activation. They do not inherit the €10 community placement fee.
- Sponsorship can fund all or part of a need's platform fees. Materials and protection costs remain separately disclosed. Funding is reserved automatically at acceptance and released on cancellation/no-show; a funded placement is excluded from the club's platform invoice.
- Bronze (20h) and Silver (40h) certificates are generated automatically from verified records. Gold (60h) issuance requires an actual hand-signature record. Attendance corrections are audited and unsupported certificates revoked.
- Adult public profiles are opt-in. Sponsor and employer reports contain aggregate contribution data, with private report links and CSV export.
- Funded rewards support limited stock, self-service claims and instant delivery of reusable digital perks. Physical benefits and unique vouchers require actual fulfilment to be recorded. Shared instructions are not a unique-voucher inventory.
- `/admin/community` handles commercial verification, Gold signing and exceptions. It is not required for routine club/volunteer matching or communication.
- `/access` supports Supabase email-code or default magic-link recovery. Recovery trusts a confirmed Auth account, rotates capabilities and invalidates old volunteer invitation access. Club recovery belongs to the immutable account owner, not arbitrary project contacts.

## Validation

`npm run test:community` runs the existing Volunteer Engine migrations and the new migrations in an isolated PostgreSQL-compatible PGlite database with synthetic data. It checks intake, ownership, publication, capacity, funding, direct conversations, verified attendance, milestones, signature gates, reward stock, public-profile privacy, recovery, corporate agreements and audited corrections.

`npm run test:input` verifies strict calendar input and origin checks. `npm run build` checks the production application and TypeScript. CI runs these checks on pull requests.

The local-only `scripts/community-test-server.mjs` adapter is a disposable browser-test fixture, not a production data store. Production continues to use Supabase.

## Release dependency — checked 28 October 2026

The EventEngine Supabase project is inactive. Its restore request was rejected because the account already has two active free projects. Production migrations and live email/data verification must wait until EventEngine can be restored. Do not merge/deploy this database-dependent release to production before applying the migrations, configuring the project's Supabase environment values, validating Auth redirect URLs and verifying the live journeys. Do not pause another application or purchase an upgrade without authorization.
