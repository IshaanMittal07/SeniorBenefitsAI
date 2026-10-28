import React, { useState } from 'react';
import api from '../services/api';
import { Alert } from './ui/Alert';
import { PageHeader } from './ui/PageHeader';
import { Spinner } from './ui/Spinner';
import { CheckIcon, SparkleIcon } from './ui/Icons';

const EXAMPLE_QUESTIONS = [
  'I’m 72, live in Ontario, and have arthritis and a low income. What can I get?',
  'I just turned 65 in British Columbia. Which pensions should I apply for?',
  'My mother is 80 in Alberta and needs help paying for prescriptions.',
];

const MAX_LENGTH = 500;

export const NaturalLanguageQuery: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.naturalLanguageQuery(query);
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'We couldn’t answer that question. Please try rewording it.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <PageHeader
        eyebrow="Ask a question"
        title="Describe your situation in your own words"
        description="Tell us your age, where you live and anything else that matters. We’ll suggest programs to look into."
      />

      <form onSubmit={handleSubmit} className="card p-6 sm:p-8">
        <label htmlFor="query" className="label text-lg">
          Your question
        </label>
        <textarea
          id="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          maxLength={MAX_LENGTH}
          rows={5}
          aria-describedby="query-count"
          placeholder="For example: I’m a 72-year-old permanent resident in Ontario with arthritis and a low income."
          className="input min-h-[9rem] resize-y leading-relaxed"
          required
        />
        <p id="query-count" className="hint text-right">
          {query.length} / {MAX_LENGTH} characters
        </p>

        <div className="mt-4">
          <p className="text-sm font-bold text-ink-muted">Or try an example:</p>
          <div className="mt-2 flex flex-col gap-2">
            {EXAMPLE_QUESTIONS.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setQuery(example)}
                className="rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-left hover:border-brand-300 hover:bg-brand-50"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading || !query.trim()} className="btn-primary mt-6 w-full text-lg">
          <SparkleIcon size={20} />
          {loading ? 'Looking for benefits…' : 'Find benefits'}
        </button>
      </form>

      <div aria-live="polite" className="mt-8 space-y-6">
        {error && <Alert variant="error">{error}</Alert>}

        {loading && <Spinner label="Reading your question…" />}

        {!loading && result?.recommendations && (
          <section className="card p-6 sm:p-8">
            <h2 className="text-2xl">Our suggestions</h2>
            {result.recommendations.explanation && (
              <p className="mt-3 text-lg text-ink-muted">{result.recommendations.explanation}</p>
            )}

            {result.recommendations.benefits?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg">Programs to look into</h3>
                <ul className="mt-3 space-y-2">
                  {result.recommendations.benefits.map((benefit: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 rounded-xl bg-emerald-50 px-4 py-3">
                      <CheckIcon size={22} strokeWidth={3} className="mt-0.5 shrink-0 text-emerald-600" />
                      <span className="font-bold">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.recommendations.nextSteps?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg">Next steps</h3>
                <ol className="mt-3 space-y-3">
                  {result.recommendations.nextSteps.map((step: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">
                        {idx + 1}
                      </span>
                      <span className="pt-1">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};
