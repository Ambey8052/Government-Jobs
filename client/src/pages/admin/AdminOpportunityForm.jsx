import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMeta } from '../../api/meta';
import { createOpportunity, getOpportunity, updateOpportunity } from '../../api/opportunities';
import Loader from '../../components/Loader';

const initialState = {
  title: '', organization: '', category: '', type: 'Job', jobType: 'Permanent',
  description: '',
  minAge: '', maxAge: '', minEducationLevel: '', allowedStreams: ['Any'],
  minPercentage: '', genderRequirement: 'Any', eligibleSocialCategories: [],
  domicileStates: ['All India'], minExperienceYears: '0', additionalCriteria: '',
  salaryMin: '', salaryMax: '', payScaleText: '',
  vacancies: '', applicationStartDate: '', applicationEndDate: '',
  officialLink: '', howToApply: '', documentsRequired: '', selectionProcess: '', tags: '',
};

function toFormState(o) {
  return {
    ...initialState,
    ...o,
    minAge: o.eligibility?.minAge ?? '',
    maxAge: o.eligibility?.maxAge ?? '',
    minEducationLevel: o.eligibility?.minEducationLevel ?? '',
    allowedStreams: o.eligibility?.allowedStreams?.length ? o.eligibility.allowedStreams : ['Any'],
    minPercentage: o.eligibility?.minPercentage ?? '',
    genderRequirement: o.eligibility?.genderRequirement ?? 'Any',
    eligibleSocialCategories: o.eligibility?.eligibleSocialCategories ?? [],
    domicileStates: o.eligibility?.domicileStates?.length ? o.eligibility.domicileStates : ['All India'],
    minExperienceYears: String(o.eligibility?.minExperienceYears ?? 0),
    additionalCriteria: o.eligibility?.additionalCriteria ?? '',
    applicationStartDate: o.applicationStartDate ? o.applicationStartDate.slice(0, 10) : '',
    applicationEndDate: o.applicationEndDate ? o.applicationEndDate.slice(0, 10) : '',
    documentsRequired: o.documentsRequired?.join(', ') ?? '',
    tags: o.tags?.join(', ') ?? '',
  };
}

export default function AdminOpportunityForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [meta, setMeta] = useState(null);
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMeta().then(setMeta).catch(() => toast.error('Could not load form options'));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    getOpportunity(id)
      .then((d) => setForm(toFormState(d.opportunity)))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleArrayField(field, value) {
    setForm((f) => {
      const set = new Set(f[field]);
      set.has(value) ? set.delete(value) : set.add(value);
      return { ...f, [field]: Array.from(set) };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        organization: form.organization,
        category: form.category,
        type: form.type,
        jobType: form.jobType,
        description: form.description,
        eligibility: {
          minAge: form.minAge ? Number(form.minAge) : undefined,
          maxAge: form.maxAge ? Number(form.maxAge) : undefined,
          minEducationLevel: form.minEducationLevel,
          allowedStreams: form.allowedStreams,
          minPercentage: form.minPercentage ? Number(form.minPercentage) : undefined,
          genderRequirement: form.genderRequirement,
          eligibleSocialCategories: form.eligibleSocialCategories.length ? form.eligibleSocialCategories : meta.socialCategories,
          domicileStates: form.domicileStates,
          minExperienceYears: Number(form.minExperienceYears) || 0,
          additionalCriteria: form.additionalCriteria,
        },
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        payScaleText: form.payScaleText,
        vacancies: form.vacancies ? Number(form.vacancies) : undefined,
        applicationStartDate: form.applicationStartDate || undefined,
        applicationEndDate: form.applicationEndDate,
        officialLink: form.officialLink,
        howToApply: form.howToApply,
        documentsRequired: form.documentsRequired.split(',').map((s) => s.trim()).filter(Boolean),
        selectionProcess: form.selectionProcess,
        tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      };

      if (isEdit) {
        await updateOpportunity(id, payload);
        toast.success('Listing updated');
      } else {
        await createOpportunity(payload);
        toast.success('Listing created');
      }
      navigate('/admin/opportunities');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !meta) return <Loader full />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">{isEdit ? 'Edit listing' : 'New listing'}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="card space-y-4 p-6">
          <h2 className="text-sm font-semibold text-slate-900">Basic details</h2>
          <div>
            <label className="label">Title</label>
            <input required className="input" value={form.title} onChange={(e) => set('title', e.target.value)} />
          </div>
          <div>
            <label className="label">Organization</label>
            <input required className="input" value={form.organization} onChange={(e) => set('organization', e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Category</label>
              <select required className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                <option value="">Select</option>
                {meta.categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={(e) => set('type', e.target.value)}>
                {meta.opportunityTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Job type</label>
              <select className="input" value={form.jobType} onChange={(e) => set('jobType', e.target.value)}>
                {meta.jobTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea required rows={4} className="input" value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>
        </section>

        <section className="card space-y-4 p-6">
          <h2 className="text-sm font-semibold text-slate-900">Eligibility criteria</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Minimum age</label>
              <input type="number" className="input" value={form.minAge} onChange={(e) => set('minAge', e.target.value)} />
            </div>
            <div>
              <label className="label">Maximum age</label>
              <input type="number" className="input" value={form.maxAge} onChange={(e) => set('maxAge', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Minimum education level</label>
              <select required className="input" value={form.minEducationLevel} onChange={(e) => set('minEducationLevel', e.target.value)}>
                <option value="">Select</option>
                {meta.educationLevels.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Minimum percentage (optional)</label>
              <input type="number" className="input" value={form.minPercentage} onChange={(e) => set('minPercentage', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Accepted streams (leave "Any" if open to all)</label>
            <div className="flex flex-wrap gap-2">
              {meta.streams.map((s) => (
                <button type="button" key={s} onClick={() => toggleArrayField('allowedStreams', s)}
                  className={`badge border ${form.allowedStreams.includes(s) ? 'border-navy-600 bg-navy-50 text-navy-700' : 'border-slate-200 text-slate-500'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Gender requirement</label>
              <select className="input" value={form.genderRequirement} onChange={(e) => set('genderRequirement', e.target.value)}>
                {meta.genderRequirements.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Minimum experience (years)</label>
              <input type="number" min="0" className="input" value={form.minExperienceYears} onChange={(e) => set('minExperienceYears', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Eligible social categories (leave empty for all)</label>
            <div className="flex flex-wrap gap-2">
              {meta.socialCategories.map((c) => (
                <button type="button" key={c} onClick={() => toggleArrayField('eligibleSocialCategories', c)}
                  className={`badge border ${form.eligibleSocialCategories.includes(c) ? 'border-navy-600 bg-navy-50 text-navy-700' : 'border-slate-200 text-slate-500'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Domicile / open to states</label>
            <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
              {meta.states.map((s) => (
                <button type="button" key={s} onClick={() => toggleArrayField('domicileStates', s)}
                  className={`badge border ${form.domicileStates.includes(s) ? 'border-navy-600 bg-navy-50 text-navy-700' : 'border-slate-200 text-slate-500'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Additional criteria (optional)</label>
            <input className="input" value={form.additionalCriteria} onChange={(e) => set('additionalCriteria', e.target.value)} />
          </div>
        </section>

        <section className="card space-y-4 p-6">
          <h2 className="text-sm font-semibold text-slate-900">Compensation & dates</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Salary min (Rs./mo)</label>
              <input type="number" className="input" value={form.salaryMin} onChange={(e) => set('salaryMin', e.target.value)} />
            </div>
            <div>
              <label className="label">Salary max (Rs./mo)</label>
              <input type="number" className="input" value={form.salaryMax} onChange={(e) => set('salaryMax', e.target.value)} />
            </div>
            <div>
              <label className="label">Vacancies</label>
              <input type="number" className="input" value={form.vacancies} onChange={(e) => set('vacancies', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Pay scale / benefit text (used instead of min/max if set)</label>
            <input className="input" placeholder="e.g. Rs. 12,000 per year scholarship" value={form.payScaleText} onChange={(e) => set('payScaleText', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Application start date</label>
              <input type="date" className="input" value={form.applicationStartDate} onChange={(e) => set('applicationStartDate', e.target.value)} />
            </div>
            <div>
              <label className="label">Application last date</label>
              <input type="date" required className="input" value={form.applicationEndDate} onChange={(e) => set('applicationEndDate', e.target.value)} />
            </div>
          </div>
        </section>

        <section className="card space-y-4 p-6">
          <h2 className="text-sm font-semibold text-slate-900">Application details</h2>
          <div>
            <label className="label">Official link</label>
            <input type="url" required className="input" placeholder="https://" value={form.officialLink} onChange={(e) => set('officialLink', e.target.value)} />
          </div>
          <div>
            <label className="label">How to apply</label>
            <textarea rows={2} className="input" value={form.howToApply} onChange={(e) => set('howToApply', e.target.value)} />
          </div>
          <div>
            <label className="label">Documents required (comma separated)</label>
            <input className="input" value={form.documentsRequired} onChange={(e) => set('documentsRequired', e.target.value)} />
          </div>
          <div>
            <label className="label">Selection process</label>
            <input className="input" value={form.selectionProcess} onChange={(e) => set('selectionProcess', e.target.value)} />
          </div>
          <div>
            <label className="label">Tags (comma separated, for search)</label>
            <input className="input" value={form.tags} onChange={(e) => set('tags', e.target.value)} />
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/admin/opportunities')} className="btn-outline">Cancel</button>
          <button type="submit" disabled={saving} className="btn-accent">
            <Save size={16} /> {saving ? 'Saving...' : 'Save listing'}
          </button>
        </div>
      </form>
    </div>
  );
}
