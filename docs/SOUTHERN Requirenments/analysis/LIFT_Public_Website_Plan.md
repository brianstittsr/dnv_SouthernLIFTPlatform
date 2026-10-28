# LIFT Public Website Redevelopment Plan

Repurpose the KDM & Associates / Strategic Value+ marketing site into the public
website for the **Southern University MBDA LIFT Rural Business Center**.

Sources: `docs/SOUTHERN Requirenments/` (performance matrix, MOU, press release,
Oct 21 transcript, capability brief, ITAC narrative, summit flyer) and companion
docs `LIFT_Gap_Analysis.md` / `LIFT_System_Design.md`.

## 1. Goals and constraints

- **Separate platform.** Own domain, MBDA/LIFT branding, own sending email
  (requirements email: "MBDA platform will be separate than current KDM website
  and branding"). KDM mode stays the default; LIFT behavior is selected with
  `NEXT_PUBLIC_BRANDING_MODE=lift`.
- **Grant-funded services.** Remove all paid-membership, pricing, checkout, and
  paid-lead flows. A possible "out-of-scope services" fee page is an open
  question (transcript mentions fee structures for out-of-scope work).
- **Federal compliance.** Every public page carries the MBDA funding
  acknowledgment; use the current MBDA/LIFT/Southern logo lockup once the
  branding pack arrives (transcript: "re-face it with the MBDA, Rural Business
  Center, LIFT, Southern University"; logo request still pending).
- **Positioning.** A 24/7 center serving rural Louisiana small businesses —
  technical assistance, training/workshops, contracting readiness, capital
  access, proposal support. Primary CTAs: **Start the AI intake interview**
  (`/forms/lift-intake`) and **register for a workshop** (`/events`).

## 2. Page inventory — `app/(marketing)` (~85 routes)

### KEEP — rewrite to LIFT copy

| Route | Action |
| --- | --- |
| `/` (home) | Rewrite: LIFT Center hero, MBDA acknowledgment, service pillars, outcome stats, intake CTA |
| `/about` | Rewrite as "About the Center" (award, mission, SU + MBDA partnership, rural parishes) |
| `/events`, `/events/[id]`, `/events/[id]/register` | Keep; feeds B6 Workshop Registration |
| `/news`, `/news/[slug]`, `/press-releases`, `/blog`, `/newsletter` | Keep; rebrand (blog → LIFT Blog, done); seed LIFT press release; purge KDM articles |
| `/contact` | Rewrite: remove the $299 "DWY" paid-lead write; LIFT contact info + intake link |
| `/faq` | Rewrite: rural eligibility, no-cost services, MBDA consent/LOE, data privacy |
| `/resources` | Rewrite: LIFT forms + training library + webinar replays |
| `/partners` | Rewrite: partner directory from `liftPartnerAgreements`/strategic partners |
| `/team`, `/leadership` | Replace with Center staff roster (pending input) |
| `/privacy-policy`, `/terms-of-service`, `/accessibility`, `/policies/*` | Rewrite for a university/federal program site |
| `/register`, `/forms/[slug]` | Keep — LIFT registration/intake entry points |
| `/opportunities` | Repurpose → public SAM.gov teaser board for the Proposal Accelerator |
| `/media`, `/video-media`, `/webinars/*` | Keep shells; repopulate with LIFT webinars/summit recordings |

### REMOVE or redirect to `/` — KDM/SVP commercial content

- **5 Pillars:** `/5-pillars/*` (index + 5 subpages)
- **KDM services/industries:** `/services/*`, `/capabilities/*`,
  `/capability-statement`, `/core-competencies`, `/industries/*`, `/our-work`,
  `/case-studies`, `/companies/*`
- **Paid commerce:** `/pricing`, `/membership*`, `/checkout-cart`,
  `/demo-signup`, `/marketplace`, `/products`, `/for-buyers`, `/jobs`
- **KDM programs:** `/consortium/*`, `/kdm-consortium/*`, `/affiliates/*`,
  `/cmmc*`, `/antifragile`, `/v-edge`, `/iaeoz-summit`, `/oem`, `/kdm-launch`,
  `/company`, `/what-works/*`, `/book/[slug]`, `/values-mission-vision`
- Implementation: delete folders (or gate behind branding mode) and add
  permanent redirects in `next.config` so external links land on LIFT
  equivalents.

## 3. Shared/global components

| Item | File | Action |
| --- | --- | --- |
| Navbar | `components/shared/navbar.tsx` | LIFT menu: About · Services · Events · Blog · Resources · Partners · Contact + "Apply Now" CTA |
| Footer | `components/shared/footer.tsx` | LIFT address/email/phone, MBDA funding acknowledgment, co-brand logos |
| Logo | `kdm-logo-animated`, `/public` assets | Replace with LIFT/MBDA lockup when branding pack arrives |
| Hero/home sections | `components/marketing/*` | Rebuild hero/stats/CTA; five-pillars-section → 3 LIFT service areas; testimonials → consent-gated impact stories |
| Discount/lead popups | `discount-hero.tsx`, `discount-banner.tsx`, `contact-popup.tsx` | Hidden in LIFT mode |
| Metadata | `app/layout.tsx`, `sitemap.ts` | LIFT title/description/keywords; site URL from env |
| JSON-LD | `components/seo/json-ld.tsx` | Organization/LocalBusiness → Southern University LIFT Center |
| Sign-in | `app/sign-in/page.tsx` | LIFT logo + "LIFT Client Portal" |
| Email templates | `api/contact`, book-call notify | LIFT sender + signatures |

## 4. Content sources

Requirements folder: Federal Contracting Capability Brief (service copy),
`LIFTProjectPerformanceWorksheetFinal` (mission/milestones), ITAC project
narrative draft, DRAFT LIFT press release (About boilerplate), SU summit flyer
(events copy), `favicon.ico` (LIFT icon).

## 5. Stock imagery (Pexels/Unsplash search terms)

- Hero: "rural Louisiana farmland aerial", "small town main street"
- Advising: "small business owner meeting advisor"
- Workshops: "workshop presentation audience", "community college classroom"
- Contracting: "capitol building", "handshake office"
- Capital: "calculator loan paperwork", "banking documents"
- Proposals: "writing documents laptop"
- Impact stories: "small business owner portrait storefront"
- Partners: "community partnership handshake", "university campus"

## 6. Phases

0. **Inputs:** MBDA branding pack, LIFT domain/email, Center address/phone,
   staff roster, resolved KPI targets, MBDA disclaimer text.
1. **Structure:** navbar, footer, metadata, sign-in, sitemap, JSON-LD,
   marketing layout (done in LIFT mode); route removal/redirects pending.
2. **Core pages:** home, about, contact, faq, services-overview, events → B6.
3. **Secondary:** news/press/resources/partners/team/legal; image population.
4. **Verification:** grep `KDM|Strategic Value|SVP|5 Pillars` across
   `app/(marketing)` + `components/{shared,marketing}` → 0 visible refs;
   build + visual check; intake CTA reaches `/forms/lift-intake` publicly.

## 7. Open questions

- Out-of-scope services fee page: include or omit?
- Any KDM blog/news posts carry over vs fresh LIFT content only?
- Summit flyer events on the public calendar at launch?
- Staff roster/photos for the Team page (already requested via email).
