import React, { useState } from 'react';
import api from '../services/api';

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
      setError(err.response?.data?.error || 'Failed to process query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Ask About Benefits</h1>
          <p className="text-gray-600 mb-8">
            Describe your situation naturally, and we'll help find relevant benefits
          </p>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="mb-8">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g., I'm a 72-year-old immigrant in Ontario with arthritis and low income. What benefits can I get?"
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
              required
            />

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Searching...' : 'Find Benefits'}
            </button>
          </form>

          {result && (
            <div className="space-y-4">
              {result.recommendations && (
                <>
                  <h2 className="text-2xl font-bold text-gray-800">Recommendations</h2>
                  <p className="text-gray-600">{result.recommendations.explanation}</p>

                  {result.recommendations.benefits && result.recommendations.benefits.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Recommended Benefits:</h3>
                      <ul className="space-y-2">
                        {result.recommendations.benefits.map((benefit: string, idx: number) => (
                          <li key={idx} className="flex items-start text-green-600">
                            <span className="mr-2">✓</span>
                            <span className="text-gray-700">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.recommendations.nextSteps && result.recommendations.nextSteps.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Next Steps:</h3>
                      <ol className="space-y-2 list-decimal list-inside">
                        {result.recommendations.nextSteps.map((step: string, idx: number) => (
                          <li key={idx} className="text-gray-700">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
