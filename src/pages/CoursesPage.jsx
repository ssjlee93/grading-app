import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  addCourse,
  getCourses,
  getCoursesByTeacher,
  deleteCourse,
} from '../utils/gradesService';
import toast from 'react-hot-toast';
import { Plus, Trash2, BookOpen, X, Save } from 'lucide-react';

export default function CoursesPage() {
  const { user, isAdmin, isTeacher } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      let c;
      if (isAdmin) {
        c = await getCourses();
      } else {
        c = await getCoursesByTeacher(user.uid);
      }
      setCourses(c);
    } catch (err) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await addCourse({
        name: form.name,
        description: form.description,
        teacherId: user.uid,
        teacherName: user.displayName || user.email,
      });
      toast.success('Course created');
      setShowForm(false);
      setForm({ name: '', description: '' });
      loadCourses();
    } catch (err) {
      toast.error('Failed to create course');
    }
  }

  async function handleDelete(courseId) {
    if (!window.confirm('Delete this course? This will not delete associated grades.')) return;
    try {
      await deleteCourse(courseId);
      toast.success('Course deleted');
      loadCourses();
    } catch (err) {
      toast.error('Failed to delete course');
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-300 border-t-ink-900" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink-950">Courses</h1>
          <p className="mt-1 text-ink-500">
            {isAdmin ? 'All courses in the system.' : 'Courses you teach.'}
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-accent">
          <Plus className="h-4 w-4" />
          New Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="card py-16 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-ink-300" />
          <p className="text-ink-500">No courses yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <div key={course.id} className="card flex items-center justify-between">
              <div>
                <h3 className="font-medium text-ink-900">{course.name}</h3>
                {course.description && (
                  <p className="mt-0.5 text-sm text-ink-500">{course.description}</p>
                )}
                <p className="mt-1 text-xs text-ink-400">
                  Teacher: {course.teacherName}
                </p>
              </div>
              <button
                onClick={() => handleDelete(course.id)}
                className="rounded-md p-2 text-ink-400 hover:bg-red-50 hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* New course modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md animate-fade-in">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl text-ink-950">New Course</h2>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-md p-1 text-ink-400 hover:bg-ink-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">
                  Course Name
                </label>
                <input
                  required
                  placeholder="e.g. AP Chemistry"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">
                  Description <span className="text-ink-400">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description…"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="input-field resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Save className="h-4 w-4" />
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
