import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole, deleteUser } from '../utils/usersService';
import { ROLES } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Users, Shield, GraduationCap, BookOpen, Trash2, RefreshCw } from 'lucide-react';

const roleConfig = {
  [ROLES.ADMIN]: { label: 'Admin', icon: Shield, color: 'bg-accent/10 text-accent-dark' },
  [ROLES.TEACHER]: { label: 'Teacher', icon: BookOpen, color: 'bg-blue-50 text-blue-700' },
  [ROLES.STUDENT]: { label: 'Student', icon: GraduationCap, color: 'bg-emerald-50 text-emerald-700' },
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const u = await getAllUsers();
      setUsers(u);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    setUpdating(userId);
    try {
      await updateUserRole(userId, newRole);
      toast.success(`Role updated to ${newRole}`);
      loadUsers();
    } catch (err) {
      toast.error('Failed to update role');
    } finally {
      setUpdating(null);
    }
  }

  async function handleDelete(userId, email) {
    if (!window.confirm(`Remove ${email} from the system? This only removes their Firestore profile.`))
      return;
    try {
      await deleteUser(userId);
      toast.success('User removed');
      loadUsers();
    } catch (err) {
      toast.error('Failed to remove user');
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-300 border-t-ink-900" />
      </div>
    );
  }

  const counts = {
    admin: users.filter((u) => u.role === ROLES.ADMIN).length,
    teacher: users.filter((u) => u.role === ROLES.TEACHER).length,
    student: users.filter((u) => u.role === ROLES.STUDENT).length,
  };

  return (
    <div className="mx-auto max-w-4xl animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink-950">Manage Users</h1>
          <p className="mt-1 text-ink-500">
            {users.length} users — {counts.admin} admins, {counts.teacher} teachers,{' '}
            {counts.student} students
          </p>
        </div>
        <button onClick={loadUsers} className="btn-secondary">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {users.length === 0 ? (
        <div className="card py-16 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-ink-300" />
          <p className="text-ink-500">No users registered yet.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto !p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/50">
                <th className="px-4 py-3 text-left font-medium text-ink-600">User</th>
                <th className="px-4 py-3 text-left font-medium text-ink-600">Current Role</th>
                <th className="px-4 py-3 text-left font-medium text-ink-600">Change Role</th>
                <th className="px-4 py-3 text-left font-medium text-ink-600">Joined</th>
                <th className="px-4 py-3 text-right font-medium text-ink-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const cfg = roleConfig[u.role] || roleConfig[ROLES.STUDENT];
                const RoleIcon = cfg.icon;
                return (
                  <tr
                    key={u.id}
                    className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink-900">
                        {u.displayName || '(no name)'}
                      </p>
                      <p className="text-xs text-ink-500">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge gap-1 ${cfg.color}`}>
                        <RoleIcon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={updating === u.id}
                        className="input-field !w-auto !py-1.5 text-xs"
                      >
                        <option value={ROLES.STUDENT}>Student</option>
                        <option value={ROLES.TEACHER}>Teacher</option>
                        <option value={ROLES.ADMIN}>Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(u.id, u.email)}
                        className="rounded-md p-1.5 text-ink-400 hover:bg-red-50 hover:text-danger"
                        title="Remove user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Info callout */}
      <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-medium">How role assignment works</p>
        <p className="mt-1 text-amber-700">
          New users default to the <strong>Student</strong> role. Use the dropdown above to promote
          users to Teacher or Admin. Role changes take effect on the user's next page load.
        </p>
      </div>
    </div>
  );
}
