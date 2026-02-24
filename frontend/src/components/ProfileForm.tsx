import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UserProfile } from '../types';

const CANADIAN_PROVINCES = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'ON', name: 'Ontario' },
  { code: 'QC', name: 'Quebec' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'YT', name: 'Yukon' },
  { code: 'NU', name: 'Nunavut' },
];

const MEDICAL_CONDITIONS = [
  'Diabetes',
  'Heart Disease',
  'Arthritis',
  'Hypertension',
  'Cancer',
  'Alzheimer\'s/Dementia',
  'COPD',
  'Stroke',
  'Kidney Disease',
  'Depression/Anxiety',
];

export const ProfileForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    age: 65,
    province: 'ON',
    residency_status: 'canadian_citizen',
    income_range: 'medium',
    medical_conditions: [],
    postal_code: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) : value,
    }));
  };

  const handleConditionToggle = (condition: string) => {
    setFormData((prev) => {
      const conditions = prev.medical_conditions || [];
      const updated = conditions.includes(condition)
        ? conditions.filter((c) => c !== condition)
        : [...conditions, condition];
      return { ...prev, medical_conditions: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.createProfile(formData as any);
      navigate('/recommendations');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Senior Benefits Profile</h1>
        <p className="text-gray-600 mb-8">
          Tell us about yourself to find the benefits you may be eligible for
        </p>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              min="50"
              max="120"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Province */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Province/Territory</label>
            <select
              name="province"
              value={formData.province}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {CANADIAN_PROVINCES.map((prov) => (
                <option key={prov.code} value={prov.code}>
                  {prov.name}
                </option>
              ))}
            </select>
          </div>

          {/* Postal Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code (optional)</label>
            <input
              type="text"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleInputChange}
              placeholder="e.g., M5V 3A8"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Residency Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Residency Status</label>
            <select
              name="residency_status"
              value={formData.residency_status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="canadian_citizen">Canadian Citizen</option>
              <option value="permanent_resident">Permanent Resident</option>
              <option value="temporary_resident">Temporary Resident</option>
            </select>
          </div>

          {/* Income Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Annual Income Range</label>
            <select
              name="income_range"
              value={formData.income_range}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low (Under $30,000)</option>
              <option value="medium">Medium ($30,000 - $70,000)</option>
              <option value="high">High (Over $70,000)</option>
            </select>
          </div>

          {/* Medical Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Medical Conditions (select all that apply)</label>
            <div className="grid grid-cols-2 gap-3">
              {MEDICAL_CONDITIONS.map((condition) => (
                <label key={condition} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.medical_conditions?.includes(condition) || false}
                    onChange={() => handleConditionToggle(condition)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{condition}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Creating Profile...' : 'Find My Benefits'}
          </button>
        </form>
      </div>
    </div>
  );
};
