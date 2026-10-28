import { ParsedQueryProfile, UserProfile } from '../../types';

/**
 * Rule-based stand-in for the LLM parser used by the backend. It pulls the
 * profile details we match on out of a plain-language question.
 */

const PROVINCE_NAMES: Array<[RegExp, string]> = [
  [/\balberta\b/i, 'AB'],
  [/\bbritish columbia\b/i, 'BC'],
  [/\bmanitoba\b/i, 'MB'],
  [/\bnew brunswick\b/i, 'NB'],
  [/\bnewfoundland\b|\blabrador\b/i, 'NL'],
  [/\bnorthwest territories\b/i, 'NT'],
  [/\bnova scotia\b/i, 'NS'],
  [/\bnunavut\b/i, 'NU'],
  [/\bontario\b/i, 'ON'],
  [/\bprince edward island\b|\bP\.?E\.?I\.?\b/i, 'PE'],
  [/\bqu[eé]bec\b/i, 'QC'],
  [/\bsaskatchewan\b/i, 'SK'],
  [/\byukon\b/i, 'YT'],
];

// Larger cities, so "I live in Calgary" works too
const CITY_PROVINCES: Array<[RegExp, string]> = [
  [/\b(calgary|edmonton|red deer|lethbridge)\b/i, 'AB'],
  [/\b(vancouver|victoria|surrey|burnaby|kelowna)\b/i, 'BC'],
  [/\b(winnipeg|brandon)\b/i, 'MB'],
  [/\b(fredericton|moncton|saint john)\b/i, 'NB'],
  [/\b(st\.? john'?s)\b/i, 'NL'],
  [/\b(yellowknife)\b/i, 'NT'],
  [/\b(halifax|dartmouth|sydney)\b/i, 'NS'],
  [/\b(iqaluit)\b/i, 'NU'],
  [/\b(toronto|ottawa|mississauga|hamilton|london|brampton|kitchener|windsor|sudbury|thunder bay)\b/i, 'ON'],
  [/\b(charlottetown)\b/i, 'PE'],
  [/\b(montr[eé]al|laval|gatineau|sherbrooke)\b/i, 'QC'],
  [/\b(regina|saskatoon)\b/i, 'SK'],
  [/\b(whitehorse)\b/i, 'YT'],
];

// Abbreviations are matched case-sensitively so the word "on" isn't read as Ontario
const PROVINCE_CODES = /\b(AB|BC|MB|NB|NL|NT|NS|NU|ON|PE|QC|SK|YT)\b/;

const CONDITION_PATTERNS: Array<[RegExp, string]> = [
  [/diabet/i, 'Diabetes'],
  [/heart (disease|condition|problem|failure|attack)|cardiac/i, 'Heart Disease'],
  [/arthritis/i, 'Arthritis'],
  [/hypertension|high blood pressure/i, 'Hypertension'],
  [/cancer/i, 'Cancer'],
  [/alzheimer|dementia|memory loss/i, "Alzheimer's/Dementia"],
  [/\bcopd\b|emphysema|chronic bronchitis/i, 'COPD'],
  [/\bstroke\b/i, 'Stroke'],
  [/kidney|dialysis|renal/i, 'Kidney Disease'],
  [/depress|anxiety/i, 'Depression/Anxiety'],
  [/vision|blind|eyesight|macular|glaucoma/i, 'Vision Loss'],
  [/hearing|\bdeaf/i, 'Hearing Loss'],
  [/mobility|wheelchair|walker|(can'?t|cannot|trouble|difficulty) walk/i, 'Mobility Limitations'],
];

const MIN_AGE = 40;
const MAX_AGE = 120;

function parseAge(text: string): number | null {
  const patterns = [
    /\b(\d{2,3})[\s-]*(?:years?|yrs?)[\s-]*old\b/i,
    /\b(\d{2,3})[\s-]*year[\s-]*old\b/i,
    /\b(?:i am|i'm|i’m|im|aged?|age of|turned|turning|(?:she|he) is|(?:she|he)'s|(?:she|he)’s)\s+(\d{2,3})\b/i,
    // Caregivers asking for someone else: "my mother is 80"
    /\b(?:mother|father|mom|mum|dad|husband|wife|spouse|partner|parent|grandmother|grandfather)(?:'s|’s| is)\s+(\d{2,3})\b/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const age = parseInt(match[1], 10);
      if (age >= MIN_AGE && age <= MAX_AGE) return age;
    }
  }
  return null;
}

function parseProvince(text: string): string | null {
  for (const [pattern, code] of [...PROVINCE_NAMES, ...CITY_PROVINCES]) {
    if (pattern.test(text)) return code;
  }
  return text.match(PROVINCE_CODES)?.[1] || null;
}

function parseResidency(text: string): UserProfile['residency_status'] | null {
  if (/temporary resident|visitor|work permit|study permit|super ?visa/i.test(text)) return 'temporary_resident';
  if (/permanent resident|\bPR\b|landed immigrant|immigrant|newcomer/i.test(text)) return 'permanent_resident';
  if (/citizen/i.test(text)) return 'canadian_citizen';
  return null;
}

function incomeRangeForAmount(yearly: number): UserProfile['income_range'] {
  if (yearly < 30000) return 'low';
  if (yearly <= 70000) return 'medium';
  return 'high';
}

function parseIncome(text: string): UserProfile['income_range'] | null {
  if (/high income|well[- ]off|wealthy|comfortable income/i.test(text)) return 'high';
  if (/middle income|moderate income|average income/i.test(text)) return 'medium';
  if (
    /low[- ]income|low income|fixed income|limited income|(can'?t|cannot) afford|struggl|only (?:my )?(?:pension|oas|cpp)/i.test(
      text,
    )
  ) {
    return 'low';
  }

  // Dollar amounts such as "$24,000 a year", "25k" or "$1,800 a month"
  const amount = text.match(
    /\$\s?(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)\s?(k)?\b(.{0,20})|\b(\d+(?:\.\d+)?)\s?k\b(.{0,20})/i,
  );
  if (amount) {
    const raw = amount[1] ?? amount[4];
    const thousands = !!(amount[2] || amount[4]);
    const context = amount[3] ?? amount[5] ?? '';
    let value = parseFloat(raw.replace(/,/g, '')) * (thousands ? 1000 : 1);
    if (/month/i.test(context)) value *= 12;
    if (value > 0) return incomeRangeForAmount(value);
  }
  return null;
}

function parseConditions(text: string): string[] {
  return CONDITION_PATTERNS.filter(([pattern]) => pattern.test(text)).map(([, condition]) => condition);
}

export function parseQuestion(text: string): ParsedQueryProfile {
  return {
    age: parseAge(text),
    province: parseProvince(text),
    residencyStatus: parseResidency(text),
    incomeLevel: parseIncome(text),
    medicalConditions: parseConditions(text),
  };
}
