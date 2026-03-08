# CI/CD Setup

This project uses GitHub Actions for Continuous Integration and Continuous Deployment.

## Workflow

- **CI (on every push and PR)**: Install dependencies → Run tests → Build
- **CD (on push to `main`)**: After CI passes → Deploy to Firebase Hosting

## Required: Firebase Token for Deployment

To enable automatic deployment to Firebase Hosting on push to `main`, add a Firebase token as a GitHub secret.

### 1. Generate a Firebase CI token

On your local machine (with Firebase CLI installed):

```bash
npx firebase-tools login:ci
```

This opens a browser for authentication and prints a long token.

### 2. Add the token as a GitHub secret

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `FIREBASE_TOKEN`
4. Value: paste the token from step 1

### 3. Done

Once `FIREBASE_TOKEN` is set, pushes to `main` will automatically deploy to Firebase Hosting after tests and build succeed.

---

**Note:** Without `FIREBASE_TOKEN`, CI (test + build) still runs; only the deploy step will fail. You can deploy manually with `npm run deploy`.
