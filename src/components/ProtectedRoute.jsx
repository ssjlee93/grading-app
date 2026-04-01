import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

/**
 * Wraps a route so only authenticated users with allowed roles can access it.
 * @param {string[]} allowedRoles — e.g. ['admin','teacher']
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-300 border-t-ink-900" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert className="h-16 w-16 text-ink-300" />
        <h2 className="font-display text-2xl text-ink-700">Access Denied</h2>
        <p className="max-w-md text-ink-500">
          Your role (<span className="font-medium text-ink-700">{userRole}</span>) does not have
          permission to view this page. Contact an admin if you think this is a mistake.
        </p>
      </div>
    );
  }

  return children;
}
