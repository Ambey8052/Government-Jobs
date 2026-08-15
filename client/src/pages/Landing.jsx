import { Link } from 'react-router-dom';
import { BadgePercent, FileSearch2, GraduationCap, LandmarkIcon, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: GraduationCap,
    title: 'Tell us about yourself',
    text: 'Share your education, category, location and job preferences in a quick guided form.',
  },
  {
    icon: BadgePercent,
    title: 'Get a match score',
    text: 'Every job and scheme is scored against your profile — eligibility, education fit, location and more.',
  },
  {
    icon: FileSearch2,
    title: 'See what matters',
    text: 'Last date to apply, salary, vacancies, eligibility criteria and how to apply, in one place.',
  },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div>
      <section className="bg-gradient-to-b from-navy-900 to-navy-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="badge mb-4 bg-white/10 text-brand-300">
              <LandmarkIcon size={14} className="mr-1" /> Built for Indian Government Careers
            </span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Find the government job or scheme you actually qualify for
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-navy-100">
              SarkariSetu matches your education, category and preferences against Central &amp; State
              Government jobs, PSU vacancies, banking, railways, defence, schemes and scholarships —
              and shows you a clear match percentage for each.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to={user ? '/dashboard' : '/register'} className="btn-accent">
                <Sparkles size={16} /> {user ? 'Go to Dashboard' : 'Find my matches'}
              </Link>
              <Link to="/dashboard" className="btn bg-white/10 text-white hover:bg-white/20">
                Browse opportunities
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <f.icon size={20} />
              </div>
              <h3 className="font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-14 text-center sm:px-6">
          <ShieldCheck size={28} className="text-navy-700" />
          <h2 className="text-xl font-semibold text-slate-900">Curated, not scraped</h2>
          <p className="max-w-xl text-sm text-slate-500">
            Every listing on SarkariSetu is reviewed by our team before publishing, and links back to the
            official source so you can verify and apply with confidence.
          </p>
        </div>
      </section>
    </div>
  );
}
