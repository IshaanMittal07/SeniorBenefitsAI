import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Recommendation, RecommendationResponse } from '../types';
import { Alert } from './ui/Alert';
import { PageHeader } from './ui/PageHeader';
import { Spinner } from './ui/Spinner';
import { CheckIcon, ExternalLinkIcon, InfoIcon, PhoneIcon, PrinterIcon, SearchIcon, UserIcon } from './ui/Icons';

const matchLevel = (score: number) => {
  if (score >= 80)
    return { label: 'Strong match', bar: 'bg-emerald-600', text: 'text-emerald-800', bg: 'bg-emerald-50' };
  if (score >= 55) return { label: 'Good match', bar: 'bg-brand-600', text: 'text-brand-800', bg: 'bg-brand-50' };
  return { label: 'Worth checking', bar: 'bg-amber-500', text: 'text-amber-900', bg: 'bg-amber-50' };
};

// North American numbers: add the country code when only 10 digits are given.
// Anything after "ext"/"x" is an extension and must not be dialled as part of the number.
const telHref = (phone: string) => {
  const [main, extension] = phone.split(/\s*(?:ext\.?|extension|x)\s*/i);
  const digits = main.replace(/\D/g, '');
  const number = digits.length === 10 ? `1${digits}` : digits;
  const extDigits = extension?.replace(/\D/g, '');
  return `tel:+${number}${extDigits ? `;ext=${extDigits}` : ''}`;
};

const MatchMeter: React.FC<{ score: number }> = ({ score }) => {
  const level = matchLevel(score);
  return (
    <div className={`w-full rounded-xl px-4 py-3 sm:w-48 ${level.bg}`}>
      <div className="flex items-baseline justify-between gap-2">
        <span className={`font-bold ${level.text}`}>{level.label}</span>
        <span className={`text-sm font-bold ${level.text}`}>{score}%</span>
      </div>
      <div
        className="mt-2 h-2.5 overflow-hidden rounded-full bg-white"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score}
        aria-label="Match score"
      >
        <div className={`h-full rounded-full ${level.bar}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
};

const BenefitCard: React.FC<{ rec: Recommendation }> = ({ rec }) => (
  <article className="card overflow-hidden transition-shadow hover:shadow-lift">
    <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-7">
      <div className="min-w-0">
        <p className="text-sm font-bold uppercase tracking-wide text-ink-muted">{rec.provider}</p>
        <h2 className="mt-1 text-2xl">{rec.benefit_name}</h2>
      </div>
      <MatchMeter score={rec.match_score} />
    </div>

    {rec.eligibility_reasons.length > 0 && (
      <div className="px-6 pb-6 sm:px-7">
        <h3 className="text-lg">Why this may fit you</h3>
        <ul className="mt-3 space-y-2">
          {rec.eligibility_reasons.map((reason, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckIcon size={22} strokeWidth={3} className="mt-0.5 shrink-0 text-emerald-600" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    )}

    {(rec.application_url || rec.phone_number) && (
      <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-6 py-4 sm:flex-row sm:px-7 print:border-0 print:bg-transparent print:py-2">
        {rec.application_url && (
          <a href={rec.application_url} target="_blank" rel="noopener noreferrer" className="btn-primary print:hidden">
            Learn more and apply
            <ExternalLinkIcon size={18} />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
        {rec.phone_number && (
          <a href={telHref(rec.phone_number)} className="btn-secondary print:hidden">
            <PhoneIcon size={18} />
            Call {rec.phone_number}
          </a>
        )}
        {/* Printed lists keep the contact details as plain text */}
        {rec.application_url && <p className="hidden break-all print:block">Website: {rec.application_url}</p>}
        {rec.phone_number && <p className="hidden print:block">Phone: {rec.phone_number}</p>}
      </div>
    )}
  </article>
);

export const Recommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [missingProfile, setMissingProfile] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await api.getRecommendations();
        setRecommendations(data);
      } catch (err: any) {
        // The API returns 404 when the user hasn't created a profile yet
        if (err.response?.status === 404) {
          setMissingProfile(true);
        } else {
          setError(err.response?.data?.error || 'We couldn’t load your recommendations. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const filtered = useMemo(() => {
    const items = recommendations?.recommendations || [];
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((rec) =>
      [rec.benefit_name, rec.provider, ...rec.eligibility_reasons].some((text) => text.toLowerCase().includes(term)),
    );
  }, [recommendations, search]);

  if (loading) {
    return (
      <div className="container-page flex min-h-[50vh] items-center justify-center py-16">
        <Spinner label="Finding your benefits…" />
      </div>
    );
  }

  if (missingProfile) {
    return (
      <div className="container-page max-w-2xl py-14 sm:py-20">
        <div className="card p-8 text-center sm:p-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <UserIcon size={30} />
          </span>
          <h1 className="mt-5 text-3xl">Let’s start with your profile</h1>
          <p className="mx-auto mt-3 max-w-md text-lg text-ink-muted">
            We need a few details, like your age and province, before we can find benefits for you. It takes about two
            minutes.
          </p>
          <Link to="/profile" className="btn-primary mt-7 px-8 text-lg">
            Create my profile
          </Link>
        </div>
      </div>
    );
  }

  const total = recommendations?.total_matches || 0;
  const hasResults = total > 0;

  return (
    <div className="container-page max-w-4xl py-10 sm:py-14">
      <PageHeader
        eyebrow="Your results"
        title="Benefits you may qualify for"
        description={
          recommendations ? (
            <>
              Based on your profile, we found{' '}
              <strong className="text-ink">
                {total} {total === 1 ? 'program' : 'programs'}
              </strong>{' '}
              worth looking into.
            </>
          ) : undefined
        }
        actions={
          <div className="flex flex-wrap gap-3 print:hidden">
            {hasResults && (
              <button type="button" onClick={() => window.print()} className="btn-ghost">
                <PrinterIcon size={20} />
                Print list
              </button>
            )}
            <Link to="/profile" className="btn-secondary">
              Edit my profile
            </Link>
          </div>
        }
      />

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {hasResults ? (
        <>
          <div className="mb-6 flex flex-col gap-4 print:hidden">
            <div className="relative">
              <label htmlFor="benefit-search" className="sr-only">
                Search your results
              </label>
              <SearchIcon
                size={22}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
              />
              <input
                id="benefit-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by program or provider, e.g. pension, dental"
                className="input pl-12"
              />
            </div>
            <details className="rounded-xl border-2 border-brand-100 bg-brand-50/60 px-4 py-3">
              <summary className="flex cursor-pointer items-center gap-2 font-bold text-brand-900">
                <InfoIcon size={20} />
                What does the match score mean?
              </summary>
              <p className="mt-2 text-ink-muted">
                Every program listed meets the age, location, residency and income rules we know about. The score shows
                how closely the program is aimed at someone in your situation: <strong>Strong match</strong> programs
                target people like you specifically, while <strong>Worth checking</strong> programs are broader. The
                provider makes the final decision, so always confirm before applying.
              </p>
            </details>
          </div>

          <p className="sr-only" aria-live="polite">
            {search.trim() ? `${filtered.length} of ${total} programs match your search` : ''}
          </p>

          {filtered.length > 0 ? (
            <div className="space-y-5">
              {filtered.map((rec) => (
                <BenefitCard key={rec.benefit_id} rec={rec} />
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-lg">No programs match “{search.trim()}”.</p>
              <button type="button" onClick={() => setSearch('')} className="btn-secondary mt-4">
                Clear search
              </button>
            </div>
          )}
        </>
      ) : (
        !error && (
          <div className="card p-8 text-center">
            <h2 className="text-2xl">No matches yet</h2>
            <p className="mx-auto mt-3 max-w-lg text-lg text-ink-muted">
              We didn’t find programs matching your profile right now. Try updating your details, or contact Service
              Canada for personal advice.
            </p>
            <Link to="/profile" className="btn-primary mt-6">
              Update my profile
            </Link>
          </div>
        )
      )}
    </div>
  );
};
