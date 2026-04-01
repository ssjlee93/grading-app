import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../contexts/AuthContext';
import {
  BookOpen,
  LayoutDashboard,
  Users,
  LogOut,
  GraduationCap,
  ClipboardList,
  Menu,
  X,
  Settings,
} from 'lucide-react';

const roleLabels = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.TEACHER]: 'Teacher',
  [ROLES.STUDENT]: 'Student',
};

const roleBadgeColors = {
  [ROLES.ADMIN]: 'bg-accent/10 text-accent-dark',
  [ROLES.TEACHER]: 'bg-blue-50 text-blue-700',
  [ROLES.STUDENT]: 'bg-emerald-50 text-emerald-700',
};

export default function Layout() {
  const { user, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const navItems = getNavItems(userRole);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-ink-100 bg-white
          transition-transform duration-300 lg:static lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-ink-100 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-950">
            <GraduationCap className="h-5 w-5 text-ink-50" />
          </div>
          <div>
            <h1 className="font-display text-xl leading-none text-ink-950">GradeBook</h1>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-ink-400">
              Portal
            </p>
          </div>
          <button
            className="ml-auto rounded-md p-1 text-ink-400 hover:bg-ink-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-ink-950 text-ink-50'
                  : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
                }`
              }
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="border-t border-ink-100 p-4">
          <div className="mb-3 rounded-lg bg-ink-50 p-3">
            <p className="truncate text-sm font-medium text-ink-900">
              {user?.displayName || user?.email}
            </p>
            <p className="mt-0.5 truncate text-xs text-ink-500">{user?.email}</p>
            <span className={`badge mt-2 ${roleBadgeColors[userRole] || 'bg-ink-100 text-ink-600'}`}>
              {roleLabels[userRole] || userRole}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-500 transition-colors hover:bg-red-50 hover:text-danger"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex items-center gap-3 border-b border-ink-100 bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-ink-600 hover:bg-ink-50"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg text-ink-950">GradeBook</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function getNavItems(role) {
  const items = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student'] },
    { to: '/grades', label: 'Grades', icon: ClipboardList, roles: ['admin', 'teacher', 'student'] },
    { to: '/courses', label: 'Courses', icon: BookOpen, roles: ['admin', 'teacher'] },
    { to: '/users', label: 'Manage Users', icon: Users, roles: ['admin'] },
    { to: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
  ];
  return items.filter((item) => item.roles.includes(role));
}
