import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAllGrades, getGradesByStudent } from '../utils/gradesService';
import { getAllUsers } from '../utils/usersService';
import { getCourses } from '../utils/gradesService';
import {
  BookOpen,
  ClipboardList,
  Users,
  TrendingUp,
  Award,
  BarChart3,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, userRole, isAdmin, isTeacher, isStudent } = useAuth();
  const [stats, setStats] = useState({
    totalGrades: 0,
    totalCourses: 0,
    totalUsers: 0,
    averageScore: 0,
    recentGrades: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [userRole]);

  async function loadStats() {
    try {
      let grades = [];
      if (isStudent) {
        grades = await getGradesByStudent(user.uid);
      } else {
        grades = await getAllGrades();
      }

      const courses = await getCourses();
      let users = [];
      if (isAdmin) {
        users = await getAllUsers();
      }

      const avg =
        grades.length > 0
          ? grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / grades.length
          : 0;

      setStats({
        totalGrades: grades.length,
        totalCourses: courses.length,
        totalUsers: users.length,
        averageScore: Math.round(avg * 10) / 10,
        recentGrades: grades.slice(0, 5),
      });
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-300 border-t-ink-900" />
      </div>
    );
  }

  const greeting = getGreeting();

  return (
    <div className="mx-auto max-w-5xl animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ink-950 lg:text-4xl">
          {greeting}, {user?.displayName?.split(' ')[0] || 'there'}
        </h1>
        <p className="mt-2 text-ink-500">
          {isStudent && "Here's an overview of your academic performance."}
          {isTeacher && "Here's a summary of your grading activity."}
          {isAdmin && "Here's a system-wide overview."}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ClipboardList}
          label={isStudent ? 'My Grades' : 'Total Grades'}
          value={stats.totalGrades}
          color="bg-blue-50 text-blue-600"
          delay={1}
        />
        <StatCard
          icon={TrendingUp}
          label="Average Score"
          value={`${stats.averageScore}%`}
          color="bg-emerald-50 text-emerald-600"
          delay={2}
        />
        <StatCard
          icon={BookOpen}
          label="Courses"
          value={stats.totalCourses}
          color="bg-amber-50 text-amber-600"
          delay={3}
        />
        {isAdmin && (
          <StatCard
            icon={Users}
            label="Users"
            value={stats.totalUsers}
            color="bg-purple-50 text-purple-600"
            delay={4}
          />
        )}
        {!isAdmin && (
          <StatCard
            icon={Award}
            label="Highest Score"
            value={
              stats.recentGrades.length > 0
                ? `${Math.max(...stats.recentGrades.map((g) => Math.round((g.score / g.maxScore) * 100)))}%`
                : '—'
            }
            color="bg-accent/10 text-accent"
            delay={4}
          />
        )}
      </div>

      {/* Recent grades */}
      <div className="mt-8">
        <h2 className="mb-4 font-display text-xl text-ink-900">
          {isStudent ? 'Recent Grades' : 'Recently Entered'}
        </h2>
        {stats.recentGrades.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="mb-3 h-10 w-10 text-ink-300" />
            <p className="text-ink-500">No grades recorded yet.</p>
            {isTeacher && (
              <p className="mt-1 text-sm text-ink-400">
                Head to the Grades page to start entering scores.
              </p>
            )}
          </div>
        ) : (
          <div className="card overflow-hidden !p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/50">
                  {!isStudent && <th className="px-4 py-3 text-left font-medium text-ink-600">Student</th>}
                  <th className="px-4 py-3 text-left font-medium text-ink-600">Course</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-600">Assignment</th>
                  <th className="px-4 py-3 text-right font-medium text-ink-600">Score</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentGrades.map((grade) => {
                  const pct = Math.round((grade.score / grade.maxScore) * 100);
                  return (
                    <tr key={grade.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50">
                      {!isStudent && (
                        <td className="px-4 py-3 font-medium text-ink-900">{grade.studentName}</td>
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <div className={`card animate-fade-in animate-fade-in-delay-${delay}`}>
      <div className={`mb-3 inline-flex rounded-lg p-2.5 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-ink-500">{label}</p>
      <p className="mt-1 font-display text-2xl text-ink-950">{value}</p>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
