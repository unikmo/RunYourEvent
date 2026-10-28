# RunYourEvent content and offer consistency review

Reviewed: 28 October 2026. Scope: reachable page content, audience/CTA alignment, implemented capability claims, sponsorship hour requests, key missing/error states, and retired routes. This is a content/implementation review, not legal certification, a market-demand study or a full live-production readiness sign-off.

## 🛠️ 1. Technical Code & Legal Compliance Audit

| Area | Finding and evidence | Classification | Severity | Confidence | Direct fix |
|---|---|---|---|---|---|
| Sponsorship choice | Sponsors could select paid placements but had no persisted hour-target request. | Verified defect | Warning | High | `/sponsors` now accepts 25/50/100/250 presets and custom integer hours of at least 25, validated by API and database. Enquiry creates no invoice, campaign or delivered time. |
| Sponsor/employer distinction | Corporate project enquiries led to the same sponsor form. A sponsorship minimum would wrongly constrain an employer's own team. | Verified defect | Warning | High | `/corporate#enquire` records team size and 2–8 activity hours per employee as a distinct enquiry type, without the community-sponsorship minimum. |
| Pricing scope | Club placement fees and sponsorship package scope were easy to conflate. Corporate needs had a placement-derived target that was not their project quote. | Verified defect | Warning | High | Pricing and discovery distinguish requested volunteer-hours, existing allocated campaign budgets and separately quoted package/project prices. No hourly rate is invented. Public direct sponsor invoice creation is retired. |
| Success claims | `/sponsorship/success` said an invoice request was recorded even when no request could be retrieved. | Verified defect | Critical | High | Missing, unavailable, pending, paid, closed and review states have separate wording. A loading failure confirms neither a request nor payment. |
| Billing policies | `/terms` and `/privacy` still named Stripe for current volunteer billing. | Verified defect | Warning | High | Operational wording now matches emailed, itemized invoices and bank-transfer instructions. No consumer-law rights, governing law or liability allocation were redesigned. Historical records remain separately labelled. |
| Recognition | Rewards were described as allocated when the dashboard also lists eligible unclaimed offers; Gold hours and issuance could be conflated. | Verified defect | Warning | High | Distinguishes available/allocated rewards, automatic stocked-voucher delivery, Gold eligibility, actual hand signing and certificate issue. No guaranteed perk, assessed skill or Gold gathering is promised. |
| Attendance | Check-in/out copy could imply immediately verified hours and a universal €10 fee, including employee projects. | Verified defect | Warning | High | Actual participation must be organizer-approved; breaks are excluded. Checkout is evidence, not approval. Applicable club fees and volunteer-free participation stay distinct. |
| Reporting/privacy | Privacy copy omitted Champsboard opt-in and employer-level employee records. | Verified defect | Warning | High | Adult public profiles and separate ranking consent are explained. Aggregate community sponsor reports and authorized employer employee records are distinguished. Requested/contracted targets and verified delivery are separate fields. |
| Error states | Some backend failures were described as sign-in failures, missing invitations or known payment state. | Verified defect | Warning | High | Notification API and UI, attendance, invitations, company workspace, sponsor report and billing now distinguish unavailable data from authentication/missing records. |
| Retired product | Wedding/family and nested catalogue routes could still expose the previous event-planning product; old checkout could start a new purchase. | Verified defect | Warning | High | Public marketing entrances redirect, historical record pages have an explicit legacy notice, and new legacy checkout returns 410. Existing records/receipts are preserved. Company handover now exposes the correct employee workspace link, with the access scope made explicit. |
| Crawl boundaries | `Disallow: /volunteer` also blocked public `/volunteer-engine` routes; a redirected organizer alias appeared in sitemap. | Verified defect | Warning | High | Private root paths use exact-match `$` rules. Retired/private areas are excluded appropriately; redirected organizer alias removed from sitemap. |
| Legal identity and deployment | Existing operator identity was supplied in the repository. Production database/email activation is still outstanding. | Probable risk / limitation | Warning | Medium | Identity was preserved, not independently reverified. No legal-compliance or live-operational guarantee is made. Apply migrations and verify live services before release. |

### Page inventory

All 53 page templates were inventoried. Twenty-five generated legacy SEO slugs are covered by redirects. There are 36 configured legacy redirect rules, including nested catalogue paths, plus the organizer-to-club alias.

| Route/template | Source | Review outcome |
|---|---|---|
| `/[seoSlug]` | `app/[seoSlug]/page.tsx` | 25 generated legacy SEO slugs; all covered by redirects |
| `/about` | `app/about/page.tsx` | Public audience, offer, CTA, claims and metadata reviewed; browser render checked |
| `/access` | `app/access/page.tsx` | Public audience, offer, CTA, claims and metadata reviewed; browser render checked |
| `/activities` | `app/activities/page.tsx` | Public audience, offer, CTA, claims and metadata reviewed; browser render checked |
| `/admin/automation` | `app/admin/automation/page.tsx` | Admin copy/session flow reviewed; synthetic authorized views tested |
| `/admin/community` | `app/admin/community/page.tsx` | Admin copy/session flow reviewed; synthetic authorized views tested |
| `/admin/login` | `app/admin/login/page.tsx` | Admin copy/session flow reviewed; synthetic authorized views tested |
| `/admin` | `app/admin/page.tsx` | Admin copy/session flow reviewed; synthetic authorized views tested |
| `/admin/volunteer-engine` | `app/admin/volunteer-engine/page.tsx` | Admin copy/session flow reviewed; synthetic authorized views tested |
| `/agencies` | `app/agencies/page.tsx` | Retired marketing route; redirects to current volunteer product |
| `/billing` | `app/billing/page.tsx` | Account/capability and missing/unavailable states reviewed; synthetic browser scenarios |
| `/browse/[category]` | `app/browse/[category]/page.tsx` | Retired marketing route; redirects to current volunteer product |
| `/browse` | `app/browse/page.tsx` | Retired marketing route; redirects to current volunteer product |
| `/certificates/[code]` | `app/certificates/[code]/page.tsx` | Account/capability and missing/unavailable states reviewed; synthetic browser scenarios |
| `/champsboard` | `app/champsboard/page.tsx` | Public audience, offer, CTA, claims and metadata reviewed; browser render checked |
| `/checkout/success` | `app/checkout/success/page.tsx` | Historical record access preserved; explicit legacy notice; new checkout disabled |
| `/club` | `app/club/page.tsx` | Account/capability and missing/unavailable states reviewed; synthetic browser scenarios |
| `/company/[token]` | `app/company/[token]/page.tsx` | Account/capability and missing/unavailable states reviewed; synthetic browser scenarios |
| `/contact` | `app/contact/page.tsx` | Public audience, offer, CTA, claims and metadata reviewed; browser render checked |
| `/conversations/[id]` | `app/conversations/[id]/page.tsx` | Account/capability and missing/unavailable states reviewed; synthetic browser scenarios |
| `/corporate` | `app/corporate/page.tsx` | Public audience, offer, CTA, claims and metadata reviewed; browser render checked |
| `/custom` | `app/custom/page.tsx` | Retired marketing route; redirects to current volunteer product |
| `/employee/[token]` | `app/employee/[token]/page.tsx` | Account/capability and missing/unavailable states reviewed; synthetic browser scenarios |
| `/event-types` | `app/event-types/page.tsx` | Retired marketing route; redirects to current volunteer product |
| `/events/[id]` | `app/events/[id]/page.tsx` | Historical record access preserved; explicit legacy notice; new checkout disabled |
| `/family-reunions` | `app/family-reunions/page.tsx` | Retired marketing route; redirects to current volunteer product |
| `/imprint` | `app/imprint/page.tsx` | Public audience, offer, CTA, claims and metadata reviewed; browser render checked |
| `/my-events` | `app/my-events/page.tsx` | Retired marketing route; redirects to current volunteer product |
| `/notifications` | `app/notifications/page.tsx` | Account/capability and missing/unavailable states reviewed; synthetic browser scenarios |
| `/opportunities` | `app/opportunities/page.tsx` | Public audience, offer, CTA, claims and metadata reviewed; browser render checked |
| `/` | `app/page.tsx` | Public audience, offer, CTA, claims and metadata reviewed; browser render checked |
| `/pricing` | `app/pricing/page.tsx` | Public audience, offer, CTA, claims and metadata reviewed; browser render checked |
| `/privacy` | `app/privacy/page.tsx` | Public audience, offer, CTA, claims and metadata reviewed; browser render checked |
| `/recognition` | `app/recognition/page.tsx` | Public audience, offer, CTA, claims and metadata reviewed; browser render checked |
| `/resources` | `app/resources/page.tsx` | Retired marketing route; redirects to current volunteer product |
| `/seasonal-needs` | `app/seasonal-needs/page.tsx` | Public audience, offer, CTA, claims and metadata reviewed; browser render checked |
| `/share/[code]` | `app/share/[code]/page.tsx` | Historical record access preserved; explicit legacy notice; new checkout disabled |
| `/sponsor/[token]` | `app/sponsor/[token]/page.tsx` | Account/capability and missing/unavailable states reviewed; synthetic browser scenarios |
| `/sponsors` | `app/sponsors/page.tsx` | Public audience, offer, CTA, claims and metadata reviewed; browser render checked |
| `/sponsorship/success` | `app/sponsorship/success/page.tsx` | Account/capability and missing/unavailable states reviewed; synthetic browser scenarios |
| `/templates` | `app/templates/page.tsx` | Retired marketing route; redirects to current volunteer product |
| `/terms` | `app/terms/page.tsx` | Public audience, offer, CTA, claims and metadata reviewed; browser render checked |
| `/venues` | `app/venues/page.tsx` | Retired marketing route; redirects to current volunteer product |
| `/volunteer` | `app/volunteer/page.tsx` | Account/capability and missing/unavailable states reviewed; synthetic browser scenarios |
| `/volunteer-engine/check-in` | `app/volunteer-engine/check-in/page.tsx` | Account/capability and missing/unavailable states reviewed; synthetic browser scenarios |
| `/volunteer-engine/invite/[token]` | `app/volunteer-engine/invite/[token]/page.tsx` | Account/capability and missing/unavailable states reviewed; synthetic browser scenarios |
| `/volunteer-engine/organizers` | `app/volunteer-engine/organizers/page.tsx` | Club entry alias; redirects to /club |
| `/volunteer-engine` | `app/volunteer-engine/page.tsx` | Public audience, offer, CTA, claims and metadata reviewed; browser render checked |
| `/volunteer-engine/volunteers` | `app/volunteer-engine/volunteers/page.tsx` | Public audience, offer, CTA, claims and metadata reviewed; browser render checked |
| `/volunteer-event-planning` | `app/volunteer-event-planning/page.tsx` | Retired marketing route; redirects to current volunteer product |
| `/volunteers/[slug]` | `app/volunteers/[slug]/page.tsx` | Account/capability and missing/unavailable states reviewed; synthetic browser scenarios |
| `/weddings` | `app/weddings/page.tsx` | Retired marketing route; redirects to current volunteer product |
| `/workspace/[workspaceId]` | `app/workspace/[workspaceId]/page.tsx` | Historical record access preserved; explicit legacy notice; new checkout disabled |

## 🕵️ 2. Niche & Competitor SEO Strategy

Competitor, keyword-volume and market positioning research: **Not assessed**, outside this focused content review. No traffic or ranking gains are claimed. On-page metadata was aligned with the volunteer, sponsorship and employee-project offers. Crawl boundary and sitemap defects are corrected as recorded above.

## 📈 3. Social-to-Site Conversion Flow & Campaign Angles

Campaign recommendations and ad-library research: **Not assessed**, not requested. No campaigns, ads or outreach were launched.

The implemented journey is: sponsor overview → browse real club needs or choose an hour target → quote enquiry → agreed scope/price/window and handling of undelivered hours → invoice → recorded payment/funding → organizer-verified delivery report. Employers use a separate team-project enquiry and their private booking/invitation flow.

**Optimization hypothesis:** 25 hours is a manageable pilot minimum, not a validated optimum. Measure request sizes, quote acceptance, delivery costs and verified completion before changing the minimum or introducing instant-priced packages. No hourly price has been approved; hour requests therefore remain quotes. A smaller individual need may contribute to a package spanning multiple activities or clubs.

## 🚀 4. Executable Checklist

1. **Content alignment — completed in source.** Owner: product/engineering. Scope: affected pages/components in this PR. Acceptance: current pages distinguish audience, placement fee, sponsorship target, employee project, verification and rewards without unsupported guarantees.
2. **Hour request storage — completed and tested locally.** Owner: engineering. Dependency: `20261028175619_sponsor_hour_targets.sql`. Acceptance: 24/missing/fractional/string hour targets are rejected; 25+ whole-hour sponsorship is saved; 3 employees × 8 hours is accepted as a separate employee enquiry; requests create no funding or invoice.
3. **Accounting/report separation — completed and tested locally.** Owner: engineering/operations. Acceptance: requested/contracted target of 25 hours can coexist with zero delivery and later four verified delivered hours; no target is inferred from euros or placements.
4. **Browser verification — passed against synthetic local records.** Owner: QA. Acceptance: public and protected page states render; sponsor and employer requests persist the correct fields; unknown invoice URLs make no success claim; legacy redirects and mobile layouts pass. Result: 23 public/logged-out route scenarios, 17 signed-in/capability scenarios, all 36 configured legacy redirects and ten mobile routes passed. Quote forms saved the requested hours or employee team parameters through the API into the disposable database, with no browser exceptions.
5. **Production activation — pending.** Owner: engineering/operator. Dependencies: restored Supabase project, new migration, Auth/SMTP/billing settings and scheduler. Acceptance: repeat the real journeys with authorized live records and verify actual delivery. Current tests do not send emails, transfer money, ship rewards or reproduce hand signing.
6. **Commercial hourly pricing — open business decision.** Owner: founder. Dependency: agreed rate/package economics and contract handling of under/over-delivery. Acceptance: a quoted package states price, included costs, tax, delivery window and treatment of unused/undelivered scope. Automatic per-hour invoicing is not claimed by this change.

Validation scope: isolated PostgreSQL-compatible integration tests with synthetic data, request validation, production build/type checking, source inventory, and local browser journeys. Production data and actual email/bank delivery remain unverified while activation is pending. This report intentionally makes no claim of a full legal review, measured conversion lift, VTO approval, guaranteed staffing or guaranteed reward stock.
