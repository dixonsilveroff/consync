# 🏗️ ConSync — DESIGN.md
**Version:** 2.0 | **Status:** Active  
**Product:** Construction Escrow & Milestone Verification Platform — Nigerian Market

---

# 1. 🎯 Design Philosophy

ConSync is not a project management tool. It is a **financial trust instrument** — a system that holds money, releases it on verified evidence, and stands between a diaspora family in London and a contractor in Lagos who may never meet. Every design decision must be made through that lens.

### Core Principles

- **Trust is the product, not the UI.** Transparency, immutability, and evidence are the functional outcomes; the interface is just how they're delivered.
- **Clarity over decoration.** Every element must justify its presence. If it doesn't build confidence or move money safely, cut it.
- **Data is evidence.** Visualizations, verification states, and audit trails are not reporting features — they are the core value proposition.
- **Field + Office parity.** A site foreman in Abuja and a project owner in Manchester must both find the interface usable. Accessibility and low-friction loading are non-negotiable.
- **Financial-grade confidence.** The UI must feel like internet banking crossed with a legal document system. Users are releasing millions of naira. The design must justify that trust.
- **Nigerian context-first.** Design for 4G/3G conditions, variable device quality, and a WhatsApp-native user mental model. Complexity must earn its place.

---

# 2. 🧠 Brand Identity & UI Translation

ConSync sits at the intersection of **construction** and **fintech**. The brand should feel like it was built by someone who understands both industries at a deep level — not a generic SaaS product with a hard hat emoji.

| Brand Trait | UI Translation |
|---|---|
| **Financial Trust** | Clean structure, visible system states, no hidden actions, audit-trail-first layouts |
| **Verification Intelligence** | Evidence panels, confidence indicators, layered proof hierarchies |
| **Nigerian Market Rootedness** | Fast-loading assets, offline states, familiar financial UI patterns (bank-like headers, naira ₦ prominently placed) |
| **Construction Authority** | Grid-based layouts, blueprint references, structural metaphors, not decorative construction imagery |
| **Transparency by Design** | Status timelines, fund flow visualizations, nothing buried in submenus |
| **Controlled Urgency** | Clear escalation states, SLA countdowns, milestone deadlines that feel real |

---

# 3. 🎨 Color System

The palette is anchored in deep institutional blue — the color of ledgers, contracts, and trust — with construction-site accent tones. No pastels. No playfulness. This is money.

## Primary Colors

| Name | Hex | Use |
|---|---|---|
| **Blueprint Blue** | `#1E4E8C` | Primary actions, identity, nav active states |
| **Deep Steel Blue** | `#163A6B` | Gradient base, sidebar background, headers |
| **Highlight Blue** | `#2F6FD6` | Interactive elements, links, hover states |

## Secondary Colors

| Name | Hex | Use |
|---|---|---|
| **Concrete White** | `#F5F6F7` | Page background, card surfaces |
| **Steel Grey** | `#2C2F33` | Primary body text |
| **Graphite Black** | `#1A1C1E` | Headings, high-emphasis text |
| **Ledger Line** | `#E2E8F0` | Borders, dividers, table lines |

## Functional / Status Colors

| Name | Hex | Context |
|---|---|---|
| **Release Green** | `#4CAF50` | Funds released, milestone approved, verified |
| **Pending Amber** | `#F9C74F` | Awaiting verification, under review |
| **Escrow Blue** | `#3B82F6` | Funds held, in-escrow state |
| **Alert Red** | `#E63946` | Rejection, fraud flag, critical anomaly |
| **Neutral Slate** | `#94A3B8` | Inactive states, disabled, captions |

## Usage Rules

- **Blue = platform identity and primary financial actions** (Release Funds, Submit Milestone, Approve)
- **Green = confirmation and money movement** — use sparingly; it means something real happened
- **Amber = action required** — never leave an amber state unresolved in the UI
- **Red = exception state** — never use decoratively
- **Never use gradients on data elements** — only on brand surfaces (headers, hero sections)

---

# 4. ✨ Logo & Brand Mark

## Concept
The ConSync mark is built on the concept of **synchronized flow** — funds and verification moving in lockstep. The dual-loop form represents the two parties (project owner + contractor) whose interests must align before any value moves.

## Mark Direction
- Infinity loop structure = **continuous verification lifecycle**
- Dual-tone flow = **synchronization between financial and physical progress**
- Blue body = **structural trust and institutional weight**
- Green/amber edges = **progress state and energy**

## Construction Rules
- Use **subtle gradients** with internal depth — no flat fills, no plastic gloss
- Add **inner shadow and edge highlight** for weight
- The mark must work at 16px (favicon) without losing identity
- Wordmark: **Poppins SemiBold** — set in Blueprint Blue on light backgrounds; Concrete White on dark

## Logo Variants
| Variant | Use Context |
|---|---|
| Full (mark + wordmark) | Marketing, onboarding, email headers |
| Mark-only | Favicon, app icon, mobile nav, loading states |
| Monochrome dark | Legal documents, certificates, PDFs |
| Monochrome light | Dark sidebar, hero sections |
| Stamp variant | Milestone certificates — embedded in approval documents |

---

# 5. 🔤 Typography System

The type system balances institutional authority with screen readability. Financial data needs a different typographic treatment than project narrative — the system accommodates both.

## Font Stack

| Role | Typeface | Weight | Notes |
|---|---|---|---|
| **Display / Hero** | Poppins | Bold (700) | Brand-level headings, landing page |
| **UI Headings** | Poppins | SemiBold (600) | Dashboard sections, card titles |
| **Body / Interface** | Inter | Regular / Medium (400/500) | All UI copy, labels, descriptions |
| **Data / Financial** | JetBrains Mono | Regular (400) | All monetary values, transaction IDs, hashes |
| **Legal / Documents** | Inter | Regular (400) | Milestone certificates, contracts |

## Type Scale

| Token | Size | Line Height | Use |
|---|---|---|---|
| `--text-display` | 48px | 1.1 | Hero, landing page |
| `--text-h1` | 36px | 1.2 | Page titles |
| `--text-h2` | 28px | 1.3 | Section headers |
| `--text-h3` | 22px | 1.4 | Card headers, panel titles |
| `--text-h4` | 18px | 1.4 | Subsection labels |
| `--text-body` | 16px | 1.6 | Default body text |
| `--text-small` | 14px | 1.5 | Captions, metadata, timestamps |
| `--text-micro` | 12px | 1.4 | Legal footnotes, field labels |
| `--text-mono` | 14px | 1.5 | Naira values, IDs, hashes |

## Financial Data Typography Rules

- **All naira amounts use JetBrains Mono** — this draws the eye and prevents misreading
- Currency symbol (₦) always precedes the value with zero spacing: `₦4,500,000`
- Large amounts use comma separators: never `4500000`, always `4,500,000`
- Negative or withheld amounts shown in Alert Red with parentheses: `(₦450,000)`
- Fund release amounts shown in Release Green: `+₦1,200,000`

---

# 6. 🧱 Layout System

## Grid
- **Base unit:** 8px
- **Max content width:** 1280px (dashboard), 960px (forms/detail views)
- **Page padding:** 24px (mobile), 32px (tablet), 48px (desktop)
- **Column system:** 12-column for dashboard, 4-column for mobile

## Primary Layout Patterns

### Dashboard Shell
```
┌────────────────────────────────────────────────────────┐
│  SIDEBAR (240px fixed)  │  MAIN CONTENT AREA           │
│  ─────────────────────  │  ─────────────────────────── │
│  Logo                   │  TOP BAR (search, notif, user)│
│  ─────────────────────  │  ─────────────────────────── │
│  Primary Nav            │                              │
│  ─────────────────────  │  CONTENT (card-based grid)   │
│  Fund Status Summary    │                              │
│  ─────────────────────  │                              │
│  Quick Actions          │                              │
└────────────────────────────────────────────────────────┘
```

### Verification Review Panel (Inspector / Owner)
```
┌──────────────────────────────────────────────────────────┐
│  LEFT (40%)            │  CENTER (35%)  │  RIGHT (25%)   │
│  ─────────────────     │  ─────────────│  ─────────────  │
│  Video / Photo         │  AI Report    │  History        │
│  Evidence Grid         │  Criteria     │  Prior Analyses │
│                        │  Breakdown    │  Open Anomalies │
│  ─────────────         │  ─────────────│                 │
│  DECISION BAR          │               │                 │
│  Approve | Reject | Request Resubmit   │                 │
└──────────────────────────────────────────────────────────┘
```

## Spacing Philosophy

| Context | Spacing | Rationale |
|---|---|---|
| Financial data rows | Tight (8–12px) | Optimized for scanning large values |
| Decision / approval areas | Loose (32–48px) | Deliberate friction — this is money |
| Evidence panels | Medium (16–24px) | Balanced readability |
| Form inputs | Standard (16px gap) | Field parity, no confusion |

## Elevation System

- **No heavy drop shadows** — this is a ledger system, not a consumer app
- **Layering via border + background tonal shift** — matches a "built document" feel
- **Precision shadow** (data cards): `0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)`
- **Raised surface** (modals, review panels): `0 4px 16px rgba(0, 0, 0, 0.12)`
- **Interactive highlight** (hover on clickable cards): border shifts from `#E2E8F0` → `#2F6FD6`

---

# 7. 🧩 Component System

## Buttons

### Primary Action (Fund Release, Approve Milestone)
```
Background: Blueprint Blue (#1E4E8C)
Text: Concrete White, Poppins SemiBold 14px
Padding: 12px 24px | Radius: 8px
Hover: #2F6FD6 + subtle elevation
Focus: 3px outline, Blueprint Blue 40% opacity
```
> ⚠️ **Destructive variant** (Release Funds, Final Approve): requires confirmation modal — never single-click

### Secondary (View, Export, Edit)
```
Style: Outlined — Blueprint Blue border + text
Hover: Blueprint Blue fill + white text
```

### Ghost (Cancel, Dismiss)
```
Style: No border, Steel Grey text
Hover: Concrete White background fill
```

### State Rules
- **Disabled:** 40% opacity — never hide disabled buttons, show why they're disabled via tooltip
- **Loading:** Spinner inside button, text replaced with "Processing..." — never double-submit risk
- **Destructive confirmation:** Two-step — first click shows confirmation popover, second click executes

---

## Status Badges

ConSync has a rich set of system states that must be visually distinct at a glance. Badges are the primary carrier of this information.

| Status | Color | Background | Use |
|---|---|---|---|
| `FUNDS HELD` | Escrow Blue | Blue/10% | Money is in escrow |
| `VERIFIED` | Release Green | Green/10% | Milestone confirmed |
| `PENDING REVIEW` | Pending Amber | Amber/10% | Awaiting inspector |
| `PAYMENT RELEASED` | Release Green | Green/15% | Funds have moved |
| `RESUBMIT REQUIRED` | Alert Red | Red/10% | Submission rejected |
| `AI SCREENING` | Escrow Blue | Blue/8% | AI pipeline running |
| `FRAUD FLAGGED` | Alert Red | Red/15% | Integrity concern |
| `ESCALATED` | Pending Amber | Amber/15% | Needs senior review |

Badges: `font-size: 12px`, `font-weight: 600`, `letter-spacing: 0.4px`, `ALL CAPS`, `border-radius: 4px`, `padding: 3px 8px`

---

## Cards

### Project Card
```
Background: #FFFFFF
Border: 1px solid #E2E8F0
Border-left: 4px solid [status color] — always shows health at a glance
Radius: 12px
Shadow: 0 1px 3px rgba(0,0,0,0.08)
Hover: border-color shifts to #2F6FD6 + cursor: pointer
```

Content hierarchy within cards:
1. Project name (H3, Graphite Black)
2. Status badge (top-right)
3. Fund progress bar (visual % released vs. held)
4. Key metadata: Location | Type | Contract Value
5. Last activity timestamp (micro text, Neutral Slate)

### Milestone Card
Same base, but includes:- Linked escrow amount (JetBrains Mono, Release Green or Escrow Blue)
- Verification tier icon (GPS / AI / Human layers completed)
- Days overdue indicator (shown only when relevant — amber background)

### Evidence Card (Photo/Video Verification)
```
Aspect ratio: 16:9 thumbnail
Corner badge: GPS | TIMESTAMP overlay (small, monochrome)
On hover: expand icon + "View Evidence" label
Verified frames: thin green border
Flagged frames: thin red border
```

---

## Tables

Used for transaction logs, milestone lists, audit trails.

```
Header row: Blueprint Blue/8% background, Poppins SemiBold 13px, ALL CAPS
Data rows: alternating white / #F9FAFB
Row height: 52px (financial data needs breathing room)
Hover: #EFF6FF row highlight
Border: 1px solid #E2E8F0, header bottom border 2px
```

Financial columns:
- Right-align all naira values
- Monospace font for all amounts
- Color-code positive (green) vs. held (blue) vs. withheld (red)

---

## Forms & Input Fields

```
Input height: 44px
Label: Poppins Medium 13px, Steel Grey, above the field
Border: 1px solid #CBD5E1
Focus border: 2px solid Blueprint Blue
Error border: Alert Red + error message below in 12px red
Placeholder: Neutral Slate, italic
Border-radius: 8px
```

### Financial Input Fields (Amount Entry)
- Prefix `₦` always visible inside the input (not placeholder)
- Monospace font in the field
- Formatted as user types: auto-inserts commas
- Show equivalent USD/GBP rate below for diaspora context (small, Neutral Slate)

---

## Fund Flow Visualization (Core Product Component)

The escrow progress component is the most important data visualization in the product. It communicates the state of a project's money at a glance.

```
Total Contract Value bar (full width)
├── Released (green fill) — funds that have been paid out
├── In Escrow (blue fill) — funds held pending verification
├── Pending Claims (amber fill) — milestones submitted, under review
└── Remaining (grey fill) — not yet claimed

Below the bar:
₦ Released | ₦ Held | ₦ Pending | ₦ Remaining
(all in JetBrains Mono, color-matched)
```

---

## Verification Triage Indicator

Shows the three-layer verification process state on each milestone:

```
Layer 1 — Metadata ● (GPS + Timestamp)    [✓ Passed | ✗ Failed | ⌛ Pending]
Layer 2 — AI Analysis ●                   [✓ Confident | ~ Review | ✗ Failed]
Layer 3 — Human Review ●                  [✓ Approved | ⌛ In Queue | ✗ Rejected]
```

Visual: Three connected circles in a horizontal chain. Completed layers fill solid (green). Active layer pulses. Failed layer shows red X. This chain appears on every milestone card and detail view.

---

## Milestone Certificate (Document Component)

The certificate is an in-app rendered document, not just a PDF download. It should feel like a formal legal instrument:

- Dark header with ConSync logo + "Milestone Verification Certificate"
- Project details in structured grid
- Verification chain summary (three layers, checkmarks)
- QR code (bottom right) — links to immutable audit record
- SHA-256 hash (monospace, small, below video reference)
- Inspector name + credential or "AI Auto-Verified" designation
- Print-ready styling with defined page margins

---

# 8. 📊 Data Visualization

## Principles
- Every chart must answer a question a project owner or developer would actually ask
- Financial data is primary — construction progress data is contextual
- No decoration — no 3D charts, no gradients on data bars
- All charts must be readable on mobile without zooming

## Chart Types & Applications

| Chart Type | Use Case |
|---|---|
| **Horizontal progress bar** | Fund release progress, milestone completion % |
| **Stacked bar** | Budget breakdown: released vs. held vs. remaining |
| **Timeline / Gantt strip** | Milestone schedule vs. actual |
| **Line chart** | Project velocity over time, fund draw-down curve |
| **Donut (small)** | Budget category distribution within a project |
| **Heat map** | Portfolio-level: project health across all active sites |

## Chart Color Rules
- Primary data: Blueprint Blue
- Positive/released: Release Green
- Held/pending: Escrow Blue
- Warning: Pending Amber
- Breach/deficit: Alert Red
- No more than 4 colors in a single chart

---

# 9. 🧭 Navigation System

## Sidebar (Primary — Desktop)

```
ConSync Logo
─────────────────────────
Projects
Milestones
Escrow & Payments
Verification Queue  [Badge: # pending]
Materials
Documents
Reports
─────────────────────────
Settings
Help & Support
```

### Sidebar Fund Summary (Persistent Widget)
A compact fund summary is always visible at the bottom of the sidebar for authenticated project owners:
```
TOTAL HELD IN ESCROW
₦12,450,000
[3 projects active]
```

## Top Bar

- Search (projects, milestones, contractors)
- Notification bell (badge count — escalations, approvals, rejections)
- NGN/USD rate ticker (small, for diaspora context — fetched live)
- Profile menu (account, KYC status, logout)

## Mobile Navigation

Bottom tab bar (5 items max):
```
[Projects] [Milestones] [Escrow] [Queue] [Menu]
```

Active tab: Blueprint Blue icon + label
Inactive: Neutral Slate icon, no label on small screens

---

# 10. 📱 Responsive Design

## Breakpoints

| Breakpoint | Min Width | Layout |
|---|---|---|
| Mobile | 320px | Single column, bottom nav, stacked cards |
| Tablet | 768px | Two-column content, collapsible sidebar |
| Desktop | 1024px | Full sidebar, three-panel layouts |
| Wide | 1440px | Max-width container, increased density |

## Mobile-Specific Principles

- **Contractor-facing flows are mobile-primary.** Video submission, GPS check, checklist confirmation — all built for one-handed use.
- **Owner-facing flows are desktop-preferred** but must be readable on mobile (approving a milestone on a phone at 11pm is a real scenario).
- Touch targets: minimum 44×44px — no exceptions
- Bottom sheet modals instead of centered dialogs on mobile
- Offline state must always be communicated — gray status bar: "You're offline — submissions will sync when connected"
- WhatsApp-style notification deep links: tapping a message notification should deep-link directly to the relevant milestone or approval screen

## Offline State Design

ConSync must degrade gracefully with zero connectivity:
- Read-only views of cached project data remain accessible
- Submission queue shows "Queued for upload" state clearly
- Sync progress indicator when connection restores
- Never show stale financial data without a timestamp + "last synced" label

---

# 11. 🔐 Trust & Transparency UX Patterns

These patterns are unique to ConSync and address the core trust deficit problem directly.

## Audit Trail Component

Every transaction, approval, and rejection generates an immutable audit entry. The audit trail UI is a vertical timeline:

```
● 14 Oct 2025, 14:30  — Milestone approved by Engr. Adaeze Okonkwo
  Ground Floor Slab Completion verified. AI confidence: 91%.
  
● 14 Oct 2025, 09:15  — AI analysis completed
  12 frames reviewed. 7/8 criteria MET. 1 flagged for human review.
  
● 14 Oct 2025, 08:44  — Submission received
  GPS verified ✓ | Timestamp verified ✓ | Video quality: Good
  
● 13 Oct 2025, 17:22  — Funds held in escrow
  ₦1,800,000 locked for Ground Floor Slab milestone
```

Timeline nodes: colored by event type (green = positive, blue = neutral, amber = action, red = exception)

## Fraud Signal Indicators

When the intake layer flags an integrity concern, this is shown non-alarmingly but clearly:

```
⚠️  Integrity Notice
GPS coordinates are 85m outside the registered site boundary.
This submission has been routed for manual review.
Contractor has been notified.
```

Never accuse — always state the fact and the action taken.

## Evidence Confidence Display

The AI confidence score is shown to inspectors (not to contractors directly) as a structured breakdown, never as a raw number:

```
AI Analysis  —  High Confidence (91%)
✓ 7 of 8 acceptance criteria visually confirmed
~ 1 criterion unverifiable (partial occlusion)
⚠ 1 low-severity anomaly flagged (surface marking)
```

---

# 12. 🎞️ Motion & Interaction

## Rules
- Motion is functional, not decorative
- Duration: 150–250ms for transitions; 300–400ms for significant state changes
- Easing: ease-out for entries; ease-in for exits; ease-in-out for transforms
- Never animate financial values without user intent (no auto-counting animations)
- Reduce motion: honor `prefers-reduced-motion` media query throughout

## Key Interaction Moments

| Interaction | Motion Pattern |
|---|---|
| Fund release confirmation | Slow green fill across the progress bar (600ms) — this should feel significant |
| Milestone approval | Card border animates to green, badge updates, brief checkmark pulse |
| Rejection / fraud flag | Card border shifts red, shake animation (once, brief) — not punishing, but clear |
| AI analysis running | Skeleton loader on evidence grid; subtle scan-line animation on pending frames |
| Escrow lock | Lock icon animates closed; blue fill progresses across held segment |
| New notification | Bell icon gentle pulse; count badge slides in |
| Page transitions | Fade + 8px upward translate — consistent across all routes |

---

# 13. 🖼️ Imagery & Visual Style

## Photography Guidelines

- **Real Nigerian construction sites** — not stock photos of Western suburban builds
- Reinforced concrete frames, block-laying, iron rod placement, site supervisors with devices
- Authentic site conditions: dust, sunlight, informal scaffolding — not sanitized
- Workers and engineers using mobile phones on site
- Diaspora context: video call screenshots overlaid on site imagery for landing page

## Illustration Style

- Blueprint-inspired line art for empty states and onboarding
- Construction cross-sections and structural diagrams for educational tooltips
- Low color saturation — illustrations should never compete with data
- Avoid generic "fintech blob illustrations" — they undermine the construction authority

## Empty States

Each empty state should be specific and instructional:

```
[No milestones yet illustration]
"No milestones set up for this project.
 Add your first milestone to start locking funds and tracking progress."
 [+ Add Milestone]  [View BOQ Template]
```

---

# 14. 🌐 Localization & Nigerian Market Specifics

## Currency
- All monetary values displayed in ₦ NGN by default
- Diaspora users can toggle a secondary display in GBP/USD/CAD/AED (based on profile)
- Exchange rate shown at top bar — updated every 30 minutes
- Inflation Shield component: show real-time material price index for cement, rebar where available

## Language
- English is the primary language (Nigerian English norms apply)
- Legal and formal copy should avoid idioms that read ambiguously in Nigerian English
- Error messages must be plain and action-oriented: "The video is too short. Record at least 15 seconds of the milestone area."

## Network Resilience
- All assets lazy-loaded, with low-quality image placeholders (LQIP)
- Dashboard summary data (most critical) loads first, peripheral data loads after
- Target: dashboard usable on 3G within 3 seconds on mid-range Android
- Avoid Google Fonts CDN for core UI typefaces — self-host Inter and Poppins

---

# 15. 🧪 Design Tokens (Dev-Ready)

```css
:root {
  /* Core Brand */
  --color-primary:          #1E4E8C;
  --color-primary-dark:     #163A6B;
  --color-primary-light:    #2F6FD6;
  --color-primary-faint:    #EFF6FF;

  /* Backgrounds */
  --color-bg:               #F5F6F7;
  --color-surface:          #FFFFFF;
  --color-surface-raised:   #FFFFFF;

  /* Text */
  --color-text-primary:     #1A1C1E;
  --color-text-secondary:   #2C2F33;
  --color-text-muted:       #94A3B8;
  --color-text-inverse:     #FFFFFF;

  /* Borders */
  --color-border:           #E2E8F0;
  --color-border-strong:    #CBD5E1;

  /* Status: Positive */
  --color-success:          #4CAF50;
  --color-success-bg:       #F0FDF4;
  --color-success-border:   #BBF7D0;

  /* Status: Pending */
  --color-warning:          #F9C74F;
  --color-warning-bg:       #FEFCE8;
  --color-warning-border:   #FDE68A;

  /* Status: Escrow */
  --color-escrow:           #3B82F6;
  --color-escrow-bg:        #EFF6FF;
  --color-escrow-border:    #BFDBFE;

  /* Status: Alert */
  --color-danger:           #E63946;
  --color-danger-bg:        #FFF1F2;
  --color-danger-border:    #FECDD3;

  /* Typography */
  --font-display:           'Poppins', sans-serif;
  --font-body:              'Inter', sans-serif;
  --font-mono:              'JetBrains Mono', monospace;

  /* Type Scale */
  --text-display:           48px;
  --text-h1:                36px;
  --text-h2:                28px;
  --text-h3:                22px;
  --text-h4:                18px;
  --text-body:              16px;
  --text-small:             14px;
  --text-micro:             12px;
  --text-mono:              14px;

  /* Spacing */
  --space-1:    4px;
  --space-2:    8px;
  --space-3:    12px;
  --space-4:    16px;
  --space-5:    20px;
  --space-6:    24px;
  --space-8:    32px;
  --space-10:   40px;
  --space-12:   48px;
  --space-16:   64px;

  /* Radius */
  --radius-sm:  4px;
  --radius:     8px;
  --radius-md:  12px;
  --radius-lg:  16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm:  0 1px 3px rgba(0, 0, 0, 0.10), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md:  0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-lg:  0 8px 32px rgba(0, 0, 0, 0.12);

  /* Motion */
  --duration-fast:    150ms;
  --duration-base:    200ms;
  --duration-slow:    300ms;
  --duration-release: 600ms;
  --ease-out:         cubic-bezier(0.0, 0.0, 0.2, 1.0);
  --ease-in:          cubic-bezier(0.4, 0.0, 1.0, 1.0);
  --ease-in-out:      cubic-bezier(0.4, 0.0, 0.2, 1.0);
}
```

---

# 16. 📋 Screen Inventory

The following are the core screens the design system must support. Each is a first-class design artifact, not a generated form.

| Screen | Primary User | Priority |
|---|---|---|
| Landing Page (waitlist) | Remote Guardian, Margin Developer | P0 |
| Onboarding / KYC | All | P0 |
| Project Dashboard (Owner) | Remote Guardian | P0 |
| Project Dashboard (Developer) | Margin Developer | P0 |
| Milestone Detail & Verification Chain | Both | P0 |
| Escrow Fund Overview | Both | P0 |
| Video Submission (Mobile) | Contractor | P0 |
| Verification Review Panel | Inspector / Owner | P0 |
| Milestone Certificate View | Both | P0 |
| Audit Trail | Both | P1 |
| Materials & Procurement | Developer | P1 |
| Contractor Management | Developer | P1 |
| Portfolio Overview | Multi-project Developer | P1 |
| Notification Centre | Both | P1 |
| Analytics & Reporting | Both | P2 |
| Admin / Operations Console | ConSync Internal | P2 |

---

*This document governs all design decisions for ConSync. It should be updated when product strategy shifts, not when individual features are added. Refer to the System Documentation V2 and AI Analysis Technical Documentation for the engineering context behind each design decision.*

*Version history should be tracked in Git alongside code changes — design is not a separate discipline at ConSync, it is part of the product build.*