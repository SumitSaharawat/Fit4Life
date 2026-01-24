# Fit4Life – Database & Hosting (Firebase)

Fit4Life uses **Firebase Firestore** for workouts and **Firebase Hosting** for the site.  
If Firebase isn’t configured, the app falls back to **localStorage**.

---

## 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. **Add project** → name it (e.g. `fit4life`) → continue (disable Google Analytics if you want)
3. Once the project is created, open it

---

## 2. Enable Firestore

1. In the left menu: **Build → Firestore Database**
2. **Create database** → Start in **test mode** (you can tighten rules later) → choose a region (e.g. `us-central1`)

---

## 2b. Enable Authentication (Login / Sign up)

1. In the left menu: **Build → Authentication**
2. Click **Get started**
3. Open the **Sign-in method** tab
4. Click **Email/Password** → turn **Enable** on → **Save**

---

## 3. Get your web app config

1. Project **⚙️ (Settings) → General**
2. Under **Your apps**, click the **</>** (web) icon
3. Register an app (e.g. nickname `Fit4Life`) → you don’t need Firebase Hosting here
4. Copy the `firebaseConfig` object. It looks like:

   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

---

## 4. Configure the app

1. In the project root, copy the example env file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set (use the values from `firebaseConfig`):

   ```
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

3. Set your Firebase project in **`.firebaserc`** (in your project root, same folder as `package.json` and this file):

   - Open **`.firebaserc`** in your editor.
   - Find the line: `"default": "YOUR_FIREBASE_PROJECT_ID"` (or `"your-project-id"`).
   - Replace **only** `YOUR_FIREBASE_PROJECT_ID` (or `your-project-id`) with your real **Project ID** from Firebase (same as `projectId` in your web app config). Keep the quotes and the rest of the file as is.

   **Example** — before:
   ```json
   "default": "YOUR_FIREBASE_PROJECT_ID"
   ```
   **After** (if your project ID is `fit4life-abc123`):
   ```json
   "default": "fit4life-abc123"
   ```

---

## 5. Deploy rules and Hosting

1. Install the Firebase CLI (one time):  
   `npm install -g firebase-tools`  
   (Or `npm run deploy` will use `npx firebase-tools` if the CLI isn’t installed.)

2. Log in:

   ```bash
   firebase login
   ```

3. Build the app:

   ```bash
   npm run build
   ```

4. Deploy Firestore rules and Hosting:

   ```bash
   firebase deploy
   ```

   Or use the script:

   ```bash
   npm run deploy
   ```

   Your site will be at: **https://your-project-id.web.app** (or the URL shown in the terminal).

---

## 6. (Optional) Deploy only Hosting

- Only hosting:  
  `firebase deploy --only hosting`
- Only Firestore rules:  
  `firebase deploy --only firestore:rules`

---

## Data and behavior

- **Workouts** (when logged in) are in Firestore at `workouts/{userId}` (field `list`: array of workouts). Each user only has access to their own data.
- **When not logged in**, workouts use **localStorage** (per-browser).
- **Paused workout** and **active session** stay in **localStorage** (per-browser).
- If `.env` is missing or Firebase fails, the app uses **localStorage** for workouts.

---

## Firestore security (Login / Sign up)

The `firestore.rules` are set so each user can only read and write their own `workouts/{userId}` document:

```
match /workouts/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

Make sure **Authentication → Sign-in method → Email/Password** is enabled so users can log in.
