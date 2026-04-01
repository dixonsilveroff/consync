# ConSync Role Design Documentation

## Overview
This document defines the role structure for ConSync, focusing on enforcing trust, controlling financial flow, and ensuring real-world usability. The system adopts an asymmetric power model between Clients and Contractors.

---

## Core Principle
ConSync is not a collaborative tool. It is a **controlled execution system** where:
- The Client controls money
- The Contractor executes work under defined constraints

---

## Role Architecture

### 1. Client (Primary Role)

#### Definition
The Client is the economic authority within the system. This role funds the project and controls financial decisions.

#### Responsibilities
- Create and configure projects
- Define milestones and budgets
- Deposit funds into escrow
- Approve or reject milestone completion
- Approve or reject budget variations
- Initiate disputes
- Monitor project progress

#### Permissions
- Full visibility across all project data
- Authority to release or withhold payments
- Authority to freeze funds during disputes
- Authority to approve cost changes

#### UX Requirements
- Clear financial dashboards
- Visibility into progress and risks
- Simple approval workflows
- Audit trail access

---

### 2. Contractor (Secondary Role)

#### Definition
The Contractor is the execution actor responsible for delivering work and reporting progress.

#### Responsibilities
- Accept project invitation
- Submit proof of work (images/videos)
- Request milestone completion
- Report delays and issues
- Request budget adjustments

#### Permissions
- Limited project visibility (relevant tasks only)
- Ability to submit updates and requests
- No direct control over funds

#### UX Requirements
- Mobile-first interface
- Minimal input complexity
- WhatsApp integration for submissions
- Quick action buttons (Submit, Request, Report)

---

## Interaction Flow

### Standard Workflow
1. Client creates project and invites contractor
2. Contractor accepts invitation
3. Client defines milestones and funds escrow
4. Contractor executes work
5. Contractor submits proof
6. Client reviews and approves
7. Payment is released

---

## Power Structure

### Asymmetry Model
- Client has financial authority
- Contractor has execution responsibility

This ensures:
- Trust is enforced through money control
- System cannot be bypassed easily

---

## Adoption Strategy

### Entry Point
- Primary acquisition: Clients
- Contractors are onboarded via client invitation

### Enforcement Mechanism
Contractors adopt the system because:
- Payments are tied to system usage
- Proof submission is required for payment

---

## Design Constraints

### Do NOT:
- Treat both roles as equal
- Build complex contractor dashboards
- Allow off-platform agreements to override system

### MUST:
- Tie all critical actions to money flow
- Keep contractor experience extremely simple
- Maintain strict approval gates

---

## Future Role Expansion (Post-MVP)
- Supplier (material tracking)
- Quantity Surveyor (budget validation)
- Auditor (compliance and verification)

---

## Summary
The ConSync role system is intentionally asymmetric:
- Clients control money and approvals
- Contractors execute and report

This structure ensures enforcement, adoption, and alignment with real-world construction dynamics.
