import React from 'react';
import { Settings, Database, Shield, Info } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-3xl text-ink-950">Settings</h1>
        <p className="mt-1 text-ink-500">System configuration and information.</p>
      </div>

      <div className="space-y-4">
        {/* Firestore Rules Info */}
        <div className="card">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-ink-900">Firestore Security Rules</h3>
              <p className="text-sm text-ink-500">Server-side access control</p>
            </div>
          </div>
          <div className="rounded-lg bg-ink-950 p-4 text-sm">
            <pre className="overflow-x-auto text-ink-300">
              <code>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: get the caller's role from /users/{uid}
    function userRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
                    && request.auth.uid == userId;
      allow update, delete: if request.auth != null
                            && userRole() == 'admin';
    }

    // Grades collection
    match /grades/{gradeId} {
      allow read: if request.auth != null
                  && (userRole() == 'admin'
                      || userRole() == 'teacher'
                      || resource.data.studentId == request.auth.uid);
      allow create, update: if request.auth != null
                            && (userRole() == 'admin'
                                || userRole() == 'teacher');
      allow delete: if request.auth != null
                    && (userRole() == 'admin'
                        || userRole() == 'teacher');
    }

    // Courses collection
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
                    && (userRole() == 'admin'
                        || userRole() == 'teacher');
      allow update, delete: if request.auth != null
                            && (userRole() == 'admin'
                                || resource.data.teacherId == request.auth.uid);
    }
  }
}`}</code>
            </pre>
          </div>
          <p className="mt-3 text-sm text-ink-500">
            Copy these rules into your Firebase Console → Firestore → Rules tab. They enforce
            role-based permissions server-side, so even if the client code is tampered with,
            unauthorized operations will be rejected.
          </p>
        </div>

        {/* Database structure */}
        <div className="card">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-ink-900">Database Structure</h3>
              <p className="text-sm text-ink-500">Firestore collections used by GradeBook</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <CollectionInfo
              name="users"
              fields="uid, email, displayName, role, createdAt"
              description="Stores user profiles and their assigned role (student, teacher, admin)."
            />
            <CollectionInfo
              name="grades"
              fields="studentId, studentName, courseId, courseName, assignmentName, score, maxScore, notes, teacherId, teacherName, createdAt, updatedAt"
              description="Individual grade entries linked to students and courses."
            />
            <CollectionInfo
              name="courses"
              fields="name, description, teacherId, teacherName, createdAt"
              description="Course definitions created by teachers or admins."
            />
          </div>
        </div>

        {/* Setup checklist */}
        <div className="card">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-ink-900">Setup Checklist</h3>
              <p className="text-sm text-ink-500">Make sure you've completed these steps</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-ink-700">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-4 w-4 shrink-0 rounded border border-ink-300" />
              Create a Firebase project and enable Firestore
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-4 w-4 shrink-0 rounded border border-ink-300" />
              Enable Email/Password and Google sign-in in Firebase Authentication
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-4 w-4 shrink-0 rounded border border-ink-300" />
              Copy your Firebase config into <code className="rounded bg-ink-100 px-1.5 py-0.5">.env</code>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-4 w-4 shrink-0 rounded border border-ink-300" />
              Deploy the Firestore security rules shown above
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-4 w-4 shrink-0 rounded border border-ink-300" />
              Create Firestore indexes for compound queries (Firebase will prompt you in the console)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-4 w-4 shrink-0 rounded border border-ink-300" />
              Manually set the first admin user's role in Firestore (users → [uid] → role: "admin")
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function CollectionInfo({ name, fields, description }) {
  return (
    <div className="rounded-lg border border-ink-100 p-3">
      <p className="font-mono text-xs font-semibold text-accent">{name}</p>
      <p className="mt-1 text-ink-600">{description}</p>
      <p className="mt-1 text-xs text-ink-400">
        Fields: <span className="font-mono">{fields}</span>
      </p>
    </div>
  );
}
