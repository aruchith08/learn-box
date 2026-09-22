<div align="center">

# 📦 Learn Box

**A neo-brutalist learning dashboard for tracking YouTube courses**

Built with React · Vite · Firebase · Tailwind CSS

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aruchith08/learn-box)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎓 **Playlist Tracker** | Add YouTube playlists and track progress video-by-video |
| 📹 **Video Vault** | Standalone videos outside any playlist |
| 🔒 **Guest Mode** | Use the app without signing in – data lives in `localStorage` |
| ☁️ **Cloud Sync** | Sign in with Google / email to sync progress to Firestore |
| 📝 **Notes & Bookmarks** | Per-video annotations with timestamps |
| 📊 **Activity Feed** | Visual streak and daily activity log |
| 🎨 **Neo-Brutalist UI** | Black sidebar · cream background · chunky bold cards |
| 💾 **Export / Import** | Full JSON backup of your learning state |

---

## 🖼️ Screenshots

> Add screenshots here after first deploy.

---

## 🛠️ Tech Stack

```
React 19   Vite 8   TypeScript   Tailwind CSS 3
Firebase Auth   Firestore   Lucide Icons
```

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/aruchith08/learn-box.git
cd learn-box
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

Edit **`src/lib/firebase.ts`** and replace the `firebaseConfig` object with your own Firebase project credentials:

```ts
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};
```

> **Guest mode still works without Firebase.** Only sign-in and cloud sync require a valid Firebase project.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## 🔒 Firestore Security Rules

In the Firebase console (or via `firebase deploy --only firestore:rules`), add the following rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /user_learning/{userId} {
      allow get:            if request.auth != null && request.auth.uid == userId;
      allow create, update: if request.auth != null && request.auth.uid == userId;
      allow delete:         if false;
      allow list:           if false;
    }
  }
}
```

Only authenticated users can read/write their own document. Guests never touch Firestore.

---

## ▲ Deploying to Vercel

This repo ships with a **`vercel.json`** that configures Vite builds and SPA routing out of the box.

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aruchith08/learn-box)

### Manual deploy

1. Go to [vercel.com](https://vercel.com) → **New Project** → Import `aruchith08/learn-box`.
2. Vercel auto-detects **Vite**. No extra config needed.
3. Click **Deploy**.

The `vercel.json` handles:
- **Build command:** `vite build`
- **Output directory:** `dist`
- **SPA rewrites:** all routes → `/index.html`

---

## 📁 Project Structure

```
learn-box/
├── src/
│   ├── components/        # UI components (Sidebar, Topbar, Cards…)
│   ├── context/           # AuthContext, LearningContext
│   ├── services/          # dbService (localStorage + Firestore sync)
│   ├── lib/               # firebase.ts
│   └── types/             # TypeScript types
├── public/                # Static assets (favicon, etc.)
├── index.html             # Entry point (title: Learn Box)
├── vercel.json            # Vercel deployment config
├── vite.config.ts
└── tailwind.config.cjs
```

---

## 🧩 Guest Mode

When no user is signed in, the app automatically runs in **guest mode**:

- All data is stored in `localStorage` under the key `focus_learn_db_v3_guest`.
- Progress starts at **zero** for a fresh guest.
- When the user later signs in, guest progress is **merged** into their account automatically.

---

## 📜 License

MIT – free to use, fork and deploy.

---

<div align="center">Made with ☕ and way too many YouTube videos.</div>
