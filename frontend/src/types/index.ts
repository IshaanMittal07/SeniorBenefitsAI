export interface UserProfile {
  id?: string;
  user_id?: string;
  age: number;
  province: string;
  postal_code?: string;
  residency_status: 'canadian_citizen' | 'permanent_resident' | 'temporary_resident';
  income_range: 'low' | 'medium' | 'high';
  medical_conditions: string[];
  created_at?: string;
  updated_at?: string;
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
  created_at?: string;
  updated_at?: string;
}

export interface Recommendation {
  benefit_id: string;
  benefit_name: string;
  provider: string;
  match_score: number;
  eligibility_reasons: string[];
  application_url?: string;
  phone_number?: string;
}

export interface RecommendationResponse {
  profile_id: string;
  user_id: string;
  recommendations: Recommendation[];
  total_matches: number;
  generated_at: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
