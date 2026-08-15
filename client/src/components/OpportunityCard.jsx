import { Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Building2, CalendarClock, IndianRupee } from 'lucide-react';
import MatchBadge, { MatchLabel } from './MatchBadge';
import { daysLeft, formatDate, formatSalary, statusTone } from '../lib/format';

export default function OpportunityCard({ opportunity, onToggleSave, isSaved, saving }) {
  const {
    _id, title, organization, category, type, status,
    salaryMin, salaryMax, payScaleText, applicationEndDate, match,
  } = opportunity;

  const left = daysLeft(applicationEndDate);

  return (
    <div className="card flex flex-col gap-3 p-5 transition-shadow hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="badge bg-navy-50 text-navy-700">{category}</span>
            <span className="badge bg-slate-100 text-slate-600">{type}</span>
            <span className={`badge ${statusTone(status)}`}>{status}</span>
          </div>
          <Link to={`/opportunities/${_id}`} className="block truncate text-base font-semibold text-slate-900 hover:text-navy-700">
            {title}
          </Link>
          <div className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
            <Building2 size={14} />
            <span className="truncate">{organization}</span>
          </div>
        </div>
        {match && <MatchBadge match={match} />}
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-600">
        <div className="flex items-center gap-1.5">
          <IndianRupee size={14} />
          <span>{formatSalary(salaryMin, salaryMax, payScaleText)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarClock size={14} />
          <span>
            Last date: {formatDate(applicationEndDate)}
            {left != null && left >= 0 && <span className="ml-1 text-slate-400">({left} days left)</span>}
          </span>
        </div>
      </div>

      <div className="mt-1 flex items-center justify-between">
        {match ? <MatchLabel match={match} /> : <span />}
        <div className="flex items-center gap-2">
          {onToggleSave && (
            <button
              type="button"
              onClick={() => onToggleSave(_id)}
              disabled={saving}
              className="btn-ghost !px-2 !py-1.5"
              aria-label={isSaved ? 'Remove from saved' : 'Save opportunity'}
            >
              {isSaved ? <BookmarkCheck size={18} className="text-brand-600" /> : <Bookmark size={18} />}
            </button>
          )}
          <Link to={`/opportunities/${_id}`} className="btn-outline !px-3 !py-1.5 text-xs">
            View details
          </Link>
        </div>
      </div>
    </div>
  );
}
