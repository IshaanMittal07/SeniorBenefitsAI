import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRightIcon, CheckCircleIcon, ListIcon, ShieldIcon, SparkleIcon, UserIcon } from '../components/ui/Icons';

const STEPS = [
  {
    icon: UserIcon,
    title: 'Tell us about yourself',
    body: 'Answer a few simple questions about your age, where you live and your income. It takes about two minutes.',
  },
  {
    icon: ListIcon,
    title: 'See what you may qualify for',
    body: 'We match you with federal and provincial programs and explain, in plain language, why each one fits.',
  },
  {
    icon: CheckCircleIcon,
    title: 'Apply with confidence',
    body: 'Results include the official application page or phone line when available, so you know where to go next.',
  },
];

const PROGRAM_EXAMPLES = [
  'Old Age Security (OAS)',
  'Guaranteed Income Supplement (GIS)',
  'Canada Pension Plan (CPP)',
  'Canadian Dental Care Plan',
  'Provincial drug coverage',
  'Disability Tax Credit',
];

export const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const primaryCta = isAuthenticated
    ? { to: '/recommendations', label: 'See my benefits' }
    : { to: '/login?mode=signup', label: 'Get started — it’s free' };

  return (
    <>
      <section className="bg-gradient-to-b from-brand-800 to-brand-700 text-white">
        <div className="container-page grid gap-10 py-14 md:grid-cols-[1.2fr_1fr] md:items-center md:py-20">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-brand-50">
              <SparkleIcon size={18} />
              For seniors and caregivers across Canada
            </p>
            <h1 className="text-4xl leading-tight text-white sm:text-5xl">
              Find the benefits you’ve earned, without the paperwork maze.
            </h1>
            <p className="mt-5 max-w-xl text-xl text-brand-100">
              Answer a few questions and get a clear, personal list of government pensions, health coverage and
              support programs you may be eligible for.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to={primaryCta.to} className="btn bg-accent-400 px-7 text-lg text-brand-950 hover:bg-accent-100">
                {primaryCta.label}
                <ArrowRightIcon size={20} />
              </Link>
              <Link to="/query" className="btn border-2 border-white/50 px-7 text-lg text-white hover:bg-white/10">
                Ask a question
              </Link>
            </div>
          </div>

          <div className="card p-6 text-ink sm:p-8">
            <p className="eyebrow">Programs we check</p>
            <ul className="mt-4 space-y-3">
              {PROGRAM_EXAMPLES.map((program) => (
                <li key={program} className="flex items-center gap-3 text-lg">
                  <CheckCircleIcon size={22} className="shrink-0 text-emerald-600" />
                  {program}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-ink-muted">…and provincial programs in every province and territory.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="how-it-works" className="container-page py-16">
        <h2 id="how-it-works" className="text-center text-3xl">
          How it works
        </h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="card p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <step.icon size={26} />
                </span>
                <span className="text-sm font-bold text-ink-muted">Step {index + 1}</span>
              </div>
              <h3 className="mt-4 text-xl">{step.title}</h3>
              <p className="mt-2 text-ink-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-page">
        <div className="card flex flex-col gap-4 bg-brand-50 p-6 sm:flex-row sm:items-center sm:p-8">
          <ShieldIcon size={40} className="shrink-0 text-brand-700" />
          <div>
            <h2 className="text-xl">Your information stays private</h2>
            <p className="mt-1 text-ink-muted">
              We only ask for what’s needed to match you with programs. We never ask for your Social Insurance Number or
              banking details.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};
