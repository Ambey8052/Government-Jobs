import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Bookmark, BookmarkCheck, Building2, CalendarClock, CheckCircle2,
  ExternalLink, IndianRupee, ListChecks, ShieldAlert, Users, XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getOpportunity } from '../api/opportunities';
import { getMatchDetail } from '../api/matches';
import { saveOpportunity, unsaveOpportunity, listSaved } from '../api/saved';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatSalary, statusTone } from '../lib/format';
import MatchBadge, { MatchLabel } from '../components/MatchBadge';
import Loader from '../components/Loader';

const SCORE_LABELS = {
  education: 'Education level fit',
  stream: 'Field of study fit',
  experience: 'Experience fit',
  categoryPreference: 'Sector preference fit',
  location: 'Location preference fit',
  percentage: 'Marks/cutoff fit',
};

export default function OpportunityDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState(null);
  const [match, setMatch] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const loaders = user
      ? Promise.all([getMatchDetail(id), listSaved()]).then(([m, saved]) => {
          setOpportunity(m.opportunity);
          setMatch(m.match);
          setIsSaved(saved.items.some((s) => s.opportunity?._id === id));
        })
      : getOpportunity(id).then((d) => setOpportunity(d.opportunity));

    loaders.catch((err) => toast.error(err.message)).finally(() => setLoading(false));
  }, [id, user]);

  async function handleToggleSave() {
    if (!user) return navigate('/login');
    setSaving(true);
    try {
      if (isSaved) {
        await unsaveOpportunity(id);
        setIsSaved(false);
        toast.success('Removed from saved');
      } else {
        await saveOpportunity(id);
        setIsSaved(true);
        toast.success('Saved for later');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader full />;
  if (!opportunity) return null;

  const { eligibility } = opportunity;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <button type="button" onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="badge bg-navy-50 text-navy-700">{opportunity.category}</span>
              <span className="badge bg-slate-100 text-slate-600">{opportunity.type}</span>
              <span className={`badge ${statusTone(opportunity.status)}`}>{opportunity.status}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{opportunity.title}</h1>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <Building2 size={15} /> {opportunity.organization}
            </div>
          </div>
          {match && (
            <div className="flex shrink-0 flex-col items-center gap-1">
              <MatchBadge match={match} size={72} />
              <MatchLabel match={match} />
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-4 border-y border-slate-100 py-5 sm:grid-cols-3">
          <div className="flex items-start gap-2">
            <IndianRupee size={16} className="mt-0.5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Salary / Benefit</p>
              <p className="text-sm font-medium text-slate-800">
                {formatSalary(opportunity.salaryMin, opportunity.salaryMax, opportunity.payScaleText)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CalendarClock size={16} className="mt-0.5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Last date to apply</p>
              <p className="text-sm font-medium text-slate-800">{formatDate(opportunity.applicationEndDate)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Users size={16} className="mt-0.5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Vacancies</p>
              <p className="text-sm font-medium text-slate-800">{opportunity.vacancies || 'Not specified'}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <a href={opportunity.officialLink} target="_blank" rel="noopener noreferrer" className="btn-accent">
            <ExternalLink size={16} /> Apply on official site
          </a>
          <button type="button" onClick={handleToggleSave} disabled={saving} className="btn-outline">
            {isSaved ? <BookmarkCheck size={16} className="text-brand-600" /> : <Bookmark size={16} />}
            {isSaved ? 'Saved' : 'Save for later'}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ShieldAlert size={16} /> Eligibility Criteria
          </h2>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>Age: {eligibility.minAge ?? '—'} to {eligibility.maxAge ?? '—'} years (category relaxation applies)</li>
            <li>Minimum education: {eligibility.minEducationLevel}</li>
            {eligibility.allowedStreams?.length > 0 && !eligibility.allowedStreams.includes('Any') && (
              <li>Accepted streams: {eligibility.allowedStreams.join(', ')}</li>
            )}
            {eligibility.minPercentage && <li>Minimum marks: {eligibility.minPercentage}%</li>}
            <li>Gender: {eligibility.genderRequirement}</li>
            <li>Eligible categories: {eligibility.eligibleSocialCategories?.join(', ') || 'All'}</li>
            <li>Domicile: {eligibility.domicileStates?.join(', ') || 'All India'}</li>
            {eligibility.minExperienceYears > 0 && <li>Experience: {eligibility.minExperienceYears}+ years</li>}
            {eligibility.additionalCriteria && <li>{eligibility.additionalCriteria}</li>}
          </ul>
        </div>

        <div className="card p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ListChecks size={16} /> Selection & Application
          </h2>
          <div className="space-y-3 text-sm text-slate-600">
            {opportunity.selectionProcess && <p><span className="font-medium text-slate-800">Selection process: </span>{opportunity.selectionProcess}</p>}
            {opportunity.howToApply && <p><span className="font-medium text-slate-800">How to apply: </span>{opportunity.howToApply}</p>}
            {opportunity.documentsRequired?.length > 0 && (
              <div>
                <p className="font-medium text-slate-800">Documents required:</p>
                <ul className="mt-1 list-inside list-disc">
                  {opportunity.documentsRequired.map((d) => <li key={d}>{d}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card mt-6 p-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">About this opportunity</h2>
        <p className="text-sm leading-relaxed text-slate-600">{opportunity.description}</p>
      </div>

      {match && (
        <div className="card mt-6 p-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Why this match score?</h2>
          {!match.eligible && match.reasons.length > 0 && (
            <div className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
              <p className="mb-1 flex items-center gap-1.5 font-medium"><XCircle size={15} /> Eligibility concerns</p>
              <ul className="list-inside list-disc space-y-0.5">
                {match.reasons.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>
          )}
          <div className="space-y-2">
            {Object.entries(match.breakdown).map(([key, value]) => {
              const max = { education: 25, stream: 15, experience: 15, categoryPreference: 20, location: 15, percentage: 10 }[key];
              return (
                <div key={key}>
                  <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>{SCORE_LABELS[key] || key}</span>
                    <span>{value}/{max}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-navy-600" style={{ width: `${(value / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          {match.eligible && (
            <p className="mt-4 flex items-center gap-1.5 text-sm text-emerald-700">
              <CheckCircle2 size={15} /> You meet the core eligibility criteria for this opportunity.
            </p>
          )}
        </div>
      )}

      {!user && (
        <div className="card mt-6 flex flex-col items-center gap-2 p-6 text-center">
          <p className="text-sm text-slate-600">Log in to see your personalized match score for this opportunity.</p>
          <Link to="/login" className="btn-primary">Log in</Link>
        </div>
      )}
    </div>
  );
}
