import { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';
import { listSaved, unsaveOpportunity } from '../api/saved';
import OpportunityCard from '../components/OpportunityCard';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';

export default function Saved() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  function load() {
    setLoading(true);
    listSaved()
      .then((data) => setItems(data.items.filter((s) => s.opportunity)))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleRemove(opportunityId) {
    setRemovingId(opportunityId);
    try {
      await unsaveOpportunity(opportunityId);
      setItems((prev) => prev.filter((s) => s.opportunity._id !== opportunityId));
      toast.success('Removed from saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Saved opportunities</h1>
      <p className="mb-6 text-sm text-slate-500">Jobs and schemes you've bookmarked for later.</p>

      {loading ? (
        <Loader full />
      ) : items.length === 0 ? (
        <EmptyState icon={Bookmark} title="Nothing saved yet" description="Save opportunities from your dashboard to find them here." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <OpportunityCard
              key={s._id}
              opportunity={s.opportunity}
              onToggleSave={() => handleRemove(s.opportunity._id)}
              isSaved
              saving={removingId === s.opportunity._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
