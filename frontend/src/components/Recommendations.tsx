import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { RecommendationResponse } from '../types';

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
        setError(err.response?.data?.error || 'Failed to fetch recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Finding your benefits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Benefit Recommendations</h1>
          <p className="text-gray-600 mb-4">
            We found <span className="font-semibold text-green-600">{recommendations?.total_matches || 0}</span> benefits
            you may be eligible for
          </p>
        </div>

        {recommendations && recommendations.recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.recommendations.map((rec, index) => (
              <div key={rec.benefit_id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-white">{rec.benefit_name}</h2>
                      <p className="text-blue-100">{rec.provider}</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-full text-right">
                      <div className="text-2xl font-bold text-blue-600">{rec.match_score}%</div>
                      <div className="text-xs text-gray-600">Match Score</div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Why you qualify:</h3>
                  <ul className="space-y-1 mb-4">
                    {rec.eligibility_reasons.map((reason, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span className="text-gray-700">{reason}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                    {rec.application_url && (
                      <a
                        href={rec.application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors text-center"
                      >
                        Apply Online
                      </a>
                    )}
                    {rec.phone_number && (
                      <div className="flex-1 bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded text-center">
                        📞 {rec.phone_number}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600 text-lg">No benefits found matching your profile at this time.</p>
            <p className="text-gray-500 mt-2">Contact the benefit providers directly for more information.</p>
          </div>
        )}
      </div>
    </div>
  );
};
