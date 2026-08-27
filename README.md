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
- **Live GPS & ETA Tracking**: Curbside meeting coordination with real-time device geolocation, precision radar, and walking ETA estimations.
- **Care Summaries & Appointment Notes**: Centralized discharge notes, clinical follow-up reminders, and calendar exports.
- **Transparent Charges**: Upfront pricing breakdowns ($26/hr base rate, hospital coordination credits, insurance reimbursement guides).

### 2. 🤝 Pal Companion Portal
- **Companion Dashboard**: Active shift schedules, incoming hospital escort requests, and patient mobility briefs.
- **Verified Digital Badge**: Official credential display with photo identification, background-check status, and hospital affiliations.
- **Earnings & Mileage Ledger**: Transparent shift log tracking completed hours, base pay, and direct Stripe payouts.
- **Secure Onboarding & Verification**: Multi-step registration validating administrator approval, background checks, and email verification.

### 3. 🏢 Admin & Coordination Center
- **Pal Application Pipeline**: Real-time review of prospective Pal companion applications.
- **One-Click Authorization**: Approve verified applicants, automatically generating a secure invitation link for account activation.
- **Department Fleet Oversight**: Live roster of active hospital Pals, badge numbers, background check clearances, and department allocations.
- **Live Campus Radar**: Real-time geolocation tracking sessions displaying campus rendezvous coordinates and active escort telemetry.
- **Role-Based Access Control**: Sensitive Pal, Patient, and Dispatch records are strictly protected behind secure Admin login credentials.

### 4. 🤖 AI CareBot & Accessibility Tools
- **PathPal CareBot**: Interactive assistant offering hospital department directories, pre-visit packing checklists, and navigation tips.
- **WCAG Accessibility & Keyboard Shortcuts**: Built-in keyboard shortcuts (Alt+1 through Alt+5, Alt+R, Alt+G, Alt+K, Alt+C) for motor-impaired and power users.
- **Multi-Language & Theme Support**: Dynamic language switching and high-contrast light/dark themes.
- **Offline Resilience Banner**: Automatic detection and notification when network connectivity is lost.

---

## 🗄️ Database & Services Architecture

PathPal leverages **Supabase** for secure authentication, persistent database storage, and real-time streaming:

### Database Tables

| Table | Purpose | Key Columns |
| :--- | :--- | :--- |
| `pal_applications` | Stores applicant submissions and admin review state | `id` (UUID), `name`, `email`, `phone`, `languages`, `status` (`pending`, `approved`, `rejected`), `created_at` |
| `pals` | Stores certified companion records | `id` (int4), `auth_user_id` (UUID), `name`, `phone`, `bio`, `availability`, `background_check_status`, `rating`, `hourly_rate_cents`, `stripe_account_id` |
| `patients` | Stores registered patient profile data | `id` (int4), `auth_user_id` (UUID), `name`, `phone`, `created_at` |
| `location_sessions` | Active GPS tracking sessions | `id` (UUID), `request_id`, `match_id`, `pal_id`, `patient_id`, `status` (`active`, `ended`), `started_at` |
| `location_points` | High-frequency telemetry stream | `id` (int8), `session_id` (UUID), `latitude`, `longitude`, `accuracy_meters`, `speed_mps`, `recorded_at` |
| `notifications` | User alert and notification feed | `id` (int8), `user_id` (UUID), `type`, `title`, `message`, `is_read`, `created_at` |

### Pal Onboarding & Auth Flow
1. **Application Submission**: Prospective Pals apply via `BecomePalModal`.
2. **Admin Approval**: Administrators review applications in the Admin portal (`HospitalPortalPage`) and authorize verified applicants.
3. **Account Creation**: Approved applicants receive a registration link (`#pal-signup?app_id=...`) to create their secure login credentials.
4. **Email Confirmation & Profile Linking**: Upon confirming their email (`#pal-verify`), profile records are linked automatically.
5. **Pal Login**: Pals log into the companion portal using their verified credentials.

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

2. Start development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

3. Build for production:
   ```bash
   npm run build
   ```

4. Typecheck & Lint:
   ```bash
   npm run lint
   ```

---

## 📄 License

MIT License. Designed with compassionate care for healthcare access equality.
