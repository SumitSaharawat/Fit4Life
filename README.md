# Fit4Life

<<<<<<< HEAD
A fitness web app to create workout plans, track sessions, and view your workout history. Built with React, Vite, and Firebase.

**Live app:** [https://fit4life-909ca.web.app](https://fit4life-909ca.web.app)

---

## Features

- **Create Plan** – Build custom workouts and add exercises (sets are added during the session).
- **Workouts** – Start a plan, track sets (reps, weight, complete), use an in‑workout timer, and pause/resume.
- **Past Workouts** – Scrollable history beside the calendar: date, workout name, duration, and exercises per day.
- **Calendar** – Monthly view of workout days; click a day to see details.
- **Login / Sign up** – Email and password (Firebase Auth). Workouts are stored per user in Firestore when logged in; otherwise they use `localStorage`.

---

## Tech Stack

- **Frontend:** React 19, Vite 6, React Router 7, Tailwind CSS
- **Backend / DB:** Firebase (Firestore, Authentication, Hosting)

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Run locally

```bash
git clone https://github.com/SumitSaharawat/Fit4Life.git
cd Fit4Life
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Or** double‑click `RUN-FIT4LIFE.command` (macOS) or run `./run.sh`.  
See [HOW-TO-RUN.txt](HOW-TO-RUN.txt) for more options.

---

## Firebase Setup (Database & Hosting)

To use Firestore and Auth, and to deploy:

1. Create a [Firebase](https://console.firebase.google.com/) project.
2. Enable **Firestore** and **Authentication → Email/Password**.
3. Add a web app and copy `firebaseConfig` into `.env` (use [.env.example](.env.example) as a template).
4. Set your project in [.firebaserc](.firebaserc) (`projects.default`).

**Guides:**

- [DATABASE-AND-HOSTING.md](DATABASE-AND-HOSTING.md) – Firestore, Auth, and Hosting
- [FIREBASE-CONFIG-STEPS.md](FIREBASE-CONFIG-STEPS.md) – Where to paste `firebaseConfig`

Without Firebase, the app still runs using `localStorage` for workouts.

---

## Deploy

```bash
npm run build
npx firebase-tools deploy
```

Or:

```bash
npm run deploy
```

(Uses `npx firebase-tools`; you can also install `firebase-tools` globally.)

---

## Project Structure

```
Fit4Life/
├── public/           # Static assets
├── src/
│   ├── contexts/     # AuthContext (Firebase Auth)
│   ├── lib/          # firebase.js, workoutsDb.js
│   ├── pages/        # Home, Login, Signup, CreatePlan, Workouts, WorkoutDetails
│   ├── Styles/
│   ├── App.jsx
│   └── main.jsx
├── firebase.json     # Hosting and Firestore config
├── firestore.rules   # Firestore security (per-user workouts)
├── vite.config.js
└── package.json
```

---

## Scripts

| Command        | Description                    |
|----------------|--------------------------------|
| `npm run dev`  | Start Vite dev server          |
| `npm run build`| Production build → `dist/`     |
| `npm run preview` | Serve `dist/` locally      |
| `npm run deploy` | Build and deploy to Firebase |

---

## License

MIT
=======
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
<img width="1464" height="842" alt="Screenshot 2026-01-23 at 8 14 11 PM" src="https://github.com/user-attachments/assets/bf3ee0ae-3294-45bb-88f0-95402fb898bc" />
<img width="1464" height="842" alt="Screenshot 2026-01-23 at 8 14 25 PM" src="https://github.com/user-attachments/assets/dea7c1b9-2e34-40ae-a07c-7f6ba32abf77" />
<img width="1464" height="842" alt="Screenshot 2026-01-23 at 8 14 34 PM" src="https://github.com/user-attachments/assets/107e9556-e948-45c6-8efb-d26a526f9c85" />
<img width="1464" height="842" alt="Screenshot 2026-01-23 at 8 14 34 PM" src="https://github.com/user-attachments/assets/2e4e10ba-0704-4d44-8e85-18a2a7d9d123" />
>>>>>>> 494b173692f23ded3dca5f508bed169de9c700e1
