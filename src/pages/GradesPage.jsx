import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  addGrade,
  updateGrade,
  deleteGrade,
  getAllGrades,
  getGradesByStudent,
} from '../utils/gradesService';
import { getCourses } from '../utils/gradesService';
import { getUsersByRole } from '../utils/usersService';
import toast from 'react-hot-toast';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Save,
  Filter,
} from 'lucide-react';

export default function GradesPage() {
  const { user, userRole, isStudent, canEditGrades } = useAuth();
  const [grades, setGrades] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [form, setForm] = useState({
    studentId: '',
    studentName: '',
    courseId: '',
    courseName: '',
    assignmentName: '',
    score: '',
    maxScore: '100',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [userRole]);

  async function loadData() {
    try {
      let g;
      if (isStudent) {
        g = await getGradesByStudent(user.uid);
      } else {
        g = await getAllGrades();
      }
      setGrades(g);

      const c = await getCourses();
      setCourses(c);

      if (canEditGrades) {
        const s = await getUsersByRole('student');
        setStudents(s);
      }
    } catch (err) {
      console.error('Error loading grades:', err);
      toast.error('Failed to load grades');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };

      // Auto-fill names from ID selections
      if (name === 'studentId') {
        const stu = students.find((s) => s.id === value);
        next.studentName = stu?.displayName || stu?.email || '';
      }
      if (name === 'courseId') {
        const crs = courses.find((c) => c.id === value);
        next.courseName = crs?.name || '';
      }
      return next;
    });
  }

  function openNewForm() {
    setEditingGrade(null);
    setForm({
      studentId: '',
      studentName: '',
      courseId: '',
      courseName: '',
      assignmentName: '',
      score: '',
      maxScore: '100',
      notes: '',
    });
    setShowForm(true);
  }

  function openEditForm(grade) {
    setEditingGrade(grade);
    setForm({
      studentId: grade.studentId,
      studentName: grade.studentName,
      courseId: grade.courseId,
      courseName: grade.courseName,
      assignmentName: grade.assignmentName,
      score: String(grade.score),
      maxScore: String(grade.maxScore),
      notes: grade.notes || '',
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingGrade) {
        await updateGrade(editingGrade.id, {
          ...form,
          score: Number(form.score),
          maxScore: Number(form.maxScore),
        });
        toast.success('Grade updated');
      } else {
        await addGrade({
          ...form,
          teacherId: user.uid,
          teacherName: user.displayName || user.email,
        });
        toast.success('Grade added');
      }
      setShowForm(false);
      loadData();
    } catch (err) {
      toast.error('Failed to save grade');
      console.error(err);
    }
  }

  async function handleDelete(gradeId) {
    if (!window.confirm('Delete this grade? This cannot be undone.')) return;
    try {
      await deleteGrade(gradeId);
      toast.success('Grade deleted');
      loadData();
    } catch (err) {
      toast.error('Failed to delete grade');
    }
  }

  // Filter + search
  const filtered = grades.filter((g) => {
    const matchSearch =
      !search ||
      g.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      g.assignmentName?.toLowerCase().includes(search.toLowerCase()) ||
      g.courseName?.toLowerCase().includes(search.toLowerCase());
    const matchCourse = !filterCourse || g.courseId === filterCourse;
    return matchSearch && matchCourse;
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-300 border-t-ink-900" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink-950">Grades</h1>
          <p className="mt-1 text-ink-500">
            {isStudent ? 'View your grades across all courses.' : 'Manage student grades.'}
          </p>
        </div>
        {canEditGrades && (
          <button onClick={openNewForm} className="btn-accent">
            <Plus className="h-4 w-4" />
            Add Grade
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search by student, assignment, or course…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="input-field appearance-none pl-10 pr-8"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grades table */}
      {filtered.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="text-ink-500">No grades found.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto !p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/50">
                {!isStudent && (
                  <th className="px-4 py-3 text-left font-medium text-ink-600">Student</th>
                )}
                <th className="px-4 py-3 text-left font-medium text-ink-600">Course</th>
                <th className="px-4 py-3 text-left font-medium text-ink-600">Assignment</th>
                <th className="px-4 py-3 text-right font-medium text-ink-600">Score</th>
                <th className="px-4 py-3 text-left font-medium text-ink-600">Notes</th>
                {canEditGrades && (
                  <th className="px-4 py-3 text-right font-medium text-ink-600">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((grade) => {
                const pct = Math.round((grade.score / grade.maxScore) * 100);
                return (
                  <tr
                    key={grade.id}
                    className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50 transition-colors"
                  >
                    {!isStudent && (
                      <td className="px-4 py-3 font-medium text-ink-900">
                        {grade.studentName}
                      </td>
                    )}
                    <td className="px-4 py-3 text-ink-600">{grade.courseName}</td>
                    <td className="px-4 py-3 text-ink-600">{grade.assignmentName}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`badge ${
                          pct >= 90
                            ? 'bg-emerald-50 text-emerald-700'
                            : pct >= 70
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {grade.score}/{grade.maxScore} ({pct}%)
                      </span>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-ink-500">
                      {grade.notes || '—'}
                    </td>
                    {canEditGrades && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditForm(grade)}
                            className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(grade.id)}
                            className="rounded-md p-1.5 text-ink-400 hover:bg-red-50 hover:text-danger"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Add / Edit Modal ───────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="card w-full max-w-lg animate-fade-in">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl text-ink-950">
                {editingGrade ? 'Edit Grade' : 'New Grade'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-md p-1 text-ink-400 hover:bg-ink-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Student select */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">Student</label>
                <select
                  name="studentId"
                  required
                  value={form.studentId}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select student…</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.displayName || s.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course select */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">Course</label>
                <select
                  name="courseId"
                  required
                  value={form.courseId}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select course…</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignment */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">
                  Assignment Name
                </label>
                <input
                  name="assignmentName"
                  required
                  placeholder="e.g. Midterm Exam"
                  value={form.assignmentName}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              {/* Score fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-700">Score</label>
                  <input
                    name="score"
                    type="number"
                    required
                    min="0"
                    placeholder="85"
                    value={form.score}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-700">
                    Max Score
                  </label>
                  <input
                    name="maxScore"
                    type="number"
                    required
                    min="1"
                    placeholder="100"
                    value={form.maxScore}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">
                  Notes <span className="text-ink-400">(optional)</span>
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Any comments on this grade…"
                  value={form.notes}
                  onChange={handleChange}
                  className="input-field resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Save className="h-4 w-4" />
                  {editingGrade ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
