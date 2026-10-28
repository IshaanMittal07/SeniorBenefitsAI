import { Recommendation, UserProfile } from '../../types';
import { provinceName } from '../../constants/profileOptions';
import { DEMO_BENEFITS, DemoBenefit } from './benefitsCatalog';

export type MatchableProfile = Pick<
  UserProfile,
  'age' | 'province' | 'residency_status' | 'income_range' | 'medical_conditions'
>;

// Same scoring model as the backend matcher: meeting every hard requirement gives
// BASE_SCORE, and each criterion that targets the user specifically adds points.
const BASE_SCORE = 60;
const CRITERION_POINTS = 10;

const RESIDENCY_LABELS: Record<UserProfile['residency_status'], string> = {
  canadian_citizen: 'Canadian citizens',
  permanent_resident: 'permanent residents',
  temporary_resident: 'temporary residents',
};

/**
 * Evaluate one benefit. Returns null when a hard requirement isn't met.
 */
export function evaluateBenefit(benefit: DemoBenefit, profile: MatchableProfile): Recommendation | null {
  const reasons: string[] = [];
  let score = BASE_SCORE;
  const province = profile.province.trim().toUpperCase();
  const conditions = profile.medical_conditions || [];

  if (benefit.minimum_age !== undefined && profile.age < benefit.minimum_age) return null;
  if (benefit.maximum_age !== undefined && profile.age > benefit.maximum_age) return null;
  // With no province known (e.g. a question that doesn't name one), keep programs offered in
  // most of Canada such as the CPP, and only drop those limited to a single province
  if (benefit.provinces && (province ? !benefit.provinces.includes(province) : benefit.provinces.length === 1)) {
    return null;
  }
  if (benefit.residency && !benefit.residency.includes(profile.residency_status)) return null;
  if (benefit.income_ranges && !benefit.income_ranges.includes(profile.income_range)) return null;
  if (benefit.requires_condition && conditions.length === 0) return null;

  if (benefit.minimum_age !== undefined || benefit.maximum_age !== undefined) {
    score += CRITERION_POINTS;
    if (benefit.minimum_age !== undefined && benefit.maximum_age !== undefined) {
      reasons.push(`You are in the eligible age range (${benefit.minimum_age} to ${benefit.maximum_age})`);
    } else if (benefit.minimum_age !== undefined) {
      reasons.push(`You meet the minimum age of ${benefit.minimum_age}`);
    } else {
      reasons.push(`You are under the maximum age of ${benefit.maximum_age}`);
    }
  }

  if (benefit.provinces && benefit.provinces.length === 1) {
    score += CRITERION_POINTS;
    reasons.push(`Available to residents of ${provinceName(province)}`);
  } else if (benefit.provinces) {
    reasons.push(province ? `Available in ${provinceName(province)}` : 'Available in most of Canada');
  } else {
    reasons.push('Available across Canada');
  }

  if (benefit.residency) {
    score += CRITERION_POINTS;
    reasons.push(`Open to ${RESIDENCY_LABELS[profile.residency_status]}`);
  }

  if (benefit.income_ranges) {
    score += CRITERION_POINTS;
    reasons.push(
      benefit.income_ranges.length === 1 && benefit.income_ranges[0] === 'low'
        ? 'Aimed at people with lower incomes, like yours'
        : 'Your income is within the program limit',
    );
  }

  if (benefit.health_related && conditions.length > 0) {
    score += CRITERION_POINTS;
    reasons.push(`May help with your health needs (${conditions.join(', ')})`);
  }

  return {
    benefit_id: benefit.id,
    benefit_name: benefit.name,
    provider: benefit.provider,
    description: benefit.description,
    match_score: Math.min(100, score),
    eligibility_reasons: reasons,
    application_url: benefit.application_url,
    phone_number: benefit.phone_number,
  };
}

/**
 * All benefits the profile is eligible for, best matches first
 */
export function findMatchingBenefits(profile: MatchableProfile): Recommendation[] {
  return DEMO_BENEFITS.map((benefit) => evaluateBenefit(benefit, profile))
    .filter((rec): rec is Recommendation => rec !== null)
    .sort((a, b) => b.match_score - a.match_score || a.benefit_name.localeCompare(b.benefit_name));
}
