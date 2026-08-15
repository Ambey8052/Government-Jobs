import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Briefcase, Clock, Plus, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAdminStats } from '../../api/admin';
import StatCard from '../../components/StatCard';
import Loader from '../../components/Loader';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getAdminStats().then(setStats).catch((err) => toast.error(err.message));
  }, []);

  if (!stats) return <Loader full />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin dashboard</h1>
          <p className="text-sm text-slate-500">Manage job & scheme listings.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/opportunities" className="btn-outline">Manage listings</Link>
          <Link to="/admin/opportunities/new" className="btn-accent"><Plus size={16} /> New listing</Link>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Briefcase} label="Total listings" value={stats.totalOpportunities} tone="navy" />
        <StatCard icon={Clock} label="Active listings" value={stats.activeOpportunities} tone="emerald" />
        <StatCard icon={Clock} label="Closing within 7 days" value={stats.closingSoon} tone="amber" />
        <StatCard icon={Users} label="Registered applicants" value={stats.totalUsers} tone="brand" />
      </div>

      <div className="card mt-6 p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Listings by category</h2>
        <div className="space-y-2">
          {stats.byCategory.map((c) => (
            <div key={c._id} className="flex items-center gap-3">
              <span className="w-40 shrink-0 truncate text-sm text-slate-600">{c._id}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-navy-600"
                  style={{ width: `${(c.count / stats.totalOpportunities) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right text-sm text-slate-500">{c.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
        <Bookmark size={14} /> {stats.totalSaved} total saves across all applicants
      </div>
    </div>
  );
}
