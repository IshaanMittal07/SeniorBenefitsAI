import { UserProfile } from '../../types';

/**
 * A program in the demo catalogue. Eligibility is simplified to the profile
 * fields the app collects; the official page is always the final word.
 */
export interface DemoBenefit {
  id: string;
  name: string;
  provider: string;
  description: string;
  application_url: string;
  phone_number?: string;
  minimum_age?: number;
  maximum_age?: number;
  /** Province/territory codes; omitted means available everywhere */
  provinces?: string[];
  residency?: UserProfile['residency_status'][];
  /** Income ranges the program is open to; omitted means any income */
  income_ranges?: UserProfile['income_range'][];
  /** Relevant to people managing health conditions */
  health_related?: boolean;
  /** Only suggested when the user lists at least one health condition */
  requires_condition?: boolean;
}

const ALL_PROVINCES_EXCEPT_QC = ['AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'SK', 'YT'];
const CITIZEN_OR_PR: UserProfile['residency_status'][] = ['canadian_citizen', 'permanent_resident'];
const SERVICE_CANADA_PENSIONS = '1-800-277-9914';
const CRA_INDIVIDUALS = '1-800-959-8281';

export const DEMO_BENEFITS: DemoBenefit[] = [
  {
    id: 'oas',
    name: 'Old Age Security (OAS) pension',
    provider: 'Service Canada',
    description:
      'A monthly payment for people 65 and older who have lived in Canada for at least 10 years since turning 18. You don’t need to have worked to qualify.',
    application_url: 'https://www.canada.ca/en/services/benefits/publicpensions/old-age-security.html',
    phone_number: SERVICE_CANADA_PENSIONS,
    minimum_age: 65,
    residency: CITIZEN_OR_PR,
  },
  {
    id: 'gis',
    name: 'Guaranteed Income Supplement (GIS)',
    provider: 'Service Canada',
    description:
      'A tax-free monthly top-up for OAS recipients with a low income. It is paid on top of your OAS pension.',
    application_url:
      'https://www.canada.ca/en/services/benefits/publicpensions/old-age-security/guaranteed-income-supplement.html',
    phone_number: SERVICE_CANADA_PENSIONS,
    minimum_age: 65,
    residency: CITIZEN_OR_PR,
    income_ranges: ['low'],
  },
  {
    id: 'allowance',
    name: 'The Allowance',
    provider: 'Service Canada',
    description:
      'A monthly benefit for people aged 60 to 64 with a low income whose spouse or common-law partner receives OAS and the GIS.',
    application_url:
      'https://www.canada.ca/en/services/benefits/publicpensions/old-age-security/guaranteed-income-supplement/allowance.html',
    phone_number: SERVICE_CANADA_PENSIONS,
    minimum_age: 60,
    maximum_age: 64,
    residency: CITIZEN_OR_PR,
    income_ranges: ['low'],
  },
  {
    id: 'cpp',
    name: 'Canada Pension Plan (CPP) retirement pension',
    provider: 'Service Canada',
    description:
      'A monthly pension based on what you paid into the CPP while working. You can start it as early as 60, or wait for a larger payment.',
    application_url: 'https://www.canada.ca/en/services/benefits/publicpensions/cpp.html',
    phone_number: SERVICE_CANADA_PENSIONS,
    minimum_age: 60,
    provinces: ALL_PROVINCES_EXCEPT_QC,
  },
  {
    id: 'qpp',
    name: 'Québec Pension Plan (QPP) retirement pension',
    provider: 'Retraite Québec',
    description:
      'Québec’s equivalent of the CPP: a monthly pension based on what you contributed while working in Québec. It can start from age 60.',
    application_url: 'https://www.retraitequebec.gouv.qc.ca/en/',
    minimum_age: 60,
    provinces: ['QC'],
  },
  {
    id: 'cdcp',
    name: 'Canadian Dental Care Plan',
    provider: 'Government of Canada',
    description:
      'Helps pay for dental care for residents who don’t have access to dental insurance and have an adjusted family net income under $90,000.',
    application_url: 'https://www.canada.ca/en/services/benefits/dental/dental-care-plan.html',
    income_ranges: ['low', 'medium'],
    health_related: true,
  },
  {
    id: 'dtc',
    name: 'Disability Tax Credit (DTC)',
    provider: 'Canada Revenue Agency',
    description:
      'A tax credit that lowers the income tax paid by people with a severe and prolonged impairment, certified by a medical practitioner.',
    application_url:
      'https://www.canada.ca/en/revenue-agency/services/tax/individuals/segments/tax-credits-deductions-persons-disabilities/disability-tax-credit.html',
    phone_number: CRA_INDIVIDUALS,
    health_related: true,
    requires_condition: true,
  },
  {
    id: 'on-odb',
    name: 'Ontario Drug Benefit',
    provider: 'Government of Ontario',
    description:
      'Covers most of the cost of thousands of prescription drugs for Ontario residents 65 and older with OHIP coverage.',
    application_url: 'https://www.ontario.ca/page/get-coverage-prescription-drugs',
    minimum_age: 65,
    provinces: ['ON'],
    health_related: true,
  },
  {
    id: 'on-dental',
    name: 'Ontario Seniors Dental Care Program',
    provider: 'Government of Ontario',
    description:
      'Free routine dental care for low-income Ontario residents 65 and older who have no other dental benefits (apart from the Canadian Dental Care Plan).',
    application_url: 'https://www.ontario.ca/page/dental-care-low-income-seniors',
    minimum_age: 65,
    provinces: ['ON'],
    income_ranges: ['low'],
    health_related: true,
  },
  {
    id: 'on-gains',
    name: 'Guaranteed Annual Income System (GAINS)',
    provider: 'Government of Ontario',
    description:
      'Monthly payments for Ontario seniors 65 and older who receive OAS and the GIS. You are assessed automatically when you file your taxes.',
    application_url: 'https://www.ontario.ca/page/guaranteed-annual-income-system-payments-seniors',
    minimum_age: 65,
    provinces: ['ON'],
    residency: CITIZEN_OR_PR,
    income_ranges: ['low'],
  },
  {
    id: 'bc-pharmacare',
    name: 'BC Fair PharmaCare',
    provider: 'Government of British Columbia',
    description:
      'Helps BC residents pay for eligible prescription drugs and medical supplies. The lower your income, the more help you get.',
    application_url: 'https://www2.gov.bc.ca/gov/content/health/health-drug-coverage/pharmacare-for-bc-residents',
    provinces: ['BC'],
    health_related: true,
  },
  {
    id: 'ab-seniors-benefit',
    name: 'Alberta Seniors Benefit',
    provider: 'Government of Alberta',
    description:
      'Monthly financial help for low-income Albertans 65 and older who receive OAS and have lived in Alberta for at least 3 months.',
    application_url: 'https://www.alberta.ca/alberta-seniors-benefit',
    minimum_age: 65,
    provinces: ['AB'],
    residency: CITIZEN_OR_PR,
    income_ranges: ['low'],
  },
  {
    id: 'ab-sharp',
    name: 'Seniors Home Adaptation and Repair Program (SHARP)',
    provider: 'Government of Alberta',
    description:
      'Low-interest home equity loans of up to $40,000 for home repairs and adaptations, for senior homeowners with an income of $75,000 or less. Low-income seniors may get a grant for basic repairs instead.',
    application_url: 'https://www.alberta.ca/seniors-home-adaptation-repair-program',
    minimum_age: 65,
    provinces: ['AB'],
    residency: CITIZEN_OR_PR,
    income_ranges: ['low', 'medium'],
    health_related: true,
  },
  {
    id: 'sk-sip',
    name: 'Saskatchewan Seniors Income Plan',
    provider: 'Government of Saskatchewan',
    description:
      'A monthly top-up for Saskatchewan seniors 65 and older with a low income who receive OAS and the GIS. No application is needed.',
    application_url:
      'https://www.saskatchewan.ca/residents/family-and-social-support/seniors-services/seniors-income-plan',
    minimum_age: 65,
    provinces: ['SK'],
    income_ranges: ['low'],
  },
  {
    id: 'mb-55plus',
    name: 'Manitoba 55 PLUS',
    provider: 'Government of Manitoba',
    description:
      'Quarterly payments for lower-income Manitobans 55 and older. Seniors who already receive OAS don’t need to apply.',
    application_url: 'https://www.gov.mb.ca/fs/eia/55plus.html',
    minimum_age: 55,
    provinces: ['MB'],
    income_ranges: ['low'],
  },
];
