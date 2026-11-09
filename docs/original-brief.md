# MASTER BUILD PROMPT — NIGERIA PLAYER PROTECTION & PHYSICAL BETTING SHOP SELF-EXCLUSION PLATFORM

## 1. PROJECT OVERVIEW

Act as a senior full-stack engineer, product designer, UX researcher, cybersecurity specialist, and responsible gambling technology architect.

Build a fully functional, mobile-responsive web application called **SafeBet Protect Nigeria** (working name).

**Tagline:** "Your Choice. Your Protection. Your Recovery."

This is an independent, fictional demonstration platform designed to show how self-exclusion and player protection could work in physical betting shops across Nigeria, particularly informal betting outlets.

The goal is to demonstrate a practical model that could eventually be presented to SafePlay, state gambling regulators, betting companies, recovery organisations, and policymakers.

This is not an official government platform. All regulators, shops, players, enforcement actions, and reports in the demo must be fictional or clearly marked as simulations.

### The problem

Nigeria has many physical betting outlets, including small informal shops where customers place bets through attendants using laptops or desktop computers.

A player experiencing gambling-related harm may continue visiting multiple shops even after deciding to stop gambling.

This prototype must demonstrate how a self-exclusion system could operate across participating physical outlets, rather than relying only on online betting accounts.

The system must work for:

- Players using smartphones.
- Players with basic mobile phones.
- Players without personal internet access.
- Betting shop attendants using laptops.
- Shop owners managing multiple outlets.
- State gambling regulators monitoring participating shops.
- Responsible gambling support organisations.

## 2. USER ROLES

Build five independent portals with role-based authentication.

### A. Player Portal

Players should be able to:

1. Register using a mobile number.
2. Verify their number using simulated OTP authentication.
3. Complete a voluntary gambling self-assessment.
4. Apply for self-exclusion.
5. Choose an exclusion duration.
6. View their exclusion status and expiry date.
7. Generate a private verification reference.
8. Report betting shops that violate their exclusion.
9. Find recovery resources.
10. Request support from a counsellor or recovery organisation.
11. View their reports and case updates.
12. Access the platform in English or Nigerian Pidgin.

Design for users with limited digital literacy. Use large buttons, plain language, and minimal forms.

### B. Betting Shop Attendant Portal

This is one of the most important parts of the prototype.

Every participating betting shop has a laptop or desktop computer.

The attendant should be able to:

- Log in with shop-specific credentials.
- See their registered shop name, location, and licence information (fictional).
- Check whether a customer is currently excluded before accepting a bet.
- Verify a customer using a QR code or a protected reference and appropriate identity confirmation.
- See only the minimum necessary result: "EXCLUSION ACTIVE — DO NOT ACCEPT BET" or "NO ACTIVE EXCLUSION FOUND".
- Record when an excluded player is refused service.
- View daily compliance activity.
- Report a technical issue.
- Access responsible gambling training.

The attendant must not be able to see a player's assessment answers, medical history, recovery notes, or confidential complaints.

**Important:** A "no active exclusion found" result is not a guarantee that the person is eligible to gamble.

### C. Betting Shop Owner Portal

Shop owners should be able to:

- Register fictional outlets.
- Add attendants.
- Assign each attendant to a shop.
- View shop compliance statistics.
- See the number of checks performed.
- View exclusion refusals.
- Receive regulator notices.
- Review training completion.
- Monitor compliance across multiple outlets.

### D. State Gambling Regulator Portal

Create a separate regulator dashboard for every supported Nigerian state and the FCT, using fictional demonstration accounts.

The regulator should be able to:

- View registered participating betting shops in its jurisdiction.
- Review player complaints.
- Assign complaint case numbers.
- Request evidence.
- Update investigation statuses.
- View anonymised exclusion statistics.
- Identify repeated complaints involving the same outlet.
- Record simulated compliance inspections.
- Generate monthly compliance reports.
- Export anonymised data as CSV or PDF.

Complaint statuses:

- Submitted
- Received
- Under Review
- Additional Information Requested
- Referred
- Resolved
- Closed

The regulator dashboard must never claim that a real government agency received or investigated a demo report.

### E. Platform Administrator

The administrator should be able to:

- Manage demo users and roles.
- Manage fictional betting outlets.
- Manage state jurisdiction configurations.
- Manage support resources.
- Review system activity.
- Configure exclusion durations.
- Review privacy and security logs.
- Reset the demonstration data.

## 3. SELF-EXCLUSION SYSTEM — CORE FEATURE

Build a time-based voluntary self-exclusion system.

### Step 1: Start exclusion

Show the player:

"Do you want to take a break from gambling? You can voluntarily restrict yourself from participating betting shops for a period you choose."

Explain clearly what self-exclusion means and its limitations.

### Step 2: Choose duration

Offer the following demo options:

| Duration | Description |
|---|---|
| 24 hours | Short cooling-off period |
| 7 days | One-week break |
| 30 days | One-month exclusion |
| 90 days | Three-month exclusion |
| 180 days | Six-month exclusion |
| 1 year | Long-term exclusion |
| 5 years | Extended exclusion |

These are proposed demonstration durations, not representations of existing Nigerian legal requirements.

Allow the administrator to configure which periods are available under an eventual approved scheme.

### Step 3: Confirm exclusion

Display:

"You are choosing to exclude yourself from gambling at participating physical betting shops for the selected period."

Require clear voluntary consent.

Record the exact start time, end time, and Nigerian local time display.

### Step 4: Activate immediately

Once confirmed, show:

**SELF-EXCLUSION ACTIVE**

Display:

- Start date and time.
- End date and time.
- Remaining time.
- Unique private reference.
- Participating shop coverage.
- Support resources.
- Report a violation button.

### Step 5: Prevent early cancellation

An active exclusion cannot be cancelled early by the player, shop attendant, or shop owner.

Do not provide a hidden administrator override in the demonstration.

At the end of the selected period, change the status to "Period Completed".

Do not automatically mark the player as safe to gamble.

For longer exclusions, demonstrate an optional review or cooling-off process before lifting restrictions, subject to future regulator-approved rules.

### Step 6: Verification at a betting shop

When a customer visits a participating shop:

1. The attendant opens the verification dashboard.
2. The player presents a private reference or QR code.
3. The attendant completes the required identity check.
4. The system securely checks the exclusion record.
5. If active, the screen displays a prominent red warning:

"ACTIVE SELF-EXCLUSION. DO NOT ACCEPT A BET."

6. The attendant clicks "Service Refused".
7. The system records the refusal in an audit log.
8. The player can receive a simulated confirmation.

Never display sensitive player information to the attendant.

Use short-lived verification tokens rather than exposing personal information in QR codes.

### Step 7: Expiry and extension

Players should be able to extend their exclusion while it is active.

They cannot shorten it.

Show reminders as the end date approaches, but avoid promotional or gambling-related language.

All expiry calculations must be server-side, using reliable timestamps.

## 4. GAMBLING SELF-ASSESSMENT

Create a simple, non-judgmental assessment based on an appropriately licensed or public-domain validated screening instrument, such as the PGSI where legally permitted.

If using a validated instrument, preserve its exact approved questions, scoring, and interpretation.

Otherwise label the questionnaire as an educational check-in, not a validated diagnostic test.

Topics may include:

- Gambling more money than intended.
- Chasing previous losses.
- Borrowing money to gamble.
- Difficulty stopping.
- Gambling affecting relationships.
- Financial problems.
- Feeling guilty about gambling.
- Gambling interfering with work or education.
- Emotional distress connected to gambling.

After submission, display a supportive interpretation and recommended resources.

Provide a clear button:

"Start Self-Exclusion"

Never use assessment results to market gambling services or determine credit eligibility.

## 5. PLAYER RESOURCE CENTRE

Build a responsible gambling resource centre accessible without registration.

Include:

### Understanding gambling harm

- What is problem gambling?
- Why do people chase losses?
- Signs of gambling addiction.
- Gambling and financial pressure.
- Gambling and relationships.
- Understanding relapse.

### Recovery and support

- How self-exclusion works.
- What to do when you feel an urge to gamble.
- How to create a personal recovery plan.
- How to seek professional support.
- Gamblers Anonymous information.
- How family members can support someone.
- Financial recovery and debt management guidance.

### Immediate help

Create a dedicated "I Need Help Now" page.

Include grounding techniques, ways to contact a trusted person, and guidance to seek urgent local emergency help when in immediate danger.

Never invent helpline numbers. Use verified contact details only, and mark fictional demonstration contacts clearly.

## 6. REPORT A BETTING SHOP

Players must be able to report a participating betting shop that allowed or attempted to allow them to gamble while their exclusion was active.

Create a simple reporting form.

Fields:

- State.
- Local government area.
- Betting operator.
- Shop name.
- Shop location.
- Date and approximate time.
- Type of incident.
- Description.
- Optional evidence upload.
- Optional confidential contact details.

Incident categories:

- Shop accepted a bet during active exclusion.
- Attendant ignored exclusion warning.
- Shop refused to check exclusion status.
- Suspected identity misuse.
- Privacy violation.
- Other player protection concern.

After submission:

1. Generate a case number.
2. Identify the appropriate configured state jurisdiction.
3. Route the case to the fictional regulator dashboard for that state.
4. Show the player a tracking page.
5. Allow the player to add evidence.
6. Show status updates.

Provide an option to request confidentiality.

Reports must be treated as allegations, not proven violations.

Never publish a shop's identity in a public accusation feed.

### State authority directory

Build a directory covering Nigeria's 36 states and the FCT.

Each jurisdiction should have configurable fields for:

- Authority name.
- Official website.
- Complaint portal.
- Contact email.
- Telephone.
- Jurisdiction notes.
- Last verified date.

Where official details have not been verified, display:

"Official reporting channel not yet verified."

Never invent regulator names, addresses, contact details, or complaint submission endpoints.

The demo may simulate routing internally, but it must not claim a real complaint has been submitted to an authority.

## 7. THIRD-PARTY CONCERN REPORTING

Allow family members or trusted persons to submit a concern about someone's gambling.

However, third-party reporting must not automatically impose self-exclusion on another adult.

Provide a pathway for:

- Confidential support requests.
- Welfare concerns.
- Encouraging voluntary exclusion.
- Referral to an authorised review process, if one is eventually established.

Any involuntary restriction must require an appropriate lawful framework, safeguards, and review rights.

## 8. DEMONSTRATION DATA

Create realistic but completely fictional Nigerian demonstration users and outlets.

Seed at least:

- 15 fictional players.
- 20 fictional betting shops.
- 10 shop attendants.
- 5 shop owners.
- 5 state regulator accounts.
- 12 complaint cases.
- Several active, completed, and extended exclusions.

Use Lagos, Oyo, Ogun, Kano, and Rivers as initial demo jurisdictions.

Betting operator names may be fictional. Any real brand used for contextual demonstration must be clearly labelled as unaffiliated.

Never use real people's phone numbers, NINs, or medical information.

### Demonstration scenarios

Scenario A: A player registers and excludes themselves for 90 days.

Scenario B: The excluded player visits another participating betting shop and the attendant refuses service.

Scenario C: An attendant attempts to accept a bet without completing the required verification.

Scenario D: A player reports an alleged exclusion breach.

Scenario E: The fictional state regulator receives and reviews the report.

Scenario F: A player completes a gambling self-assessment and accesses recovery resources.

Scenario G: A player extends an active exclusion.

Scenario H: A player without a smartphone requests assisted enrolment at a participating shop.

Create a one-click "Run Demo" feature that walks a presenter through these scenarios.

## 9. INFORMAL MARKET DESIGN REQUIREMENTS

The platform must be usable in a small Nigerian betting outlet with:

- One laptop.
- Unstable internet.
- A basic smartphone.
- Limited technical knowledge.
- No specialist hardware.

Design principles:

- Very fast loading.
- Mobile-first responsive interface.
- Large, obvious buttons.
- Low data usage.
- Clear red and green status indicators with text labels.
- Accessible typography.
- English and Nigerian Pidgin.
- Minimal navigation.
- Keyboard-friendly laptop operation.

If connectivity fails, the system must not falsely show a player as cleared.

Display:

"Verification unavailable. Follow the shop's approved safe-service procedure."

Never use stale cached exclusion status to approve a transaction.

## 10. UI/UX DESIGN

Use a professional, trustworthy public-health technology aesthetic.

Suggested colours:

- Deep navy: #102A43
- Teal: #087F8C
- White: #FFFFFF
- Light grey: #F3F6F8
- Warning red: #C62828
- Success green: #2E7D32

Avoid gambling advertisements, casino imagery, jackpots, or celebratory betting graphics.

### Homepage

Hero heading:

**"Protection Shouldn't Stop at the Betting Shop Door."**

Supporting text:

"A demonstration of how voluntary self-exclusion, responsible gambling support, and physical betting shop compliance could work across Nigeria."

Primary buttons:

- Protect Myself
- Check My Exclusion
- Report a Betting Shop
- Find Support

Secondary navigation:

- How It Works
- Self-Assessment
- Resources
- Shop Login
- Regulator Login
- About the Project

Display a visible banner:

"Independent demonstration prototype. Not an official SafePlay or government service."

## 11. DATABASE AND TECHNICAL ARCHITECTURE

Use:

- Next.js with TypeScript.
- Tailwind CSS.
- shadcn/ui components.
- Supabase PostgreSQL or equivalent.
- Secure authentication.
- Role-based access control.
- Row-level security.
- Server-side exclusion validation.
- Secure file storage.
- Audit logging.
- Mobile-responsive PWA architecture.

Suggested database tables:

- users
- player_profiles
- shops
- shop_owners
- shop_attendants
- jurisdictions
- regulators
- self_exclusions
- exclusion_extensions
- verification_checks
- service_refusals
- assessments
- assessment_responses
- complaints
- complaint_evidence
- complaint_updates
- support_resources
- notifications
- audit_logs

### Security requirements

- Never expose a searchable public list of excluded players.
- Encrypt sensitive personal data.
- Minimise identity collection.
- Require identity verification for enrolment and shop checks.
- Prevent attendants from browsing player records.
- Prevent users from editing exclusion start or end dates.
- Use server-side authorization for all sensitive actions.
- Rate-limit verification attempts.
- Maintain tamper-evident audit logs.
- Use secure, time-limited verification references.
- Add appropriate privacy notices and consent flows.
- Design with Nigeria's Data Protection Act and applicable regulatory requirements in mind.

Use mock identity and OTP providers for the demo.

Do not connect real gambling operators or government systems.

## 12. DASHBOARD DESIGN

### Player dashboard

Show:

**My Protection Status**

- Active exclusion status.
- Days remaining.
- Exclusion start and end dates.
- Participating shop coverage.
- Extend Exclusion button.
- Report a Violation button.
- Get Support button.

### Shop dashboard

Show:

**Player Protection Check**

Large verification input.

Buttons:

- Check Exclusion
- Record Refusal
- Report Issue

Include daily verification counts and training access.

### Regulator dashboard

Show:

- Participating outlets.
- Active exclusions.
- Verification checks.
- Recorded refusals.
- Complaints received.
- Cases awaiting review.
- Repeated complaint patterns.
- Compliance trends.

Use fictional analytics with clear demo labels.

## 13. DEMO PRESENTATION MODE

Build a dedicated `/demo` route.

Allow visitors to choose:

- Enter as Player.
- Enter as Shop Attendant.
- Enter as Shop Owner.
- Enter as State Regulator.
- Enter as Administrator.

Provide clearly labelled fictional demo accounts without exposing real credentials.

Include a guided simulation:

**Player Enrols → Exclusion Activates → Shop Checks Player → Service Refused → Complaint Submitted → Regulator Reviews Case.**

All changes should be saved to the demo database so that an action in one portal appears correctly in another.

For example, when a player activates a 90-day exclusion, the shop portal must immediately recognise that active exclusion.

When a complaint is submitted, it must appear in the correct fictional regulator's dashboard.

This must be a working end-to-end demonstration, not static screens.

## 14. REQUIRED PAGES

Build the following routes:

- `/` — Homepage
- `/how-it-works`
- `/register`
- `/login`
- `/player/dashboard`
- `/player/self-assessment`
- `/player/self-exclusion`
- `/player/exclusion-status`
- `/player/reports`
- `/player/support`
- `/resources`
- `/report-shop`
- `/authorities`
- `/shop/login`
- `/shop/dashboard`
- `/shop/verify`
- `/shop/compliance`
- `/owner/dashboard`
- `/regulator/login`
- `/regulator/dashboard`
- `/regulator/complaints`
- `/regulator/shops`
- `/admin/dashboard`
- `/demo`
- `/privacy`
- `/about`

## 15. IMPLEMENTATION INSTRUCTIONS

Do not create a simple landing-page mockup.

Build a functional MVP with real navigation, persistent demo data, usable forms, working role permissions, exclusion countdowns, simulated shop verification, complaint tracking, and regulator workflows.

Implement in this order:

**Phase 1 — Foundation**

Authentication, database, role-based dashboards, fictional accounts, and responsive layout.

**Phase 2 — Core Protection**

Player registration, timed self-exclusion, exclusion extensions, shop verification, and service-refusal logging.

**Phase 3 — Reporting**

Incident forms, evidence uploads, jurisdiction routing, regulator case management, and complaint tracking.

**Phase 4 — Support**

Self-assessment, responsible gambling resources, support pathways, and language accessibility.

**Phase 5 — Demonstration**

Seed fictional data, guided walkthrough, statistics, testing, and deployment.

### Acceptance tests

Verify that:

1. A player can activate a 90-day exclusion.
2. The exclusion immediately appears in shop verification.
3. A shop attendant cannot remove or shorten an exclusion.
4. The player can extend but not shorten their exclusion.
5. Exclusion expiry is calculated correctly.
6. A shop refusal creates an audit record.
7. A complaint appears in the correct fictional state regulator dashboard.
8. A player can track their complaint.
9. Attendants cannot access confidential assessments.
10. A player can access resources without logging in.
11. The application works on mobile and desktop.
12. The demo clearly distinguishes simulated activity from real regulatory action.

## 16. FINAL DELIVERABLE

Deliver a polished, deployable web application that demonstrates how physical betting shop self-exclusion could work in Nigeria.

Include:

- Complete source code.
- Database schema and migrations.
- Fictional seed data.
- Working demo accounts.
- Environment variable template.
- Deployment instructions for Vercel.
- README explaining the concept.
- Privacy and security limitations.
- Automated tests for exclusion and role permissions.
- A five-minute guided demonstration script.

The final application should be credible enough to demonstrate to responsible gambling organisations, betting operators, government stakeholders, and technology partners.

**Ultimate mission: Show that a player who voluntarily decides to stop gambling should have a practical way to enforce that decision across participating physical betting shops, not only online platforms.**