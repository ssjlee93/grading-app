# GradeBook — School Grading Portal

A role-based grading application built with **React + Vite + Tailwind CSS** and **Google Firebase** (Authentication + Firestore). No dedicated backend required.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT (React + Vite)                                      │
│                                                             │
│  AuthContext ──► reads /users/{uid}.role                     │
│       │                                                     │
│       ├── UI layer: shows/hides pages & buttons by role     │
│       │         (client-side convenience only)              │
│       │                                                     │
│       └── Firestore SDK ──► reads/writes grades, courses    │
│                                                             │
└───────────────────────┬─────────────────────────────────────┘
                        │  every read/write
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  FIREBASE (server-side)                                     │
│                                                             │
│  Authentication     Firestore Security Rules                │
│  ─────────────      ─────────────────────────               │
│  Google / Email     function userRole() {                   │
│  sign-in              return get(.../users/{uid}).data.role  │
│                     }                                       │
│                     • students can only read own grades      │
│                     • teachers can read/write all grades     │
│                     • admins can do everything               │
│                     • ENFORCED SERVER-SIDE on every request  │
└─────────────────────────────────────────────────────────────┘
```

### How role-based access works without a backend

**Two layers of protection:**

1. **Client-side (UX convenience):** `AuthContext` reads the user's `role` from Firestore on login. Components use `canEditGrades`, `isAdmin`, etc. to conditionally render UI. This is for a clean UX — it does NOT enforce security.

2. **Server-side (actual security):** Firestore Security Rules (in `firestore.rules`) run on Firebase's servers on every database operation. The `userRole()` helper function looks up the requesting user's role document and blocks unauthorized operations. Even if someone bypasses the UI, the database rejects the request.

**Why this is sufficient (no backend needed):**
- All data lives in Firestore — no custom API to build
- Security rules are Turing-incomplete but expressive enough for RBAC
- Firebase Auth handles sessions, tokens, password reset, OAuth
- If you later need server logic (emails, exports), add a single Cloud Function — not a whole backend

## Roles

| Role      | Dashboard | View Grades | Edit Grades | Courses | Manage Users |
|-----------|-----------|-------------|-------------|---------|--------------|
| Student   | ✓ (own)   | ✓ (own)     | ✗           | ✗       | ✗            |
| Teacher   | ✓ (all)   | ✓ (all)     | ✓           | ✓ (own) | ✗            |
| Admin     | ✓ (all)   | ✓ (all)     | ✓           | ✓ (all) | ✓            |

## Quick Start

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project
2. Enable **Firestore Database** (start in test mode, then apply rules)
3. Enable **Authentication** → Sign-in methods → turn on **Email/Password** and **Google**
4. Go to Project Settings → General → scroll to "Your apps" → click Web (`</>`)
5. Copy the config values

### 2. Local Setup

```bash
# Clone / copy the project
cd grading-app

# Install dependencies
npm install

# Create your env file
cp .env.example .env
# Fill in your Firebase config values in .env

# Start dev server
npm run dev
```

### 3. Deploy Firestore Rules

Copy the contents of `firestore.rules` into:
**Firebase Console → Firestore → Rules → Paste → Publish**

Or use the Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # select your project
# It will detect firestore.rules automatically
firebase deploy --only firestore:rules
```

### 4. Create Your First Admin

1. Open the app and register an account
2. Go to Firebase Console → Firestore → `users` collection
3. Find your user document and change `role` from `"student"` to `"admin"`
4. Refresh the app — you now have full admin access
5. From here, you can promote other users to Teacher or Admin from the UI

### 5. Firestore Indexes

When you first use the app, Firebase may show index errors in the browser console. Click the link in the error to auto-create the needed composite index, or create them manually:

| Collection | Fields                              | Order  |
|------------|-------------------------------------|--------|
| grades     | `studentId`, `createdAt`            | Desc   |
| grades     | `courseId`, `createdAt`              | Desc   |
| courses    | `teacherId`, `createdAt`            | Desc   |

## Project Structure

```
grading-app/
├── firestore.rules          # Deploy to Firebase (server-side security)
├── .env.example             # Template for Firebase config
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx             # Entry point
    ├── App.jsx              # Router + auth provider
    ├── index.css            # Tailwind + global styles
    ├── config/
    │   └── firebase.js      # Firebase init
    ├── contexts/
    │   └── AuthContext.jsx   # Auth state + role management
    ├── components/
    │   ├── Layout.jsx        # Sidebar + responsive shell
    │   └── ProtectedRoute.jsx
    ├── pages/
    │   ├── LoginPage.jsx     # Sign in / sign up / Google OAuth
    │   ├── DashboardPage.jsx # Role-appropriate stats
    │   ├── GradesPage.jsx    # View / add / edit / delete grades
    │   ├── CoursesPage.jsx   # Manage courses (teacher/admin)
    │   ├── UsersPage.jsx     # Role management (admin only)
    │   └── SettingsPage.jsx  # Rules reference + setup checklist
    └── utils/
        ├── gradesService.js  # Firestore CRUD for grades & courses
        └── usersService.js   # Firestore CRUD for users
```

## Tech Stack

- **React 18** + **Vite 5** — fast dev & build
- **Tailwind CSS 3** — utility-first styling
- **Firebase Auth** — email/password + Google sign-in
- **Cloud Firestore** — NoSQL database with server-side security rules
- **react-router-dom v6** — client-side routing
- **react-hot-toast** — toast notifications
- **lucide-react** — icons

## Production Deployment

```bash
npm run build
# Deploy the `dist/` folder to Firebase Hosting, Vercel, Netlify, etc.
```

For Firebase Hosting:
```bash
firebase init hosting   # set public dir to "dist", SPA rewrite to index.html
firebase deploy
```
