import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext(null);

export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch or create role document in Firestore
  async function fetchUserRole(firebaseUser) {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return userDoc.data().role;
      }

      // First-time user → default to 'student'. Admin can change later.
      await setDoc(userDocRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || '',
        role: ROLES.STUDENT,
        createdAt: new Date().toISOString(),
      });
      return ROLES.STUDENT;
    } catch (err) {
      console.error('Error fetching user role:', err);
      return null;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const role = await fetchUserRole(firebaseUser);
        setUser(firebaseUser);
        setUserRole(role);
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const role = await fetchUserRole(cred.user);
    setUserRole(role);
    return cred;
  }

  async function register(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      email,
      displayName,
      role: ROLES.STUDENT,
      createdAt: new Date().toISOString(),
    });
    setUserRole(ROLES.STUDENT);
    return cred;
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const role = await fetchUserRole(cred.user);
    setUserRole(role);
    return cred;
  }

  async function logout() {
    await signOut(auth);
  }

  // Permission helpers
  const isAdmin = userRole === ROLES.ADMIN;
  const isTeacher = userRole === ROLES.TEACHER;
  const isStudent = userRole === ROLES.STUDENT;
  const canEditGrades = isAdmin || isTeacher;
  const canViewAllGrades = isAdmin || isTeacher;
  const canManageUsers = isAdmin;

  const value = {
    user,
    userRole,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    isAdmin,
    isTeacher,
    isStudent,
    canEditGrades,
    canViewAllGrades,
    canManageUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
