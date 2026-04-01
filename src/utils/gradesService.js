import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const GRADES_COLLECTION = 'grades';
const COURSES_COLLECTION = 'courses';

// ─── Grades ─────────────────────────────────────────

export async function addGrade({ studentId, studentName, courseId, courseName, assignmentName, score, maxScore, notes, teacherId, teacherName }) {
  return addDoc(collection(db, GRADES_COLLECTION), {
    studentId,
    studentName,
    courseId,
    courseName,
    assignmentName,
    score: Number(score),
    maxScore: Number(maxScore),
    notes: notes || '',
    teacherId,
    teacherName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateGrade(gradeId, updates) {
  const ref = doc(db, GRADES_COLLECTION, gradeId);
  return updateDoc(ref, {
    ...updates,
    score: updates.score !== undefined ? Number(updates.score) : undefined,
    maxScore: updates.maxScore !== undefined ? Number(updates.maxScore) : undefined,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteGrade(gradeId) {
  return deleteDoc(doc(db, GRADES_COLLECTION, gradeId));
}

export async function getGradesByStudent(studentId) {
  const q = query(
    collection(db, GRADES_COLLECTION),
    where('studentId', '==', studentId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getGradesByCourse(courseId) {
  const q = query(
    collection(db, GRADES_COLLECTION),
    where('courseId', '==', courseId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAllGrades() {
  const q = query(collection(db, GRADES_COLLECTION), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Courses ────────────────────────────────────────

export async function addCourse({ name, teacherId, teacherName, description }) {
  return addDoc(collection(db, COURSES_COLLECTION), {
    name,
    teacherId,
    teacherName,
    description: description || '',
    createdAt: serverTimestamp(),
  });
}

export async function getCourses() {
  const snap = await getDocs(collection(db, COURSES_COLLECTION));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getCoursesByTeacher(teacherId) {
  const q = query(collection(db, COURSES_COLLECTION), where('teacherId', '==', teacherId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteCourse(courseId) {
  return deleteDoc(doc(db, COURSES_COLLECTION, courseId));
}
