<div align="center">

<img src="https://raw.githubusercontent.com/kavya-dev05/SEWA-SANKALP-BHARAT/main/public/logo.png" alt="Sewa Sankalp Bharat" width="180"/>

# SEWA SANKALP BHARAT

**Refining the act of giving.**

A verified social-impact platform that connects donors, volunteers, NGOs, and people in need through transparent, AI-powered matching and accountable contribution workflows.

<br/>

[![Live Application](https://img.shields.io/badge/Live%20App-sahyog--silk.vercel.app-2e6b5e?style=flat-square)](https://sahyog-silk.vercel.app/)
[![React 19](https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?style=flat-square&logo=firebase&logoColor=111111)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini-4285F4?style=flat-square&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay-0C2451?style=flat-square)](https://razorpay.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)

</div>

---

## Overview

Giving often involves more friction than it should. Donors don't know which organisation needs what, NGOs struggle to discover relevant contributions, and volunteers can't easily find opportunities that match their skills and schedule.

Sewa Sankalp Bharat solves this through a unified workflow: verified NGOs publish real needs, contributors offer money, goods, or time, and a Gemini-powered matching engine connects both sides with scored, explainable results — no black box, no wasted generosity.

---

## Platform Capabilities

| # | Module | What it does |
|---|--------|-------------|
| 01 | **Monetary Donations** | Select an amount and cause; server creates a Razorpay order, verifies the payment signature, and records the transaction |
| 02 | **Physical-Resource Donations** | Offer goods with quantities; AI matches them to NGO needs and notifies the relevant organisation |
| 03 | **Volunteer Matching** | Submit skills, location, and availability; Gemini ranks the best-fit opportunities from verified NGO listings |
| 04 | **NGO Onboarding & Verification** | NGOs register with organisation details; an admin panel drives the approval workflow |
| 05 | **NGO Operations** | Publish resource needs and volunteer roles; review incoming offers; track funds, matches, and engagements |
| 06 | **Profiles & Notifications** | Donor activity history, in-app NGO notifications, and role-aware account management |
| 07 | **Beneficiary Requests** | Individuals submit assistance requests with category, urgency, and location |

---

## System Architecture

```
┌─────────────┐     Firebase Auth      ┌──────────────────────┐
│             │ ─────────────────────► │                      │
│  React 19   │                        │   Firebase Auth      │
│  + Vite 6   │ ◄───────────────────── │                      │
│  Frontend   │      ID Token          └──────────────────────┘
│             │
│             │  HTTPS + Bearer Token  ┌──────────────────────┐
│             │ ─────────────────────► │                      │
└─────────────┘                        │   Express 4 API      │
                                       │   (server.ts)        │
                                       │                      │
                        ┌──────────────┤                      ├──────────────┐
                        │              └──────────────────────┘              │
                        ▼                        │                           ▼
             ┌──────────────────┐                │               ┌───────────────────┐
             │  Firebase Admin  │                │               │   Razorpay SDK    │
             │  SDK             │                ▼               │  Order creation   │
             │                  │     ┌──────────────────┐       │  Sig. verify      │
             └────────┬─────────┘     │   Gemini API     │       └───────────────────┘
                      │               │   AI Matching    │
                      ▼               └──────────────────┘
             ┌──────────────────┐
             │  Cloud Firestore │
             │  (Database)      │
             └──────────────────┘
```

---

## Contribution Workflow

```
                         ┌─────────────────────────────────┐
                         │  User signs in via Firebase Auth │
                         └──────────────────┬──────────────┘
                                            │
                         ┌──────────────────▼──────────────┐
                         │     Choose contribution type     │
                         └─────┬──────────────┬────────────┘
                               │              │              │
              ┌────────────────▼──┐  ┌────────▼──────┐  ┌──▼──────────────────┐
              │   Monetary Donation│  │ Physical Goods │  │   Volunteer Time    │
              └────────────────┬──┘  └────────┬───────┘  └──┬──────────────────┘
                               │              │              │
              ┌────────────────▼──┐  ┌────────▼───────┐  ┌──▼──────────────────┐
              │ Razorpay Order    │  │ Gemini-powered  │  │  Gemini-powered     │
              │ Created           │  │ Resource Match  │  │  Volunteer Match    │
              └────────────────┬──┘  └────────┬───────┘  └──┬──────────────────┘
                               │              │              │
              ┌────────────────▼──┐  ┌────────▼───────┐  ┌──▼──────────────────┐
              │ Signature verified│  │ NGO notified   │  │ Engagement recorded  │
              │ Payment recorded  │  │ Offer tracked  │  │ NGO notified         │
              └────────────────┬──┘  └────────┬───────┘  └──┬──────────────────┘
                               └──────────────┴──────────────┘
                                              │
                               ┌──────────────▼──────────────┐
                               │   Profile · Activity · Feed  │
                               └─────────────────────────────┘
```

---

## AI Matching Engine

Every match is scored across six weighted parameters — transparent, not a black box.

| Signal | Donation Match | Volunteer Match |
|--------|---------------|-----------------|
| Resource / Skills fit | 30% | 35% |
| Location / Distance | 20% | 20% |
| Urgency of need | 20% | — |
| Quantity match | 15% | — |
| Availability | 10% | 25% |
| Cause alignment | 5% | 20% |

Gemini selects only from NGO records retrieved from Firestore — it cannot invent organisations or manufacture matches.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript 5.8 |
| Build | Vite 6, esbuild |
| Styling | Tailwind CSS 4, custom CSS |
| Routing | React Router 7 |
| Animation | Motion, Lucide React |
| Backend | Node.js, Express 4, TypeScript |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Privileged DB | Firebase Admin SDK |
| AI | Google Gemini API (`@google/genai`) |
| Payments | Razorpay Node SDK |
| Deployment | Vercel |

---

## Project Structure

```
SEWA-SANKALP-BHARAT/
├── public/                    # Static assets
├── scripts/
│   ├── seed-database.ts       # Firestore seed data
│   └── test-api.js            # API smoke tests
├── src/
│   ├── components/
│   │   ├── AuthModal.tsx      # Sign-in / sign-up flow
│   │   ├── Layout.tsx         # App shell and navigation
│   │   └── Toast.tsx          # Notification toasts
│   ├── context/
│   │   └── AuthContext.tsx    # Firebase auth state
│   └── pages/
│       ├── Home.tsx           # Landing and live contribution feed
│       ├── Features.tsx       # Platform capabilities overview
│       ├── HowItWorks.tsx     # Step-by-step explainer
│       ├── Matching.tsx       # Matching engine visualiser
│       ├── Donate.tsx         # Monetary + resource donation flows
│       ├── Volunteer.tsx      # Volunteer matching and sign-up
│       ├── Impact.tsx         # Impact metrics and stories
│       ├── Profile.tsx        # User dashboard and activity
│       └── Admin.tsx          # NGO verification panel
├── server.ts                  # Express API + all backend routes
├── firestore.rules            # Firestore security rules
├── firebase-applet-config.json
├── .env.example
├── vite.config.ts
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js (current LTS)
- A Firebase project with Authentication and Cloud Firestore enabled
- Google Gemini API key
- Razorpay API keys (for payment testing)
- Firebase Admin service-account JSON

### Setup

```bash
# 1. Clone
git clone https://github.com/kavya-dev05/SEWA-SANKALP-BHARAT.git
cd SEWA-SANKALP-BHARAT

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Fill in the values described below

# 4. Run in development
npm run dev
# Open http://localhost:3000
```

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Authenticates requests to the Gemini API |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to Firebase Admin service-account JSON |
| `RAZORPAY_KEY_ID` | Razorpay public key identifier |
| `RAZORPAY_KEY_SECRET` | Server-side secret for payment signature verification |
| `ADMIN_BOOTSTRAP_SECRET` | One-time secret to promote the first admin user |
| `APP_URL` | Application base URL for production |

> Never commit `.env` or `serviceAccountKey.json`. Use your hosting provider's secret manager in production.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server via `tsx server.ts` |
| `npm run build` | Build frontend and bundle Express server |
| `npm start` | Run production server after build |
| `npm run lint` | TypeScript type-check (no emit) |
| `npm run preview` | Vite preview of built frontend |
| `npm run clean` | Remove build output |

---

## API Overview

All protected routes require `Authorization: Bearer <firebase-id-token>`.

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/firebase-config` | Public |
| GET | `/api/config` | Public |
| POST | `/api/create-order` | Authenticated |
| POST | `/api/verify-payment` | Authenticated |
| POST | `/api/donations` | Authenticated |
| POST | `/api/volunteers` | Authenticated |
| GET | `/api/profile/stats` | Authenticated |
| GET | `/api/profile/activity` | Authenticated |
| GET | `/api/ngo/dashboard` | Authenticated (NGO) |
| GET | `/api/ngo/incoming` | Authenticated (NGO) |
| PATCH | `/api/ngo/incoming/:id/accept` | Authenticated (NGO) |
| PATCH | `/api/ngo/incoming/:id/decline` | Authenticated (NGO) |
| POST | `/api/ngo/needs` | Authenticated (NGO) |
| POST | `/api/ngo/volunteer-request` | Authenticated (NGO) |
| GET | `/api/notifications` | Authenticated |
| POST | `/api/notifications/mark-read` | Authenticated |
| POST | `/api/beneficiary/request` | Authenticated |
| GET | `/api/beneficiary/requests` | Authenticated |
| POST | `/api/match-ngos` | Matching |
| POST | `/api/match-volunteers` | Matching |
| GET | `/api/admin/pending-ngos` | Admin only |
| POST | `/api/admin/verify-ngo` | Admin only |
| POST | `/api/admin/bootstrap` | Secret-protected |

---

## Security Notes

Before any production deployment:

- **Rotate exposed secrets.** Removing a file from a commit does not remove it from Git history.
- **Enforce ownership checks** on every NGO-specific update — the server uses Admin SDK which bypasses Firestore rules.
- **Validate all inputs** server-side: amounts, identifiers, state transitions.
- **Verify Razorpay signatures** server-side before recording any payment.
- **Gate the bootstrap endpoint** after initial admin setup.
- **Test Firestore rules** using the Firebase Emulator Suite before deploying.

---

## Firestore Collections

| Collection | Purpose |
|-----------|---------|
| `users` | Profiles, roles, and verification status |
| `donations` | Monetary and physical contribution records |
| `ngos` | NGO records used by the matching engine |
| `ngo_needs` | Resource needs published by NGOs |
| `volunteer_opportunities` | Roles and schedules published by NGOs |
| `volunteer_engagements` | Volunteer participation records |
| `beneficiary_requests` | Individual assistance requests |
| `notifications` | In-app notifications for NGO users |

---

## Roadmap

- Automated tests for auth, payments, and matching behaviour
- Audit logs for NGO verification and donation state transitions
- Pagination, filtering, and observability for larger datasets
- Explainable match factors with data-quality indicators
- End-to-end tests for all four user journeys
- Production deployment guide with backup and recovery procedures

---

## Contributing

Contributions and thoughtful suggestions are welcome.

1. Fork the repository.
2. Create a focused branch: `git checkout -b feat/your-change`
3. Make and test your changes.
4. Run `npm run lint` and `npm run build`.
5. Open a pull request with a clear description of the change and its motivation.

For substantial changes, open an issue first so the direction can be discussed.

---

<div align="center">

<sub>Sewa Sankalp Bharat — Making every contribution count.</sub>

<br/>

[![Live App](https://img.shields.io/badge/Open%20Live%20App-sahyog--silk.vercel.app-2e6b5e?style=flat-square)](https://sahyog-silk.vercel.app/)
&nbsp;
[![GitHub](https://img.shields.io/badge/Source%20Code-GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/kavya-dev05/SEWA-SANKALP-BHARAT)

</div>
