# CI/CD Setup

This project uses GitHub Actions for Continuous Integration and Continuous Deployment.

## Workflow

- **CI (on every push and PR)**: Install dependencies → Run tests → Build
- **CD (on push to `main`)**: After CI passes → Deploy to Firebase Hosting

## Required: GitHub Secrets

Add these secrets in **Settings → Secrets and variables → Actions** so the build includes Firebase config and sign-in works on the live app.

### 1. Firebase config (for sign-in and Firestore)

Copy values from your local `.env` or Firebase Console → Project → ⚙️ → General → Your apps → Web app:

| Secret name | Value (from your Firebase config) |
|-------------|-----------------------------------|
| `VITE_FIREBASE_API_KEY` | `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | `appId` |

Without these, the live app will show "Sign-in is not configured. Check your Firebase setup."

### 2. Firebase Token for deployment

To enable automatic deployment to Firebase Hosting on push to `main`, add a Firebase token.

### 1. Generate a Firebase CI token

On your local machine (with Firebase CLI installed):

```bash
npx firebase-tools login:ci
```

This opens a browser for authentication and prints a long token.

### 2. Add the token as a GitHub secret

1. In your repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `FIREBASE_TOKEN`
4. Value: paste the token from step 1

### 3. Done

Once all secrets are set, pushes to `main` will build with Firebase config and deploy to Firebase Hosting.

---

**Summary:** Add the 6 Firebase config secrets so sign-in works on the live app. Add `FIREBASE_TOKEN` so deployment runs. Without `FIREBASE_TOKEN`, CI still runs; only the deploy step will fail.
