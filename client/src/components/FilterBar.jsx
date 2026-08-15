import { Search } from 'lucide-react';

export default function FilterBar({ meta, filters, onChange, showEligibleToggle }) {
  function set(field, value) {
    onChange({ ...filters, [field]: value });
  }

  return (
    <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by title, organization, keyword..."
          className="input pl-9"
          value={filters.search || ''}
          onChange={(e) => set('search', e.target.value)}
        />
      </div>

      <select className="input sm:w-44" value={filters.category || ''} onChange={(e) => set('category', e.target.value)}>
        <option value="">All Categories</option>
        {meta?.categories?.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      <select className="input sm:w-40" value={filters.type || ''} onChange={(e) => set('type', e.target.value)}>
        <option value="">All Types</option>
        {meta?.opportunityTypes?.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      {showEligibleToggle && (
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-navy-600 focus:ring-navy-500"
            checked={filters.eligibleOnly === 'true'}
            onChange={(e) => set('eligibleOnly', e.target.checked ? 'true' : '')}
          />
          Eligible only
        </label>
      )}
    </div>
  );
}
