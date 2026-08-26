# PathPal — Smarter Hospital Navigation & Companion Care

> A comprehensive healthcare navigation and companion care platform pairing vulnerable or anxious patients with trained, compassionate healthcare companions (**Pals**) supported by a real-time digital coordination portal.

---

## 🏥 Overview

Navigating massive hospital complexes, specialty clinics, and outpatient diagnostic centers can be overwhelming, stressful, and physically challenging. **PathPal** bridges the gap between arrival and appointment by connecting patients with certified, background-checked healthcare companions.

PathPal delivers end-to-end support:
- **Curbside-to-Clinic Guidance**: Companions meet patients at hospital drop-offs, help navigate labyrinthine corridors, and ensure on-time clinic arrivals.
- **Supportive Waiting & Note-Taking**: Companions provide calming support during waiting periods and help patients track post-visit instructions.
- **Hospital Flow Optimization**: Reduces missed appointments, late arrivals, and corridor congestion for medical centers.

---

## 🌟 Core Portals & Capabilities

### 1. 🧑‍🦯 Patient Portal
- **Companion Booking & Matching**: On-demand and scheduled Pal requests with tailored mobility needs (wheelchair assistance, visual guidance, memory support, multi-language preferences).
- **Live GPS & ETA Tracking**: Curbside meeting coordination with live map views and real-time companion ETA calculations.
- **Care Summaries & Appointment Notes**: Centralized discharge notes, clinical follow-up reminders, and calendar exports.
- **Transparent Charges**: Upfront pricing breakdowns ($26/hr base rate, hospital coordination credits, insurance reimbursement guides).

### 2. 🤝 Pal Companion Portal
- **Companion Dashboard**: Active shift schedules, incoming hospital escort requests, and patient mobility briefs.
- **Verified Digital Badge**: Official credential display with photo identification, background-check status, and hospital affiliations.
- **Earnings & Mileage Ledger**: Transparent shift log tracking completed hours, base pay, and direct Stripe payouts.
- **Secure Onboarding & Verification**: Multi-step registration validating hospital administrator approval, background checks, and email verification.

### 3. 🏢 Admin & Coordination Center
- **Pal Application Pipeline**: Real-time review of prospective Pal companion applications from `pal_applications`.
- **One-Click Authorization**: Approve verified applicants, automatically generating a secure invitation link for Supabase Auth registration.
- **Department Fleet Oversight**: Live roster of active hospital Pals, badge numbers, background check clearances, and department allocations.
- **Role-Based Access Control**: Sensitive Pal and Patient dispatch records are strictly protected behind Admin login credentials.

### 4. 🤖 AI CareBot & Accessibility Tools
- **PathPal CareBot**: Interactive assistant offering hospital department directories, pre-visit packing checklists, and navigation tips.
- **WCAG Accessibility & Keyboard Shortcuts**: Built-in keyboard shortcuts (Alt+1 through Alt+5, Alt+R, Alt+G, Alt+K, Alt+C) for motor-impaired and power users.
- **Multi-Language & Theme Support**: Dynamic language switching and high-contrast light/dark themes.
- **Offline Resilience Banner**: Automatic detection and notification when network connectivity is lost.

---

## 🗄️ Database & Supabase Architecture

PathPal leverages **Supabase** for secure authentication and persistent database storage:

### Database Tables

| Table | Purpose | Key Columns |
| :--- | :--- | :--- |
| `pal_applications` | Stores applicant submissions and admin review state | `id` (UUID), `name`, `email`, `phone`, `languages`, `status` (`pending`, `approved`, `rejected`), `created_at` |
| `pals` | Stores certified companion records | `id` (int4), `auth_user_id` (UUID), `name`, `phone`, `bio`, `availability`, `background_check_status`, `rating`, `hourly_rate_cents`, `stripe_account_id` |

### Pal Onboarding & Auth Flow
1. **Application Submission**: Prospective Pals apply via `BecomePalModal`. The record is inserted into `pal_applications` with `status: 'pending'`.
2. **Admin Approval**: Administrators review applications in `HospitalPortalPage` (accessible after Admin authentication) and mark them as `approved`, preparing the corresponding `pals` record.
3. **Account Creation**: Approved applicants receive a registration link (`#pal-signup?app_id=...`) to create their Supabase Auth user.
4. **Email Confirmation & Profile Linking**: Upon confirming their email (`#pal-verify`), `verifyPalEmailAndActivate()` links `pals.auth_user_id = user.id`.
5. **Pal Login**: Pals log into `PalPortalPage` using their verified credentials.

---

## ⌨️ Accessibility Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Alt</kbd> + <kbd>1</kbd> | Navigate to **Home** |
| <kbd>Alt</kbd> + <kbd>2</kbd> | Navigate to **Patient Portal** |
| <kbd>Alt</kbd> + <kbd>3</kbd> | Navigate to **Pal Portal** |
| <kbd>Alt</kbd> + <kbd>4</kbd> | Navigate to **Admin Portal** |
| <kbd>Alt</kbd> + <kbd>5</kbd> | Navigate to **About & Social Impact** |
| <kbd>Alt</kbd> + <kbd>R</kbd> | Open **Request a Pal** Modal |
| <kbd>Alt</kbd> + <kbd>G</kbd> | Open **Live GPS Tracker** |
| <kbd>Alt</kbd> + <kbd>C</kbd> | Open **Calendar Integration** (.ics exporter) |
| <kbd>Alt</kbd> + <kbd>K</kbd> | Open **Keyboard Shortcuts** reference |
| <kbd>Escape</kbd> | Dismiss active modal or overlay |

---

## 🛠️ Technology Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations & Icons**: [Motion](https://motion.dev/), [Lucide React](https://lucide.dev/)
- **Charts & Data**: [Recharts](https://recharts.org/)
- **Database & Authentication**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`)
- **Backend / Dev Server**: Node.js, Express, `tsx`, `esbuild`

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or later
- npm or yarn

### Installation
1. Clone repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env` (optional for custom Supabase instance):
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. Start development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

4. Build for production:
   ```bash
   npm run build
   ```

5. Typecheck & Lint:
   ```bash
   npm run lint
   ```

---

## 📄 License

MIT License. Designed with compassionate care for healthcare access equality.
