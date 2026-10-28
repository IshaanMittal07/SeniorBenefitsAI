import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UserProfile } from '../types';
import { CANADIAN_PROVINCES, INCOME_OPTIONS, MEDICAL_CONDITIONS, RESIDENCY_OPTIONS } from '../constants/profileOptions';
import { Alert } from './ui/Alert';
import { PageHeader } from './ui/PageHeader';
import { Spinner } from './ui/Spinner';
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
    <h2 className="text-xl">
      {title}
    </h2>
    {description && <p className="mt-1 text-ink-muted">{description}</p>}
    <div className="mt-5">{children}</div>
  </fieldset>
);

type ProfileFormState = {
  age: string;
  province: string;
  postal_code: string;
  residency_status: UserProfile['residency_status'];
  income_range: UserProfile['income_range'];
  medical_conditions: string[];
};

type FieldErrors = Partial<Record<'age' | 'postal_code', string>>;

const DEFAULT_FORM: ProfileFormState = {
  age: '65',
  province: 'ON',
  postal_code: '',
  residency_status: 'canadian_citizen',
  income_range: 'medium',
  medical_conditions: [],
};

const MIN_AGE = 50;
const MAX_AGE = 120;
// Canadian postal codes: letter-digit-letter, optional space or dash, digit-letter-digit
const POSTAL_CODE_PATTERN = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

const formatPostalCode = (value: string): string => {
  const compact = value.replace(/[\s-]/g, '').toUpperCase();
  return `${compact.slice(0, 3)} ${compact.slice(3)}`;
};

const validate = (form: ProfileFormState): FieldErrors => {
  const errors: FieldErrors = {};
  const age = Number(form.age);
  if (!form.age.trim() || !Number.isInteger(age) || age < MIN_AGE || age > MAX_AGE) {
    errors.age = `Please enter your age as a whole number between ${MIN_AGE} and ${MAX_AGE}.`;
  }
  const postalCode = form.postal_code.trim();
  if (postalCode && !POSTAL_CODE_PATTERN.test(postalCode)) {
    errors.postal_code = 'Please enter a Canadian postal code, like M5V 3A8, or leave it blank.';
  }
  return errors;
};

export const ProfileForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProfileFormState>(DEFAULT_FORM);
  const [hasProfile, setHasProfile] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Load the saved profile so returning users can review and edit it
  useEffect(() => {
    let active = true;
    api
      .getProfile()
      .then((profile) => {
        if (!active) return;
        setFormData({
          age: String(profile.age),
          province: profile.province,
          postal_code: profile.postal_code || '',
          residency_status: profile.residency_status,
          income_range: profile.income_range,
          medical_conditions: profile.medical_conditions || [],
        });
        setHasProfile(true);
      })
      .catch((err) => {
        // 404 just means this user hasn't created a profile yet
        if (active && err.response?.status !== 404) {
          setError('We couldn’t load your saved profile. You can still fill in the form below.');
        }
      })
      .finally(() => {
        if (active) setLoadingProfile(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name in fieldErrors) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const setField = <K extends keyof ProfileFormState>(field: K, value: ProfileFormState[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConditionToggle = (condition: string) => {
    setFormData((prev) => {
      const conditions = prev.medical_conditions;
      const updated = conditions.includes(condition)
        ? conditions.filter((c) => c !== condition)
        : [...conditions, condition];
      return { ...prev, medical_conditions: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const errors = validate(formData);
    setFieldErrors(errors);
    const firstInvalid = (Object.keys(errors) as Array<keyof FieldErrors>)[0];
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    const postalCode = formData.postal_code.trim();
    const profile = {
      age: Number(formData.age),
      province: formData.province,
      postal_code: postalCode ? formatPostalCode(postalCode) : undefined,
      residency_status: formData.residency_status,
      income_range: formData.income_range,
      medical_conditions: formData.medical_conditions,
    };

    setSaving(true);
    try {
      if (hasProfile) {
        await api.updateProfile(profile);
      } else {
        await api.createProfile(profile);
      }
      navigate('/recommendations');
    } catch (err: any) {
      setError(err.response?.data?.error || 'We couldn’t save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="container-page flex min-h-[50vh] items-center justify-center py-16">
        <Spinner label="Loading your profile…" />
      </div>
    );
  }

  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <PageHeader
        eyebrow="Your profile"
        title={hasProfile ? 'Review your profile' : 'Tell us about yourself'}
        description={
          hasProfile
            ? 'Keep your details up to date so your results stay accurate.'
            : 'Your answers help us find programs that fit your situation. Only age, province, residency and income are required.'
        }
      />

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
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
                min={MIN_AGE}
                max={MAX_AGE}
                required
                aria-invalid={!!fieldErrors.age}
                aria-describedby={fieldErrors.age ? 'age-error' : undefined}
                className="input"
              />
              {fieldErrors.age && (
                <p id="age-error" className="field-error">
                  {fieldErrors.age}
                </p>
              )}
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
                maxLength={7}
                aria-invalid={!!fieldErrors.postal_code}
                aria-describedby={fieldErrors.postal_code ? 'postal_code-error' : undefined}
                className="input uppercase placeholder:normal-case"
              />
              {fieldErrors.postal_code && (
                <p id="postal_code-error" className="field-error">
                  {fieldErrors.postal_code}
                </p>
              )}
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
                checked={formData.medical_conditions.includes(condition)}
                onChange={() => handleConditionToggle(condition)}
              />
            ))}
          </div>
        </Section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {hasProfile && (
            <button type="button" onClick={() => navigate('/recommendations')} className="btn-ghost">
              Cancel
            </button>
          )}
          <button type="submit" disabled={saving} className="btn-primary px-8 text-lg">
            {saving ? 'Saving your profile…' : hasProfile ? 'Save and see my benefits' : 'Find my benefits'}
          </button>
        </div>
      </form>
    </div>
  );
};
