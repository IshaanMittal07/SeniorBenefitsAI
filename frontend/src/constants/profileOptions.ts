import { UserProfile } from '../types';

export const CANADIAN_PROVINCES = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' },
];

export const RESIDENCY_OPTIONS: Array<{
  value: UserProfile['residency_status'];
  label: string;
  description: string;
}> = [
  { value: 'canadian_citizen', label: 'Canadian citizen', description: 'Born in Canada or naturalized' },
  { value: 'permanent_resident', label: 'Permanent resident', description: 'Holds a PR card' },
  { value: 'temporary_resident', label: 'Temporary resident', description: 'Visitor, work or study permit' },
];

export const INCOME_OPTIONS: Array<{
  value: UserProfile['income_range'];
  label: string;
  description: string;
}> = [
  { value: 'low', label: 'Under $30,000', description: 'Per year, before tax' },
  { value: 'medium', label: '$30,000 – $70,000', description: 'Per year, before tax' },
  { value: 'high', label: 'Over $70,000', description: 'Per year, before tax' },
];

export const MEDICAL_CONDITIONS = [
  'Diabetes',
  'Heart Disease',
  'Arthritis',
  'Hypertension',
  'Cancer',
  "Alzheimer's/Dementia",
  'COPD',
  'Stroke',
  'Kidney Disease',
  'Depression/Anxiety',
  'Vision Loss',
  'Hearing Loss',
  'Mobility Limitations',
];

export const provinceName = (code: string): string =>
  CANADIAN_PROVINCES.find((province) => province.code === code)?.name || code;
