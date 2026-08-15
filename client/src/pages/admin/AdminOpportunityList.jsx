import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteOpportunity, listOpportunitiesAdmin } from '../../api/opportunities';
import { formatDate, statusTone } from '../../lib/format';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

export default function AdminOpportunityList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  function load() {
    setLoading(true);
    listOpportunitiesAdmin()
      .then((data) => setItems(data.items))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id, title) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteOpportunity(id);
      setItems((prev) => prev.filter((o) => o._id !== id));
      toast.success('Listing deleted');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Manage listings</h1>
        <Link to="/admin/opportunities/new" className="btn-accent"><Plus size={16} /> New listing</Link>
      </div>

      {loading ? (
        <Loader full />
      ) : items.length === 0 ? (
        <EmptyState title="No listings yet" description="Create your first job or scheme listing." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <tr key={o._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="max-w-xs truncate px-4 py-3 font-medium text-slate-800">{o.title}</td>
                  <td className="px-4 py-3 text-slate-500">{o.category}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusTone(o.status)}`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(o.applicationEndDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/opportunities/${o._id}/edit`} className="btn-ghost !px-2 !py-1.5">
                        <Pencil size={16} />
                      </Link>
                      <button
                        type="button" onClick={() => handleDelete(o._id, o.title)} disabled={deletingId === o._id}
                        className="btn-ghost !px-2 !py-1.5 text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
