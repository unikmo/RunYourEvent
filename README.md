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
- Itemized attendance/completion invoices by email
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
- SMTP invoice delivery

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

## Automated operations, invoice-only billing and Champsboard

The five-minute worker matches opted-in volunteers by city, age eligibility, availability, interests and conflicting bookings. Invitations, messages, schedule updates, reminders and attendance exceptions create in-app updates and optional email jobs. Cancellations reopen capacity for replacement invitations. Company workspaces handle employee invitations and verified-email acceptance after the agreed project invoice is settled. Stocked unique vouchers can be configured to deliver automatically once per milestone.

Billing uses RunYourEvent's own immutable invoice snapshots and SMTP delivery, without Stripe, checkout, saved cards or automatic collection. Completed organizer-verified community placements accrue €10 fees once; sponsored platform fees are excluded and agreed protection charges are separate. Daily invoice batches include itemized services, configured tax, a unique invoice reference, 14-day terms and bank-transfer instructions. Invoices are attached as printable HTML, with private downloads in `/billing` and `/admin/automation`. Quoted sponsorship arrangements and corporate invoice requests have their own activation rules; an administrator records actual full bank receipt with its transaction reference before funding activates. This is not automatic bank reconciliation. Attendance corrections flag affected invoices for review. Unpaid invoices can be cancelled with an audited reason; paid corrections require a credit-note review. SMTP has at-least-once delivery semantics: an ambiguous provider acknowledgement can cause a duplicate email, but it cannot create a duplicate fee or invoice.

Activation requires the restored Supabase project, both new migrations, service-role credentials, SMTP configuration (`SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`, optional `SMTP_USER` / `SMTP_PASSWORD`), a 32+ character `CRON_SECRET`, and the production site URL. Configure the actual seller using `BILLING_SELLER_NAME`, `BILLING_SELLER_ADDRESS`, optional `BILLING_SELLER_TAX_ID`, `BILLING_TAX_NOTE`, `BILLING_TAX_BPS` (explicit integer basis points, including `0` where applicable), and `BILLING_PAYMENT_INSTRUCTIONS`. Missing billing configuration blocks invoice issuance instead of inventing legal or banking details. Clubs supply their billing address in `/billing`; sponsors and employers supply theirs with the request. Set `OPERATIONS_EMAIL` for exception alerts. Enable pg_cron, pg_net and Vault, then activate the scheduler in `/admin/automation`. No external services or live email delivery are exercised by the synthetic tests.

`/champsboard` ranks completed, organizer-verified minutes worldwide, by country and by city, with all-time and current-year views, equal ranks for ties and 50-row pagination. Adults separately opt in through their private passport and choose their country; publishing a shareable profile alone does not enroll them. The public board exposes only chosen display names, public page slugs, city/country, contribution tiers and hours. Private, unlisted, inactive and under-18 profiles are excluded. Corrections and opt-out take effect on the next request. Annual rankings do not reset lifetime certificate milestones.

Run `npm run test:seamless` for worker, billing, employer and reward integration checks, and `npm run test:champsboard` for ranking, location, annual filtering and privacy checks. Both are included in PR CI alongside the original community tests.


## Sponsorship hour targets and content consistency

Sponsors request 25 or more whole volunteer-hours through `/sponsors`, with 25/50/100/250 presets or a custom target. The database persists `requested_hours`; submission is a quote enquiry and creates no campaign, invoice or verified time. An hour package may span multiple activities/clubs, so a smaller need can be included. No hourly price is inferred from the €10 completed-placement fee. Scope, price, delivery dates and treatment of undelivered hours need an agreement before invoicing. Public direct per-placement sponsor invoice creation is retired; existing invoice/order processing is preserved.

Employee-project enquiries live on `/corporate` and record `enquiry_type`, `team_size` and `hours_per_employee` (2–8). They do not inherit the community sponsorship minimum. Admins may record a contracted campaign `target_hours`; private sponsor reports and CSV exports keep that target separate from verified delivered minutes. Existing records retain a null target instead of invented hour commitments. Apply the `sponsor_hour_targets` migration before activating these forms.

`docs/CONTENT_REVIEW.md` records the page inventory, corrected contradictions, verification and limitations. `npm run test:sponsor-hours` tests quote validation, private storage, request-versus-delivery accounting and separate employer enquiries.
