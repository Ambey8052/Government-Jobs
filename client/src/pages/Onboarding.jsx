import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMeta } from '../api/meta';
import { updateProfile } from '../api/profile';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const STEPS = ['Personal', 'Education', 'Preferences'];

function emptyEducation() {
  return { level: '', stream: 'Any', yearOfCompletion: '', percentage: '' };
}

export default function Onboarding() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [meta, setMeta] = useState(null);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [personal, setPersonal] = useState({
    dob: user?.dob ? user.dob.slice(0, 10) : '',
    gender: user?.gender || '',
    socialCategory: user?.socialCategory || 'General',
    isPwd: user?.isPwd || false,
    isExServiceman: user?.isExServiceman || false,
    domicileState: user?.domicileState || '',
  });
  const [education, setEducation] = useState(user?.education?.length ? user.education : [emptyEducation()]);
  const [experienceYears, setExperienceYears] = useState(user?.experienceYears || 0);
  const [skills, setSkills] = useState(user?.skills?.join(', ') || '');
  const [preferences, setPreferences] = useState({
    preferredCategories: user?.preferredCategories || [],
    preferredStates: user?.preferredStates || [],
    preferredJobTypes: user?.preferredJobTypes || [],
    minExpectedSalary: user?.minExpectedSalary || '',
  });

  useEffect(() => {
    getMeta().then(setMeta).catch(() => toast.error('Could not load form options'));
  }, []);

  function toggleMulti(field, value) {
    setPreferences((p) => {
      const set = new Set(p[field]);
      set.has(value) ? set.delete(value) : set.add(value);
      return { ...p, [field]: Array.from(set) };
    });
  }

  function updateEducationRow(idx, field, value) {
    setEducation((rows) => rows.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  }

  async function handleFinish() {
    setSaving(true);
    try {
      const payload = {
        ...personal,
        education: education
          .filter((r) => r.level)
          .map((r) => ({
            ...r,
            yearOfCompletion: r.yearOfCompletion ? Number(r.yearOfCompletion) : undefined,
            percentage: r.percentage ? Number(r.percentage) : undefined,
          })),
        experienceYears: Number(experienceYears) || 0,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        ...preferences,
        minExpectedSalary: preferences.minExpectedSalary ? Number(preferences.minExpectedSalary) : undefined,
      };
      const { user: updated } = await updateProfile(payload);
      refreshUser(updated);
      toast.success('Profile saved! Here are your matches.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!meta) return <Loader full label="Loading form..." />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Complete your profile</h1>
      <p className="mt-1 text-sm text-slate-500">This helps us calculate an accurate match percentage for every listing.</p>

      <ol className="my-6 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
              i <= step ? 'bg-navy-700 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {i < step ? <Check size={16} /> : i + 1}
            </div>
            <span className={`text-sm ${i === step ? 'font-semibold text-slate-900' : 'text-slate-400'}`}>{label}</span>
            {i < STEPS.length - 1 && <div className="h-px flex-1 bg-slate-200" />}
          </li>
        ))}
      </ol>

      <div className="card p-6">
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Date of birth</label>
                <input type="date" className="input" value={personal.dob} onChange={(e) => setPersonal({ ...personal, dob: e.target.value })} />
              </div>
              <div>
                <label className="label">Gender</label>
                <select className="input" value={personal.gender} onChange={(e) => setPersonal({ ...personal, gender: e.target.value })}>
                  <option value="">Select</option>
                  {meta.genders.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Social category</label>
                <select className="input" value={personal.socialCategory} onChange={(e) => setPersonal({ ...personal, socialCategory: e.target.value })}>
                  {meta.socialCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Domicile state</label>
                <select className="input" value={personal.domicileState} onChange={(e) => setPersonal({ ...personal, domicileState: e.target.value })}>
                  <option value="">Select</option>
                  {meta.states.filter((s) => s !== 'All India').map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300" checked={personal.isPwd} onChange={(e) => setPersonal({ ...personal, isPwd: e.target.checked })} />
                Person with disability
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300" checked={personal.isExServiceman} onChange={(e) => setPersonal({ ...personal, isExServiceman: e.target.checked })} />
                Ex-serviceman
              </label>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            {education.map((row, idx) => (
              <div key={idx} className="rounded-lg border border-slate-200 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Qualification {idx + 1}</span>
                  {education.length > 1 && (
                    <button type="button" onClick={() => setEducation((rows) => rows.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-rose-600">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select className="input" value={row.level} onChange={(e) => updateEducationRow(idx, 'level', e.target.value)}>
                    <option value="">Level</option>
                    {meta.educationLevels.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <select className="input" value={row.stream} onChange={(e) => updateEducationRow(idx, 'stream', e.target.value)}>
                    {meta.streams.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input type="number" placeholder="Year of completion" className="input" value={row.yearOfCompletion} onChange={(e) => updateEducationRow(idx, 'yearOfCompletion', e.target.value)} />
                  <input type="number" placeholder="Percentage / CGPA*10" className="input" value={row.percentage} onChange={(e) => updateEducationRow(idx, 'percentage', e.target.value)} />
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setEducation((rows) => [...rows, emptyEducation()])} className="btn-outline text-sm">
              <Plus size={16} /> Add another qualification
            </button>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="label">Years of work experience</label>
                <input type="number" min="0" className="input" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} />
              </div>
              <div>
                <label className="label">Skills (comma separated)</label>
                <input className="input" placeholder="e.g. Typing, Tally, MS Office" value={skills} onChange={(e) => setSkills(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="label">Preferred categories</label>
              <div className="flex flex-wrap gap-2">
                {meta.categories.map((c) => (
                  <button
                    type="button" key={c} onClick={() => toggleMulti('preferredCategories', c)}
                    className={`badge border ${preferences.preferredCategories.includes(c) ? 'border-navy-600 bg-navy-50 text-navy-700' : 'border-slate-200 text-slate-500'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Preferred states (leave empty for All India)</label>
              <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
                {meta.states.map((s) => (
                  <button
                    type="button" key={s} onClick={() => toggleMulti('preferredStates', s)}
                    className={`badge border ${preferences.preferredStates.includes(s) ? 'border-navy-600 bg-navy-50 text-navy-700' : 'border-slate-200 text-slate-500'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Preferred job type</label>
              <div className="flex flex-wrap gap-2">
                {meta.jobTypes.map((t) => (
                  <button
                    type="button" key={t} onClick={() => toggleMulti('preferredJobTypes', t)}
                    className={`badge border ${preferences.preferredJobTypes.includes(t) ? 'border-navy-600 bg-navy-50 text-navy-700' : 'border-slate-200 text-slate-500'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Minimum expected salary (Rs./month, optional)</label>
              <input type="number" className="input" value={preferences.minExpectedSalary} onChange={(e) => setPreferences({ ...preferences, minExpectedSalary: e.target.value })} />
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button type="button" disabled={step === 0} onClick={() => setStep((s) => s - 1)} className="btn-outline disabled:invisible">
          <ArrowLeft size={16} /> Back
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={() => setStep((s) => s + 1)} className="btn-primary">
            Next <ArrowRight size={16} />
          </button>
        ) : (
          <button type="button" disabled={saving} onClick={handleFinish} className="btn-accent">
            <Check size={16} /> {saving ? 'Saving...' : 'Finish & See Matches'}
          </button>
        )}
      </div>
    </div>
  );
}
