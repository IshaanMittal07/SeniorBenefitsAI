import { AuthResponse, Benefit, NaturalLanguageResponse, RecommendationResponse, User, UserProfile } from '../../types';
import { CANADIAN_PROVINCES, provinceName } from '../../constants/profileOptions';
import { DEMO_BENEFITS } from './benefitsCatalog';
import { findMatchingBenefits, MatchableProfile } from './matching';
import { parseQuestion } from './questionParser';

/**
 * Demo mode runs the whole app in the browser, with no backend. Accounts and
 * profiles live in this browser's localStorage only. Enabled with
 * REACT_APP_DEMO_MODE=true (used for the hosted Vercel preview).
 */
export const DEMO_MODE = process.env.REACT_APP_DEMO_MODE === 'true';

const USERS_KEY = 'demo:users';
const PROFILES_KEY = 'demo:profiles';
const TOKEN_PREFIX = 'demo.';
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALL_PROVINCE_CODES = CANADIAN_PROVINCES.map((province) => province.code);
// A short pause so loading states behave as they would against a real server
const RESPONSE_DELAY_MS = 300;

interface DemoUser extends User {
  passwordHash: string;
}

type ProfileInput = Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

/**
 * Errors use the same shape as axios errors, so the UI handles both modes the same way
 */
export function demoError(
  status: number,
  error: string,
): Error & { response: { status: number; data: { error: string } } } {
  return Object.assign(new Error(error), { response: { status, data: { error } } });
}

const pause = () => new Promise((resolve) => setTimeout(resolve, RESPONSE_DELAY_MS));

function readStore<T>(key: string): Record<string, T> {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}') as Record<string, T>;
  } catch {
    return {};
  }
}

function writeStore<T>(key: string, value: Record<string, T>): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw demoError(500, 'Your browser blocked saving data. Please allow site storage and try again.');
  }
}

async function hashPassword(email: string, password: string): Promise<string> {
  const data = new TextEncoder().encode(`${email}:${password}`);
  // crypto.subtle is only available on secure origins (https or localhost)
  if (window.crypto?.subtle) {
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  return `plain:${password}`;
}

const publicUser = ({ passwordHash, ...user }: DemoUser): User => user;

function userFromToken(token: string | null): DemoUser {
  const userId = token?.startsWith(TOKEN_PREFIX) ? token.slice(TOKEN_PREFIX.length) : null;
  const user = userId ? Object.values(readStore<DemoUser>(USERS_KEY)).find((u) => u.id === userId) : undefined;
  if (!user) {
    throw demoError(401, 'Your session has expired. Please sign in again.');
  }
  return user;
}

function validateProfile(profile: Partial<ProfileInput>): void {
  if (!profile.age || !profile.province || !profile.residency_status || !profile.income_range) {
    throw demoError(400, 'Missing required fields');
  }
}

export async function signup(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
): Promise<AuthResponse> {
  await pause();
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password || !firstName.trim() || !lastName.trim()) {
    throw demoError(400, 'Missing required fields');
  }
  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    throw demoError(400, 'Please enter a valid email address');
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw demoError(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  const users = readStore<DemoUser>(USERS_KEY);
  if (users[normalizedEmail]) {
    throw demoError(409, 'An account with this email already exists');
  }

  const user: DemoUser = {
    id: window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    email: normalizedEmail,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    passwordHash: await hashPassword(normalizedEmail, password),
  };
  writeStore(USERS_KEY, { ...users, [normalizedEmail]: user });
  return { user: publicUser(user), token: TOKEN_PREFIX + user.id };
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  await pause();
  const normalizedEmail = email.trim().toLowerCase();
  const user = readStore<DemoUser>(USERS_KEY)[normalizedEmail];
  if (!user || user.passwordHash !== (await hashPassword(normalizedEmail, password))) {
    throw demoError(401, 'Incorrect email or password');
  }
  return { user: publicUser(user), token: TOKEN_PREFIX + user.id };
}

export async function getProfile(token: string | null): Promise<UserProfile> {
  await pause();
  const user = userFromToken(token);
  const profile = readStore<UserProfile>(PROFILES_KEY)[user.id];
  if (!profile) {
    throw demoError(404, 'Profile not found');
  }
  return profile;
}

export async function createProfile(token: string | null, data: ProfileInput): Promise<UserProfile> {
  await pause();
  const user = userFromToken(token);
  validateProfile(data);
  const now = new Date().toISOString();
  const profile: UserProfile = { ...data, id: user.id, user_id: user.id, created_at: now, updated_at: now };
  writeStore(PROFILES_KEY, { ...readStore<UserProfile>(PROFILES_KEY), [user.id]: profile });
  return profile;
}

export async function updateProfile(token: string | null, data: Partial<UserProfile>): Promise<UserProfile> {
  await pause();
  const user = userFromToken(token);
  const profiles = readStore<UserProfile>(PROFILES_KEY);
  const existing = profiles[user.id];
  if (!existing) {
    throw demoError(404, 'Profile not found');
  }
  const profile: UserProfile = {
    ...existing,
    ...data,
    id: existing.id,
    user_id: user.id,
    updated_at: new Date().toISOString(),
  };
  writeStore(PROFILES_KEY, { ...profiles, [user.id]: profile });
  return profile;
}

export async function getRecommendations(token: string | null): Promise<RecommendationResponse> {
  const profile = await getProfile(token);
  const recommendations = findMatchingBenefits(profile);
  return {
    profile_id: profile.id || profile.user_id || '',
    user_id: profile.user_id || '',
    recommendations,
    total_matches: recommendations.length,
    generated_at: new Date().toISOString(),
  };
}

export async function getBenefits(): Promise<Benefit[]> {
  await pause();
  return DEMO_BENEFITS.map((benefit) => ({
    id: benefit.id,
    name: benefit.name,
    description: benefit.description,
    provider: benefit.provider,
    application_url: benefit.application_url,
    phone_number: benefit.phone_number,
    minimum_age: benefit.minimum_age,
    maximum_age: benefit.maximum_age,
    provinces: benefit.provinces || ALL_PROVINCE_CODES,
  }));
}

const RESIDENCY_TEXT: Record<UserProfile['residency_status'], string> = {
  canadian_citizen: 'a Canadian citizen',
  permanent_resident: 'a permanent resident',
  temporary_resident: 'a temporary resident',
};

const INCOME_TEXT: Record<UserProfile['income_range'], string> = {
  low: 'an income under $30,000',
  medium: 'an income between $30,000 and $70,000',
  high: 'an income over $70,000',
};

/**
 * Answer a plain-language question. Details found in the question take priority;
 * anything missing comes from the saved profile (if signed in) or a stated assumption.
 */
export async function naturalLanguageQuery(token: string | null, query: string): Promise<NaturalLanguageResponse> {
  await pause();
  if (!query.trim()) {
    throw demoError(400, 'Query is required');
  }

  const parsed = parseQuestion(query);
  let saved: UserProfile | undefined;
  if (token) {
    try {
      saved = readStore<UserProfile>(PROFILES_KEY)[userFromToken(token).id];
    } catch {
      saved = undefined;
    }
  }

  const age = parsed.age ?? saved?.age;
  if (!age) {
    throw demoError(400, 'Please include your age (for example, “I’m 68”) so we can find programs for you.');
  }

  const assumptions: string[] = [];
  const province = parsed.province ?? saved?.province ?? '';
  if (!province)
    assumptions.push('we only included programs available across Canada because no province was mentioned');
  const residency = (parsed.residencyStatus as UserProfile['residency_status'] | null) ?? saved?.residency_status;
  if (!residency) assumptions.push('we assumed you are a Canadian citizen');
  const income = (parsed.incomeLevel as UserProfile['income_range'] | null) ?? saved?.income_range;
  if (!income) assumptions.push('we assumed a middle income ($30,000 to $70,000)');
  const conditions = parsed.medicalConditions?.length ? parsed.medicalConditions : saved?.medical_conditions || [];

  const profile: MatchableProfile = {
    age,
    province,
    residency_status: residency ?? 'canadian_citizen',
    income_range: income ?? 'medium',
    medical_conditions: conditions,
  };
  const matches = findMatchingBenefits(profile);

  const situation = [
    `age ${age}`,
    province ? `living in ${provinceName(province)}` : null,
    residency ? RESIDENCY_TEXT[residency] : null,
    income ? INCOME_TEXT[income] : null,
  ]
    .filter(Boolean)
    .join(', ');
  const assumptionText = assumptions.length ? ` To fill the gaps, ${assumptions.join(' and ')}.` : '';
  const explanation = matches.length
    ? `Based on what you told us (${situation}), ${matches.length} ${matches.length === 1 ? 'program' : 'programs'} may fit your situation.${assumptionText} This is a guide only: each program makes the final decision.`
    : `We couldn’t find programs for ${situation}.${assumptionText} Try adding your province and income to your question.`;

  return {
    query,
    parsed_profile: parsed,
    recommendations: {
      benefits: matches.map((match) => match.benefit_name),
      explanation,
      nextSteps: matches.length
        ? [
            'Open each program’s official page to check the full rules and how to apply.',
            'Have your ID, proof of age and your latest tax return or notice of assessment ready.',
            'For questions about federal pensions (OAS, GIS, CPP), call Service Canada at 1-800-277-9914.',
            'Ask a family member, caregiver or local seniors’ centre if you would like help applying.',
          ]
        : [],
    },
    generated_at: new Date().toISOString(),
  };
}
