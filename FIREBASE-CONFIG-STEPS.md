# Where to Paste Your Firebase Web App Config

Your Firebase config looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

Follow these steps.

---

## Step 1: Open the `.env` file

In your Fit4Life project folder, open **`.env`** (it’s in the root, next to `package.json`).

- In Cursor/VS Code: click it in the file explorer.
- Or in Terminal: `open .env` (Mac) or `notepad .env` (Windows).

---

## Step 2: Paste each value into `.env`

Use this mapping. Paste **only the value** (the part in quotes), **after the `=`**. No extra quotes.

| In Firebase config | Paste into this line in `.env` | Example |
|--------------------|-------------------------------|---------|
| `apiKey`           | `VITE_FIREBASE_API_KEY=`      | `VITE_FIREBASE_API_KEY=AIzaSyB...` |
| `authDomain`       | `VITE_FIREBASE_AUTH_DOMAIN=`  | `VITE_FIREBASE_AUTH_DOMAIN=fit4life-xxx.firebaseapp.com` |
| `projectId`        | `VITE_FIREBASE_PROJECT_ID=`   | `VITE_FIREBASE_PROJECT_ID=fit4life-xxx` |
| `storageBucket`    | `VITE_FIREBASE_STORAGE_BUCKET=` | `VITE_FIREBASE_STORAGE_BUCKET=fit4life-xxx.appspot.com` |
| `messagingSenderId`| `VITE_FIREBASE_MESSAGING_SENDER_ID=` | `VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012` |
| `appId`            | `VITE_FIREBASE_APP_ID=`       | `VITE_FIREBASE_APP_ID=1:123456789012:web:abc123` |

When you’re done, each line should look like (with your real values):

```
VITE_FIREBASE_API_KEY=AIzaSyB...your-real-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

Save `.env`.

---

## Step 3: Put `projectId` into `.firebaserc`

1. Open **`.firebaserc`** (same folder as `.env`).
2. Replace `YOUR_FIREBASE_PROJECT_ID` with your **`projectId`** from the Firebase config.

Before:

```json
{
  "projects": {
    "default": "YOUR_FIREBASE_PROJECT_ID"
  }
}
```

After (example):

```json
{
  "projects": {
    "default": "fit4life-abc123"
  }
}
```

Save `.firebaserc`.

---

## Step 4: Restart the dev server

If the app is running, stop it (Ctrl+C) and start again:

```bash
npm run dev
```

Or double‑click **`RUN-FIT4LIFE.command`**.

---

## Quick checklist

- [ ] `.env` has all 6 `VITE_FIREBASE_*` lines filled (value after `=`, no quotes).
- [ ] `.firebaserc` has `"default": "your-projectId"`.
- [ ] Dev server restarted after editing `.env`.
