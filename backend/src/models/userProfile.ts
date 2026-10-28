import { v4 as uuidv4 } from 'uuid';

export interface UserProfile {
  id: string;
  user_id: string;
  age: number;
  province: string;
  postal_code?: string;
  residency_status: 'canadian_citizen' | 'permanent_resident' | 'temporary_resident';
  income_range: 'low' | 'medium' | 'high';
  medical_conditions: string[];
  created_at: Date;
  updated_at: Date;
}

export interface Benefit {
  id: string;
  name: string;
  description: string;
  provider: string;
  application_url?: string;
  phone_number?: string;
  minimum_age?: number;
  maximum_age?: number;
  residency_requirement?: string;
  income_limit_low?: number;
  income_limit_high?: number;
  provinces: string[];
  created_at: Date;
  updated_at: Date;
}

export interface BenefitEligibilityRule {
  id: string;
  benefit_id: string;
  condition: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'in' | 'contains';
  value: string;
  weight: number;
}

export interface RecommendationResult {
  benefit_id: string;
  benefit_name: string;
  provider: string;
  match_score: number;
  eligibility_reasons: string[];
  application_url?: string;
  phone_number?: string;
}

// In-memory storage
const profiles = new Map<string, UserProfile>();

// Sample benefits database
const sampleBenefits: Benefit[] = [
  {
    id: uuidv4(),
    name: 'Old Age Security (OAS)',
    description: 'Monthly pension for seniors 65 and older',
    provider: 'Service Canada',
    application_url: 'https://www.canada.ca/oas',
    phone_number: '1-833-537-4542',
    minimum_age: 65,
    provinces: ['AB', 'BC', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'NT', 'YT', 'NU'],
    residency_requirement: 'canadian_citizen,permanent_resident',
    income_limit_high: 150000,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: uuidv4(),
    name: 'Guaranteed Income Supplement (GIS)',
    description: 'Additional monthly payment for low-income seniors',
    provider: 'Service Canada',
    application_url: 'https://www.canada.ca/gis',
    phone_number: '1-833-537-4542',
    minimum_age: 65,
    provinces: ['AB', 'BC', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'NT', 'YT', 'NU'],
    residency_requirement: 'canadian_citizen,permanent_resident',
    income_limit_high: 20000,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: uuidv4(),
    name: 'Canada Pension Plan (CPP)',
    description: 'Retirement pension based on contributions',
    provider: 'Service Canada',
    application_url: 'https://www.canada.ca/cpp',
    phone_number: '1-833-537-4542',
    minimum_age: 60,
    provinces: ['AB', 'BC', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'NT', 'YT', 'NU'],
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: uuidv4(),
    name: 'Registered Disability Savings Plan (RDSP)',
    description: 'Tax-assisted savings for persons with disabilities',
    provider: 'Government of Canada',
    phone_number: '1-800-567-6868',
    minimum_age: 0,
    provinces: ['AB', 'BC', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'NT', 'YT', 'NU'],
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: uuidv4(),
    name: 'Prescription Drug Coverage',
    description: 'Subsidized prescription drug coverage for seniors',
    provider: 'Ontario Health',
    phone_number: '1-888-910-1111',
    minimum_age: 65,
    provinces: ['ON'],
    income_limit_high: 50000,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: uuidv4(),
    name: 'Dental Care Program for Seniors',
    description: 'Dental care assistance for low-income seniors',
    provider: 'Health Canada',
    minimum_age: 65,
    provinces: ['AB', 'BC', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'NT', 'YT', 'NU'],
    income_limit_high: 35000,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: uuidv4(),
    name: 'Home Modification Grants',
    description: 'Financial assistance for home accessibility modifications',
    provider: 'Provincial Government',
    minimum_age: 55,
    provinces: ['AB', 'BC', 'ON', 'QC'],
    income_limit_high: 60000,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const profile = profiles.get(userId);
  return profile || null;
}

/**
 * Create new user profile
 */
export async function createUserProfile(data: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> {
  const profile: UserProfile = {
    id: uuidv4(),
    ...data,
    created_at: new Date(),
    updated_at: new Date(),
  };
  profiles.set(data.user_id, profile);
  return profile;
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
  const profile = profiles.get(userId);
  if (!profile) return null;
  
  const updated: UserProfile = {
    ...profile,
    ...data,
    updated_at: new Date(),
  };
  profiles.set(userId, updated);
  return updated;
}

/**
 * Get all benefits
 */
export async function getAllBenefits(): Promise<Benefit[]> {
  return sampleBenefits;
}

/**
 * Get benefits by province
 */
export async function getBenefitsByProvince(province: string): Promise<Benefit[]> {
  const normalized = (province || '').trim().toUpperCase();
  return sampleBenefits.filter((b) => b.provinces.some((p) => p.toUpperCase() === normalized));
}

/**
 * Get benefit by ID
 */
export async function getBenefitById(benefitId: string): Promise<Benefit | null> {
  return sampleBenefits.find((b) => b.id === benefitId) || null;
}

/**
 * Get eligibility rules for a benefit
 */
export async function getBenefitEligibilityRules(benefitId: string): Promise<BenefitEligibilityRule[]> {
  // Return empty array for in-memory implementation
  return [];
}
