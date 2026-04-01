import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const USERS_COLLECTION = 'users';

export async function getAllUsers() {
  const snap = await getDocs(collection(db, USERS_COLLECTION));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getUsersByRole(role) {
  const q = query(collection(db, USERS_COLLECTION), where('role', '==', role));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateUserRole(userId, newRole) {
  const ref = doc(db, USERS_COLLECTION, userId);
  return updateDoc(ref, { role: newRole });
}

export async function deleteUser(userId) {
  // Note: This only removes the Firestore doc.
  // To fully delete a Firebase Auth user, use Firebase Admin SDK in a Cloud Function.
  return deleteDoc(doc(db, USERS_COLLECTION, userId));
}
