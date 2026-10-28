import { Benefit, BenefitEligibilityRule, RecommendationResult, UserProfile } from '../models/userProfile';
import { getBenefitEligibilityRules, getAllBenefits, getBenefitsByProvince } from '../models/userProfile';

const ALL_PROVINCES_COUNT = 13;

// Base score for meeting every hard requirement; extra points reflect how specifically a benefit fits
const BASE_SCORE = 60;
const CRITERION_POINTS = 10;
const HEALTH_POINTS = 10;
const MAX_RULE_PENALTY = 30;

// Keywords that mark a benefit as relevant to people with health conditions
const HEALTH_KEYWORDS = /disab|health|drug|prescription|pharma|medical|dental|accessib/i;

interface BenefitEvaluation {
  eligible: boolean;
  score: number;
  reasons: string[];
}

const RESIDENCY_LABELS: Record<string, string> = {
  canadian_citizen: 'Canadian citizens',
  permanent_resident: 'permanent residents',
  temporary_resident: 'temporary residents',
};

const isSet = (value: number | null | undefined): value is number => value !== null && value !== undefined;

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

  if (isSet(min) && income < min) return false;
  if (isSet(max) && income > max) return false;

  return true;
}

/**
 * Whether a benefit is aimed at health, disability or care needs
 */
function isHealthRelated(benefit: Benefit): boolean {
  return HEALTH_KEYWORDS.test(`${benefit.name} ${benefit.description}`);
}

/**
 * Match eligibility rule against user profile (string comparisons are case-insensitive)
 */
function matchRule(profile: UserProfile, rule: BenefitEligibilityRule): boolean {
  const ruleValue = rule.value.trim().toLowerCase();
  const ruleValues = ruleValue.split(',').map((v) => v.trim());
  const operator = rule.operator;

  if (rule.condition === 'age') {
    const targetAge = parseInt(ruleValue, 10);
    if (operator === 'greater_than') return profile.age > targetAge;
    if (operator === 'less_than') return profile.age < targetAge;
    if (operator === 'equals') return profile.age === targetAge;
  }

  if (rule.condition === 'province') {
    const province = profile.province.toLowerCase();
    if (operator === 'equals') return province === ruleValue;
    if (operator === 'in') return ruleValues.includes(province);
  }

  if (rule.condition === 'residency_status') {
    const status = profile.residency_status.toLowerCase();
    if (operator === 'equals') return status === ruleValue;
    if (operator === 'in') return ruleValues.includes(status);
  }

  if (rule.condition === 'income_range') {
    if (operator === 'equals') return profile.income_range.toLowerCase() === ruleValue;
  }

  if (rule.condition === 'medical_condition') {
    if (operator === 'contains') {
      return (profile.medical_conditions || []).some((c) => c.toLowerCase() === ruleValue);
    }
  }

  return false;
}

/**
 * Evaluate a benefit against a profile.
 *
 * Age, province, residency and income limits are hard requirements: failing any of
 * them makes the benefit ineligible. Eligible benefits start at BASE_SCORE and gain
 * points for each specific criterion the user meets, so a targeted program the user
 * clearly fits ranks above a general one. Eligibility rules lower the score when
 * they don't match.
 */
function evaluateBenefit(benefit: Benefit, profile: UserProfile, rules: BenefitEligibilityRule[]): BenefitEvaluation {
  const ineligible: BenefitEvaluation = { eligible: false, score: 0, reasons: [] };
  const reasons: string[] = [];
  let score = BASE_SCORE;

  // Age
  if (isSet(benefit.minimum_age) && profile.age < benefit.minimum_age) return ineligible;
  if (isSet(benefit.maximum_age) && profile.age > benefit.maximum_age) return ineligible;
  if (isSet(benefit.minimum_age) && benefit.minimum_age > 0) {
    score += CRITERION_POINTS;
    reasons.push(`Meets minimum age requirement (${benefit.minimum_age}+)`);
  }

  // Province
  const provinces = benefit.provinces || [];
  if (!provinces.includes(profile.province)) return ineligible;
  if (provinces.length < ALL_PROVINCES_COUNT) {
    score += CRITERION_POINTS;
    reasons.push(`Available to residents of ${profile.province}`);
  } else {
    reasons.push('Available across Canada');
  }

  // Residency
  if (benefit.residency_requirement) {
    if (!matchResidencyRequirement(profile.residency_status, benefit.residency_requirement)) return ineligible;
    score += CRITERION_POINTS;
    reasons.push(`Open to ${RESIDENCY_LABELS[profile.residency_status] || profile.residency_status}`);
  }

  // Income
  if (isSet(benefit.income_limit_low) || isSet(benefit.income_limit_high)) {
    if (!isIncomeInRange(profile.income_range, benefit.income_limit_low, benefit.income_limit_high)) {
      return ineligible;
    }
    score += CRITERION_POINTS;
    reasons.push('Your income is within the program limit');
  }

  // Health conditions only count for benefits that relate to health needs
  const conditions = profile.medical_conditions || [];
  if (conditions.length > 0 && isHealthRelated(benefit)) {
    score += HEALTH_POINTS;
    reasons.push(`May help with your health needs (${conditions.join(', ')})`);
  }

  // Rule-based matching
  if (rules && rules.length > 0) {
    const weightOf = (rule: BenefitEligibilityRule) => rule.weight || 10;
    const totalWeight = rules.reduce((sum, rule) => sum + weightOf(rule), 0);
    const matchedWeight = rules.filter((rule) => matchRule(profile, rule)).reduce((sum, rule) => sum + weightOf(rule), 0);
    score -= Math.round(MAX_RULE_PENALTY * (1 - matchedWeight / totalWeight));
  }

  return { eligible: true, score: Math.max(0, Math.min(100, score)), reasons };
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

    // Evaluate, keep eligible benefits, and rank by score
    const recommendations = benefits
      .map((benefit) => ({ benefit, evaluation: evaluateBenefit(benefit, profile, rulesMap.get(benefit.id) || []) }))
      .filter(({ evaluation }) => evaluation.eligible)
      .map(({ benefit, evaluation }) => ({
        benefit_id: benefit.id,
        benefit_name: benefit.name,
        provider: benefit.provider,
        match_score: evaluation.score,
        eligibility_reasons: evaluation.reasons,
        application_url: benefit.application_url,
        phone_number: benefit.phone_number,
      }))
      .sort((a, b) => b.match_score - a.match_score);

    return recommendations;
  } catch (error) {
    console.error('Error finding matching benefits:', error);
    throw error;
  }
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
  const evaluation = evaluateBenefit(benefit, profile, rules);

  return {
    benefit,
    eligibility_score: evaluation.score,
    is_eligible: evaluation.eligible,
    reasons: evaluation.reasons,
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
