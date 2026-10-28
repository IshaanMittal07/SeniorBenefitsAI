import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Recommendation, RecommendationResponse } from '../types';
import { Alert } from './ui/Alert';
import { PageHeader } from './ui/PageHeader';
import { Spinner } from './ui/Spinner';
import { CheckIcon, ExternalLinkIcon, PhoneIcon } from './ui/Icons';

const matchLevel = (score: number) => {
  if (score >= 80) return { label: 'Strong match', bar: 'bg-emerald-600', text: 'text-emerald-800', bg: 'bg-emerald-50' };
  if (score >= 55) return { label: 'Good match', bar: 'bg-brand-600', text: 'text-brand-800', bg: 'bg-brand-50' };
  return { label: 'Worth checking', bar: 'bg-amber-500', text: 'text-amber-900', bg: 'bg-amber-50' };
};

// North American numbers: add the country code when only 10 digits are given
const telHref = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return `tel:+${digits.length === 10 ? `1${digits}` : digits}`;
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
      <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-6 py-4 sm:flex-row sm:px-7 print:hidden">
        {rec.application_url && (
          <a href={rec.application_url} target="_blank" rel="noopener noreferrer" className="btn-primary">
            Learn more and apply
            <ExternalLinkIcon size={18} />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
        {rec.phone_number && (
          <a href={telHref(rec.phone_number)} className="btn-secondary">
            <PhoneIcon size={18} />
            Call {rec.phone_number}
          </a>
        )}
      </div>
    )}
  </article>
);

export const Recommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await api.getRecommendations();
        setRecommendations(data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'We couldn’t load your recommendations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="container-page flex min-h-[50vh] items-center justify-center py-16">
        <Spinner label="Finding your benefits…" />
      </div>
    );
  }

  const total = recommendations?.total_matches || 0;

  return (
    <div className="container-page max-w-4xl py-10 sm:py-14">
      <PageHeader
        eyebrow="Your results"
        title="Benefits you may qualify for"
        description={
          <>
            Based on your profile, we found{' '}
            <strong className="text-ink">
              {total} {total === 1 ? 'program' : 'programs'}
            </strong>{' '}
            worth looking into.
          </>
        }
        actions={
          <Link to="/profile" className="btn-secondary print:hidden">
            Edit my profile
          </Link>
        }
      />

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {recommendations && recommendations.recommendations.length > 0 ? (
        <div className="space-y-5">
          {recommendations.recommendations.map((rec) => (
            <BenefitCard key={rec.benefit_id} rec={rec} />
          ))}
        </div>
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
