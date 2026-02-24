import { Benefit, BenefitEligibilityRule, RecommendationResult, UserProfile } from '../models/userProfile';
import { getBenefitEligibilityRules, getAllBenefits, getBenefitsByProvince } from '../models/userProfile';

interface MatchingCriteria {
  profile: UserProfile;
  benefits: Benefit[];
  rules: Map<string, BenefitEligibilityRule[]>;
}

/**
 * Calculate eligibility score for a benefit based on user profile
 */
function calculateEligibilityScore(benefit: Benefit, profile: UserProfile, rules: BenefitEligibilityRule[]): number {
  let score = 0;
  let maxScore = 0;

  // Age check
  if (benefit.minimum_age !== null && benefit.minimum_age !== undefined) {
    maxScore += 20;
    if (profile.age >= benefit.minimum_age) {
      score += 20;
    }
  }
  if (benefit.maximum_age !== null && benefit.maximum_age !== undefined) {
    maxScore += 20;
    if (profile.age <= benefit.maximum_age) {
      score += 20;
    }
  }

  // Province check
  if (benefit.provinces && benefit.provinces.includes(profile.province)) {
    score += 30;
    maxScore += 30;
  } else {
    maxScore += 30;
  }

  // Residency status check
  if (benefit.residency_requirement) {
    maxScore += 10;
    if (matchResidencyRequirement(profile.residency_status, benefit.residency_requirement)) {
      score += 10;
    }
  }

  // Income check
  if (benefit.income_limit_low !== null && benefit.income_limit_low !== undefined) {
    maxScore += 15;
    if (isIncomeInRange(profile.income_range, benefit.income_limit_low, benefit.income_limit_high)) {
      score += 15;
    }
  }

  // Medical conditions check
  if (profile.medical_conditions && profile.medical_conditions.length > 0) {
    maxScore += 25;
    const conditionScore = profile.medical_conditions.length * 5;
    score += Math.min(conditionScore, 25);
  }

  // Rule-based matching
  if (rules && rules.length > 0) {
    maxScore += rules.length * 10;
    rules.forEach((rule) => {
      if (matchRule(profile, rule)) {
        score += rule.weight || 10;
      }
    });
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

/**
 * Check if residency status matches requirement
 */
function matchResidencyRequirement(status: string, requirement: string): boolean {
  const requirements = requirement.split(',').map((r) => r.trim().toLowerCase());
  return requirements.includes(status.toLowerCase());
}

/**
 * Check if income range falls within benefit limits
 */
function isIncomeInRange(range: string, min?: number, max?: number): boolean {
  // Simple income mapping - in production, use actual income amounts
  const incomeMap: Record<string, number> = {
    low: 20000,
    medium: 50000,
    high: 100000,
  };

  const income = incomeMap[range] || 0;

  if (min && income < min) return false;
  if (max && income > max) return false;

  return true;
}

/**
 * Match eligibility rule against user profile
 */
function matchRule(profile: UserProfile, rule: BenefitEligibilityRule): boolean {
  const ruleValue = rule.value.toLowerCase();
  const operator = rule.operator;

  if (rule.condition === 'age') {
    const targetAge = parseInt(ruleValue);
    if (operator === 'greater_than') return profile.age > targetAge;
    if (operator === 'less_than') return profile.age < targetAge;
    if (operator === 'equals') return profile.age === targetAge;
  }

  if (rule.condition === 'province') {
    if (operator === 'equals') return profile.province === ruleValue;
    if (operator === 'in') return ruleValue.split(',').includes(profile.province);
  }

  if (rule.condition === 'residency_status') {
    if (operator === 'equals') return profile.residency_status === ruleValue;
    if (operator === 'in') return ruleValue.split(',').includes(profile.residency_status);
  }

  if (rule.condition === 'income_range') {
    if (operator === 'equals') return profile.income_range === ruleValue;
  }

  if (rule.condition === 'medical_condition') {
    if (operator === 'contains') {
      return profile.medical_conditions && profile.medical_conditions.includes(ruleValue);
    }
  }

  return false;
}

/**
 * Find matching benefits for user profile
 */
export async function findMatchingBenefits(profile: UserProfile): Promise<RecommendationResult[]> {
  try {
    // Get benefits for user's province or all Canada-wide benefits
    const allBenefits = await getAllBenefits();
    const provincialBenefits = await getBenefitsByProvince(profile.province);
    const benefits = Array.from(new Map([...allBenefits, ...provincialBenefits].map((b) => [b.id, b])).values());

    // Get eligibility rules for each benefit
    const rulesMap = new Map<string, BenefitEligibilityRule[]>();
    for (const benefit of benefits) {
      const rules = await getBenefitEligibilityRules(benefit.id);
      rulesMap.set(benefit.id, rules);
    }

    // Calculate scores and filter
    const recommendations = benefits
      .map((benefit) => {
        const rules = rulesMap.get(benefit.id) || [];
        const score = calculateEligibilityScore(benefit, profile, rules);

        return {
          benefit_id: benefit.id,
          benefit_name: benefit.name,
          provider: benefit.provider,
          match_score: score,
          eligibility_reasons: generateEligibilityReasons(benefit, profile, score),
          application_url: benefit.application_url,
          phone_number: benefit.phone_number,
        };
      })
      .filter((r) => r.match_score >= 30) // Filter for at least 30% match
      .sort((a, b) => b.match_score - a.match_score);

    return recommendations;
  } catch (error) {
    console.error('Error finding matching benefits:', error);
    throw error;
  }
}

/**
 * Generate human-readable eligibility reasons
 */
function generateEligibilityReasons(benefit: Benefit, profile: UserProfile, score: number): string[] {
  const reasons: string[] = [];

  if (benefit.minimum_age && profile.age >= benefit.minimum_age) {
    reasons.push(`Meets minimum age requirement (${benefit.minimum_age}+)`);
  }

  if (benefit.provinces && benefit.provinces.includes(profile.province)) {
    reasons.push(`Available in ${profile.province}`);
  }

  if (profile.medical_conditions && profile.medical_conditions.length > 0) {
    reasons.push(`Applicable to conditions: ${profile.medical_conditions.join(', ')}`);
  }

  if (benefit.income_limit_low && isIncomeInRange(profile.income_range, benefit.income_limit_low, benefit.income_limit_high)) {
    reasons.push('Income level qualifies');
  }

  if (reasons.length === 0 && score > 0) {
    reasons.push('Meets eligibility criteria');
  }

  return reasons;
}

/**
 * Get detailed benefit information with eligibility reasons
 */
export async function getBenefitDetailsForProfile(benefitId: string, profile: UserProfile): Promise<any> {
  const { getBenefitById } = await import('../models/userProfile');
  const benefit = await getBenefitById(benefitId);

  if (!benefit) {
    throw new Error('Benefit not found');
  }

  const rules = await getBenefitEligibilityRules(benefitId);
  const score = calculateEligibilityScore(benefit, profile, rules);

  return {
    benefit,
    eligibility_score: score,
    is_eligible: score >= 50,
    reasons: generateEligibilityReasons(benefit, profile, score),
    next_steps: generateNextSteps(benefit),
  };
}

/**
 * Generate next steps for applying to a benefit
 */
function generateNextSteps(benefit: Benefit): string[] {
  const steps: string[] = [];

  if (benefit.application_url) {
    steps.push(`Visit ${benefit.application_url} to apply online`);
  }

  if (benefit.phone_number) {
    steps.push(`Call ${benefit.phone_number} for more information`);
  }

  steps.push('Gather required documentation (proof of age, residency, income)');
  steps.push('Submit application or contact provider');
  steps.push('Follow up on application status');

  return steps;
}
