<div align="center">

  <img src="public/favicon.png" alt="Learn Box Logo" width="96" height="96" />

  # 📦 LEARN BOX
  ### *Distraction-Free, Neo-Brutalist YouTube Learning Dashboard*

  Transform YouTube into your personal high-yield classroom. Track curated curriculums, organize standalone video vaults, take timestamped notes, and maintain learning streaks—with zero distractions.

  <p align="center">
    <a href="https://github.com/aruchith08/learn-box/stargazers"><img src="https://img.shields.io/github/stars/aruchith08/learn-box?style=for-the-badge&color=FFE600&labelColor=111111" alt="Stars" /></a>
    <a href="https://github.com/aruchith08/learn-box/network/members"><img src="https://img.shields.io/github/forks/aruchith08/learn-box?style=for-the-badge&color=A7F3D0&labelColor=111111" alt="Forks" /></a>
    <a href="https://github.com/aruchith08/learn-box/blob/master/LICENSE"><img src="https://img.shields.io/badge/License-MIT-DDD6FE?style=for-the-badge&labelColor=111111" alt="License" /></a>
    <a href="https://vercel.com/new/clone?repository-url=https://github.com/aruchith08/learn-box"><img src="https://img.shields.io/badge/Deploy%20With-Vercel-FF85A1?style=for-the-badge&logo=vercel&logoColor=white&labelColor=111111" alt="Deploy to Vercel" /></a>
  </p>

  <br />

  [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aruchith08/learn-box)

</div>

---

## ⚡ Why Learn Box?

Learning on YouTube is filled with distractions: recommendation rabbit-holes, sidebar clutter, and zero built-in structure for syllabus tracking. 

**Learn Box** redesigns the entire workflow around focus:
- 🎯 **No Algorithmic Feeds:** Watch only the courses and videos you explicitly added.
- 🎨 **Neo-Brutalist Aesthetics:** Bold high-contrast typography, thick retro outlines, solid offset shadows, and vibrant pastel accents.
- 🧘 **Deep Focus Mode:** Dedicated minimal player view with quick timestamp notes and bookmarking.
- ⚡ **Zero-Friction Guest Mode:** Works immediately without login; cloud sync activates only when you choose.

---

## 🚀 Key Features

### 🎓 1. Curriculum & Playlist Mastery
- Import entire YouTube playlists or curate your own custom syllabus.
- Visual completion rings and progress bars for each playlist and video.
- Drag/reorder playlist order with instant position updates.
- Filter videos instantly by **All**, **Uncompleted**, or **Completed**.

### 📼 2. Standalone Video Vault
- Save one-off tech talks, tutorials, and deep-dives outside of rigid playlist structures.
- Tag and categorize videos for fast retrieval.

### 📝 3. Timestamped Notes & Bookmarks
- Type notes alongside any video with automatic playback timestamp association.
- Jump directly to exact video moments by clicking timestamps.
- One-click bookmarking for quick reference before interviews or exams.

### 📊 4. Productivity Analytics & Streak Tracker
- Real-time learning activity log recording completed lectures and milestones.
- Weekly chart visualization measuring steady progress over time.
- Metric counters tracking watch percentage, total completed videos, and hours.

### 🔄 5. Dual-Tier Persistence (Guest + Cloud)
- **Instant Guest Mode:** All state is saved locally in `localStorage` under isolated database keys with 0 initial progress for new guests.
- **Automated Cloud Sync:** Sign in via Google or Email/Password at any time; your local guest progress automatically migrates and syncs seamlessly with Firebase Firestore.
- **JSON Backup & Restore:** Complete offline data export and restore anytime.

---

## 🛠️ Tech Stack & Architecture

```
Frontend:          React 19 (TypeScript)
Build Tool:        Vite 8
Styling:           Tailwind CSS (Neo-Brutalist Custom System)
Icons:             Lucide Icons
Authentication:    Firebase Auth (Google OAuth & Email/Password)
Cloud Database:    Google Cloud Firestore
Hosting:           Vercel (Ready with vercel.json SPA routing)
```

---

## 🏁 Quickstart & Installation

### Prerequisites
- Node.js (v18 or higher recommended)
- `npm` or `pnpm` / `yarn`

### 1. Clone the repository
```bash
git clone https://github.com/aruchith08/learn-box.git
cd learn-box
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## ⚙️ Firebase Setup (Optional)

> **Note:** Learn Box is 100% usable out of the box in **Guest Mode** without configuring Firebase. If you wish to enable authenticated cloud sync:

1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Google & Email/Password providers).
3. Create a **Firestore Database** in production mode.
4. Replace the config in [`src/lib/firebase.ts`](src/lib/firebase.ts):

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

### 🔒 Firestore Security Rules
Paste these rules into your Firebase Console under **Firestore > Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /user_learning/{userId} {
      // Users can only access and update their own learning record
      allow get:            if request.auth != null && request.auth.uid == userId;
      allow create, update: if request.auth != null && request.auth.uid == userId;
      allow delete:         if false;
      allow list:           if false;
    }
  }
}
```

---

## 🌐 Deploy to Vercel

Learn Box is pre-configured for one-click deployment via Vercel with clean client-side routing.

### Option A: One-Click Deploy
Click the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aruchith08/learn-box)

### Option B: Vercel CLI
```bash
npm i -g vercel
vercel
```

The bundled [`vercel.json`](vercel.json) automatically directs builds to `dist` and reroutes all dynamic requests to `/index.html`:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "vite build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 📂 Project Organization

```
learn-box/
├── public/                # Static assets & app favicon
├── src/
│   ├── components/
│   │   ├── bookmarks/     # Saved video bookmarks & quick jump
│   │   ├── calendar/      # Schedule & calendar views
│   │   ├── common/        # Shared neo-brutalist buttons & badges
│   │   ├── dashboard/     # Metrics, progress charts, activity feed
│   │   ├── layout/        # Sidebar, topbar, responsive shells
│   │   ├── modals/        # Auth, add video, CSV import, settings
│   │   ├── notes/         # Global notes & timestamped notes
│   │   ├── player/        # Distraction-free YouTube player & focus mode
│   │   ├── playlists/     # Playlist detail & curriculum lists
│   │   ├── stats/         # Analytics view
│   │   └── videos/        # Standalone video vault
│   ├── context/
│   │   ├── AuthContext.tsx       # Firebase session & user state
│   │   └── LearningContext.tsx   # Curriculums, progress, dedup logic
│   ├── lib/
│   │   └── firebase.ts    # Firebase client initialization
│   ├── services/
│   │   ├── dbService.ts   # LocalStorage & Firestore sync pipeline
│   │   └── preloadedData.ts # Initial curriculum setup
│   └── types/             # TypeScript data contracts
├── vercel.json            # Vercel deployment & rewrite configuration
├── vite.config.ts         # Vite bundler options
└── tailwind.config.cjs    # Neo-brutalist theme colors & shadow presets
```

---

## 🤝 Contributing

Contributions are welcome! If you have suggestions or bug reports:
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
  <sub>Crafted for focused learners who want to master skills without distractions.</sub>
</div>
