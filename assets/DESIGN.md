# 🏗️ ConSync — DESIGN.md
**Version:** 3.0 | **Status:** Active  
**Product:** Construction Escrow & Milestone Verification Platform

---

# 1. 🎯 Design Philosophy

ConSync is a **financial trust instrument**. It is not a playful SaaS app; it is a system that holds capital, parses algorithmic evidence, and stands between disparate parties to enforce contracts. 

### Core Principles

- **Brutal Clarity.** The interface is a ledger, not a brochure. Hard lines, stark contrasts, and uncompromising structure. Every element must justify its presence.
- **Data is Structural.** Visualizations, verification states, and audit trails form the core architecture of the app.
- **Deterministic Aesthetics.** No soft shadows, no pastels, no playful rounded corners. We use `rounded-none`, heavy borders (`border-strong`), and rigid grids.
- **Financial-grade confidence.** Users are authorizing millions of naira. The design must feel like an unyielding vault crossed with an engineering schematic.

---

# 2. 🧠 Brand Identity & UI Translation

| Brand Trait | UI Translation |
|---|---|
| **Financial Trust** | Stark black and white structural base, heavy border-lines, no hidden actions. |
| **Verification Intelligence** | Monospace data readouts, visible confidence parameters, raw "wireframe" aesthetics. |
| **Construction Authority** | Grid-based layouts, blueprint references, sharp corners (`rounded-none`). |
| **Transparency by Design** | High-contrast status chips, immutable audit trail logs presented as raw data. |

---

# 3. 🎨 Color System

The palette relies on a stark, minimalist foundation (Concrete White / Graphite Black) punctuated *only* by institutional blues for action, and specific functional colors for state changes. 

## Primary Colors

| Name | Hex | Use |
|---|---|---|
| **Blueprint Blue** | `#1E4E8C` | Primary interactive elements, primary active states |
| **Deep Steel Blue** | `#163A6B` | Dark backgrounds when black is too heavy, hover states |
| **Highlight Blue** | `#2F6FD6` | Link hovers (`link-hover-fx`), focus rings |

## Foundational Colors (The Brutalist Base)

| Name | Hex | Use |
|---|---|---|
| **Concrete White** | `#F5F6F7` | App background (`bg-background`) |
| **Vault White** | `#FFFFFF` | Isolated surface areas (`bg-surface`) |
| **Graphite Black** | `#1A1C1E` | Primary headings, highest-emphasis text |
| **Steel Grey** | `#2C2F33` | Primary body text |
| **Neutral Slate** | `#94A3B8` | Muted metadata, inactive tabs |
| **Structural Border**| `#CBD5E1` | The heavy, defining line of the app (`border-border-strong`) |

## Functional / Accent Colors

**Rule:** Accent colors must be used sparingly. If everything is colored, nothing stands out.

| Name | Hex | Context |
|---|---|---|
| **Release Green** | `#4CAF50` | *ConSync Green.* Used strictly for confirmation: verified milestones, pulsing live-system indicators, released funds. |
| **Pending Amber** | `#F9C74F` | Awaiting verification, under algorithmic review |
| **Alert Red** | `#E63946` | Rejection, fraud flag, critical anomaly |

---

# 4. 🔤 Typography System

The typography is aggressively structural. It blends clean modern sans-serif for legibility with technical monospace for authority.

## Font Stack

| Role | Typeface | Notes |
|---|---|---|
| **Display / Headings** | Geist (Sans) | Used for massive hero text and primary section headers. Tracking is tight (`tracking-tighter`). |
| **Body / Interface** | Geist (Sans) | All standard UI copy, paragraphs. |
| **Data / Technical** | Geist Mono | Used extensively for labels, navigation items, monetary values, timestamps, and badges. Often paired with `uppercase tracking-widest text-xs`. |

## Typographic Rules
- **Structural Labels:** Use `font-mono text-xs font-bold uppercase tracking-widest` for section labels (e.g., "OWNER DIRECTORY", "CURRENT VAULT BALANCE").
- **Financial Data:** All naira amounts use `font-mono` to prevent misreading and convey precision.

---

# 5. 🧱 Layout & Component System

## The Brutalist Box Model
- **Borders:** We rely heavily on borders to define space, not shadows. Use `border border-border-strong`.
- **Corners:** Components should use `rounded-none`. In rare cases where softening is absolutely necessary for component nesting, use no more than `rounded-sm`.
- **Shadows:** Avoid soft, diffuse drop shadows. If elevation is needed, use flat, offset shadow blocks or rely on background tonal shifts (White against Concrete White).

## Cards & Panels
```css
/* The standard data container */
.bg-surface.border.border-border-strong.rounded-none.p-8
```
- Headers within panels are usually separated by a hard bottom border (`border-b border-border-strong pb-4`).

## Buttons
- **Primary:** `bg-text-primary text-text-inverse rounded-none font-mono tracking-widest uppercase` (Stark black block).
- **Secondary/Outline:** `border-border-strong text-text-primary rounded-none font-mono tracking-widest`.
- **Action (Fund/Approve):** Can utilize `Blueprint Blue` if it represents the primary conversion action of the view.

## Status Chips
```css
/* Brutalist Status Chip */
.border.border-border-strong.rounded-none.font-mono.text-xs.uppercase.px-3.py-1
```
Colors apply to the text and border, keeping the background transparent or subtly tinted.

---

# 6. 🎞️ Motion & Interaction

- **Hover FX:** Links use a custom `.link-hover-fx` which slides a 2px underline (using `Release Green` or `Highlight Blue` depending on context) from the bottom-right on hover.
- **Button Hovers:** Solid black buttons fade slightly to `bg-text-primary/90`.
- **Transitions:** Fast and deterministic (`duration-200`). No bouncy, elastic animations. Data should appear instantly.

---

*This document governs all design decisions for ConSync Version 3.0. Deviation from the brutalist structural model or the defined color/typography tokens requires architectural review.*
