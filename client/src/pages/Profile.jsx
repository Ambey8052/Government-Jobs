import { Link } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../lib/format';

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-slate-100 py-2.5 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value || '—'}</span>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
        <Link to="/onboarding" className="btn-outline">
          <Pencil size={16} /> Edit profile
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Personal Details</h2>
          <Row label="Phone" value={user.phone} />
          <Row label="Date of birth" value={user.dob ? formatDate(user.dob) : null} />
          <Row label="Gender" value={user.gender} />
          <Row label="Social category" value={user.socialCategory} />
          <Row label="Domicile state" value={user.domicileState} />
          <Row label="PwD" value={user.isPwd ? 'Yes' : 'No'} />
          <Row label="Ex-serviceman" value={user.isExServiceman ? 'Yes' : 'No'} />
        </div>

        <div className="card p-5">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Education & Experience</h2>
          {user.education?.length ? (
            user.education.map((e, i) => (
              <Row key={i} label={`${e.level} (${e.stream || 'Any'})`} value={e.percentage ? `${e.percentage}%` : e.yearOfCompletion} />
            ))
          ) : (
            <p className="py-2 text-sm text-slate-400">No education added yet.</p>
          )}
          <Row label="Experience" value={`${user.experienceYears || 0} years`} />
          <Row label="Skills" value={user.skills?.join(', ')} />
        </div>

        <div className="card p-5 sm:col-span-2">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Job & Scheme Preferences</h2>
          <Row label="Preferred categories" value={user.preferredCategories?.join(', ')} />
          <Row label="Preferred states" value={user.preferredStates?.join(', ') || 'All India'} />
          <Row label="Preferred job types" value={user.preferredJobTypes?.join(', ')} />
          <Row label="Minimum expected salary" value={user.minExpectedSalary ? `Rs. ${user.minExpectedSalary.toLocaleString('en-IN')}` : null} />
        </div>
      </div>
    </div>
  );
}
