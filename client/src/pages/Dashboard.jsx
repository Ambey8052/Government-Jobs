import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchX, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMatches } from '../api/matches';
import { getMeta } from '../api/meta';
import { listSaved, saveOpportunity, unsaveOpportunity } from '../api/saved';
import { useAuth } from '../context/AuthContext';
import FilterBar from '../components/FilterBar';
import OpportunityCard from '../components/OpportunityCard';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';

export default function Dashboard() {
  const { user } = useAuth();
  const [meta, setMeta] = useState(null);
  const [items, setItems] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [savingId, setSavingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category: '', type: '', eligibleOnly: '' });

  useEffect(() => {
    getMeta().then(setMeta);
  }, []);

  useEffect(() => {
    listSaved().then((data) => {
      setSavedIds(new Set(data.items.map((s) => s.opportunity?._id).filter(Boolean)));
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { ...filters };
    Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
    getMatches(params)
      .then((data) => setItems(data.items))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [filters]);

  async function handleToggleSave(opportunityId) {
    setSavingId(opportunityId);
    try {
      if (savedIds.has(opportunityId)) {
        await unsaveOpportunity(opportunityId);
        setSavedIds((s) => { const n = new Set(s); n.delete(opportunityId); return n; });
        toast.success('Removed from saved');
      } else {
        await saveOpportunity(opportunityId);
        setSavedIds((s) => new Set(s).add(opportunityId));
        toast.success('Saved for later');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingId(null);
    }
  }

  const needsProfile = user && !user.profileComplete;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your matched opportunities</h1>
          <p className="text-sm text-slate-500">Ranked by fit with your profile.</p>
        </div>
      </div>

      {needsProfile && (
        <div className="card mb-6 flex flex-col items-start gap-3 border-brand-200 bg-brand-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="text-brand-600" size={22} />
            <div>
              <p className="font-medium text-slate-900">Your profile is incomplete</p>
              <p className="text-sm text-slate-600">Add your education and preferences for accurate match scores.</p>
            </div>
          </div>
          <Link to="/onboarding" className="btn-accent shrink-0">Complete profile</Link>
        </div>
      )}

      <div className="mb-6">
        <FilterBar meta={meta} filters={filters} onChange={setFilters} showEligibleToggle />
      </div>

      {loading ? (
        <Loader full />
      ) : items.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matching opportunities found"
          description="Try adjusting your filters, or make sure your profile preferences aren't too narrow."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((opp) => (
            <OpportunityCard
              key={opp._id}
              opportunity={opp}
              onToggleSave={handleToggleSave}
              isSaved={savedIds.has(opp._id)}
              saving={savingId === opp._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
