import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UserProfile } from '../types';
import { CANADIAN_PROVINCES, INCOME_OPTIONS, MEDICAL_CONDITIONS, RESIDENCY_OPTIONS } from '../constants/profileOptions';
import { Alert } from './ui/Alert';
import { PageHeader } from './ui/PageHeader';
import { CheckIcon } from './ui/Icons';

interface ChoiceCardProps {
  name: string;
  value: string;
  checked: boolean;
  label: string;
  description?: string;
  type?: 'radio' | 'checkbox';
  onChange: () => void;
}

/**
 * Large, tappable radio/checkbox tile. The native input stays in the DOM for
 * keyboard and screen reader support.
 */
const ChoiceCard: React.FC<ChoiceCardProps> = ({ name, value, checked, label, description, type = 'radio', onChange }) => (
  <label
    className={`relative flex min-h-[3.5rem] cursor-pointer items-start gap-3 rounded-xl border-2 px-4 py-3 transition-colors focus-within:ring-4 focus-within:ring-accent-400 focus-within:ring-offset-2 ${
      checked ? 'border-brand-600 bg-brand-50' : 'border-slate-300 bg-white hover:border-slate-400'
    }`}
  >
    <input type={type} name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
    <span
      aria-hidden="true"
      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border-2 ${
        type === 'radio' ? 'rounded-full' : 'rounded-md'
      } ${checked ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-400 bg-white'}`}
    >
      {checked && <CheckIcon size={16} strokeWidth={3} />}
    </span>
    <span>
      <span className="block font-bold">{label}</span>
      {description && <span className="block text-sm text-ink-muted">{description}</span>}
    </span>
  </label>
);

const Section: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({
  title,
  description,
  children,
}) => (
  <fieldset className="card p-6 sm:p-8">
    <legend className="sr-only">{title}</legend>
    <h2 aria-hidden="true" className="text-xl">
      {title}
    </h2>
    {description && <p className="mt-1 text-ink-muted">{description}</p>}
    <div className="mt-5">{children}</div>
  </fieldset>
);

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

  const setField = <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      setError(err.response?.data?.error || 'We couldn’t save your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <PageHeader
        eyebrow="Your profile"
        title="Tell us about yourself"
        description="Your answers help us find programs that fit your situation. Only age, province, residency and income are required."
      />

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="About you">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="age" className="label">
                Age
              </label>
              <input
                id="age"
                type="number"
                name="age"
                inputMode="numeric"
                value={formData.age}
                onChange={handleInputChange}
                min="50"
                max="120"
                required
                className="input"
              />
            </div>
          </div>
        </Section>

        <Section title="Where you live" description="Many programs are run by your province or territory.">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="province" className="label">
                Province or territory
              </label>
              <select
                id="province"
                name="province"
                value={formData.province}
                onChange={handleInputChange}
                className="input"
              >
                {CANADIAN_PROVINCES.map((prov) => (
                  <option key={prov.code} value={prov.code}>
                    {prov.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="postal_code" className="label">
                Postal code <span className="font-normal text-ink-muted">(optional)</span>
              </label>
              <input
                id="postal_code"
                type="text"
                name="postal_code"
                autoComplete="postal-code"
                value={formData.postal_code}
                onChange={handleInputChange}
                placeholder="e.g. M5V 3A8"
                className="input uppercase placeholder:normal-case"
              />
            </div>
          </div>
        </Section>

        <Section title="Residency status">
          <div className="grid gap-3 sm:grid-cols-3">
            {RESIDENCY_OPTIONS.map((option) => (
              <ChoiceCard
                key={option.value}
                name="residency_status"
                value={option.value}
                label={option.label}
                description={option.description}
                checked={formData.residency_status === option.value}
                onChange={() => setField('residency_status', option.value)}
              />
            ))}
          </div>
        </Section>

        <Section title="Household income" description="An estimate is fine. Many benefits depend on income.">
          <div className="grid gap-3 sm:grid-cols-3">
            {INCOME_OPTIONS.map((option) => (
              <ChoiceCard
                key={option.value}
                name="income_range"
                value={option.value}
                label={option.label}
                description={option.description}
                checked={formData.income_range === option.value}
                onChange={() => setField('income_range', option.value)}
              />
            ))}
          </div>
        </Section>

        <Section
          title="Health conditions"
          description="Optional. Select any that apply — some programs help with specific health needs."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {MEDICAL_CONDITIONS.map((condition) => (
              <ChoiceCard
                key={condition}
                type="checkbox"
                name="medical_conditions"
                value={condition}
                label={condition}
                checked={formData.medical_conditions?.includes(condition) || false}
                onChange={() => handleConditionToggle(condition)}
              />
            ))}
          </div>
        </Section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="submit" disabled={loading} className="btn-primary px-8 text-lg">
            {loading ? 'Saving your profile…' : 'Find my benefits'}
          </button>
        </div>
      </form>
    </div>
  );
};
