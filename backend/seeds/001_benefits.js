const { v4: uuidv4 } = require('uuid');

exports.seed = async (knex) => {
  // Create sample benefits
  const benefits = [
    {
      id: uuidv4(),
      name: 'Old Age Security (OAS)',
      description:
        'Monthly pension available to Canadian seniors aged 65 and older. Amount depends on years of residence in Canada.',
      provider: 'Service Canada',
      application_url: 'https://www.canada.ca/en/services/benefits/publicpensions/cpp/old-age-security.html',
      phone_number: '1-877-464-6742',
      minimum_age: 65,
      residency_requirement: 'canadian_citizen,permanent_resident',
      provinces: [
        'AB',
        'BC',
        'SK',
        'MB',
        'ON',
        'QC',
        'NB',
        'NS',
        'PE',
        'NL',
        'NT',
        'YT',
        'NU',
      ],
    },
    {
      id: uuidv4(),
      name: 'Guaranteed Income Supplement (GIS)',
      description:
        'Additional monthly payment for low-income seniors who receive OAS. Non-taxable and varies based on income.',
      provider: 'Service Canada',
      application_url: 'https://www.canada.ca/en/services/benefits/publicpensions/cpp/guaranteed-income-supplement.html',
      phone_number: '1-877-464-6742',
      minimum_age: 65,
      income_limit_high: 21952,
      provinces: [
        'AB',
        'BC',
        'SK',
        'MB',
        'ON',
        'QC',
        'NB',
        'NS',
        'PE',
        'NL',
        'NT',
        'YT',
        'NU',
      ],
    },
    {
      id: uuidv4(),
      name: 'Canada Pension Plan (CPP)',
      description:
        'Retirement income based on contributions during working years. Available from age 60 (reduced) to 70 (enhanced).',
      provider: 'Service Canada',
      application_url: 'https://www.canada.ca/en/services/benefits/publicpensions/cpp/cpp-retirement.html',
      phone_number: '1-877-864-6742',
      minimum_age: 60,
      provinces: [
        'AB',
        'BC',
        'SK',
        'MB',
        'ON',
        'QC',
        'NB',
        'NS',
        'PE',
        'NL',
        'NT',
        'YT',
        'NU',
      ],
    },
    {
      id: uuidv4(),
      name: 'Ontario Disability Support Program (ODSP)',
      description:
        'Monthly financial and health benefits for Ontario residents with a substantial, persistent mental or physical impairment.',
      provider: 'Ontario Ministry of Children, Community and Social Services',
      application_url: 'https://www.ontario.ca/page/ontario-disability-support-program',
      phone_number: '1-800-263-6481',
      provinces: ['ON'],
    },
    {
      id: uuidv4(),
      name: 'Registered Retirement Savings Plan (RRSP) Withdrawal - Home Buyers Plan',
      description: 'Allows first-time home buyers to withdraw up to $35,000 from RRSP for home purchase.',
      provider: 'Canada Revenue Agency',
      application_url: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/rrsp-home-buyers-plan.html',
      maximum_age: 55,
      provinces: [
        'AB',
        'BC',
        'SK',
        'MB',
        'ON',
        'QC',
        'NB',
        'NS',
        'PE',
        'NL',
        'NT',
        'YT',
        'NU',
      ],
    },
    {
      id: uuidv4(),
      name: 'British Columbia Seniors Services',
      description: 'Comprehensive services including subsidized housing, health care, and transportation for BC seniors.',
      provider: 'BC Ministry of Health',
      application_url: 'https://www2.gov.bc.ca/gov/content/health/managing-your-health/health-conditions-and-treatments/seniors',
      minimum_age: 55,
      provinces: ['BC'],
    },
    {
      id: uuidv4(),
      name: 'Alberta Seniors Home Adaptation and Repair Program',
      description: 'Grants up to $10,000 to help low-income seniors adapt homes for accessibility.',
      provider: 'Alberta Seniors and Housing',
      application_url:
        'https://www.alberta.ca/seniors-home-adaptation-repair-program.aspx',
      minimum_age: 65,
      income_limit_high: 40000,
      provinces: ['AB'],
    },
    {
      id: uuidv4(),
      name: 'Quebec Senior Support Services',
      description: 'Provincial programs including home care, subsidized medications, and caregiver support.',
      provider: 'Quebec Ministry of Health and Social Services',
      application_url: 'https://www.quebec.ca/en/health/seniors/',
      minimum_age: 60,
      provinces: ['QC'],
    },
    {
      id: uuidv4(),
      name: 'Veterans Affairs Benefits',
      description:
        'Benefits for Canadian Armed Forces veterans including income support, health care, and long-term care.',
      provider: 'Veterans Affairs Canada',
      application_url: 'https://www.veterans.gc.ca/',
      minimum_age: 55,
      provinces: [
        'AB',
        'BC',
        'SK',
        'MB',
        'ON',
        'QC',
        'NB',
        'NS',
        'PE',
        'NL',
        'NT',
        'YT',
        'NU',
      ],
    },
    {
      id: uuidv4(),
      name: 'Pharmacare Program (BC)',
      description: 'Subsidized prescription drug costs for BC residents based on income.',
      provider: 'BC Ministry of Health',
      application_url:
        'https://www2.gov.bc.ca/gov/content/health/health-drug-coverage/pharmacare/about',
      provinces: ['BC'],
    },
  ];

  // Insert benefits
  await knex('benefits').del();
  await knex('benefits').insert(
    benefits.map((b) => ({
      ...b,
      created_at: new Date(),
      updated_at: new Date(),
    })),
  );

  // Create eligibility rules for OAS
  const oasId = benefits[0].id;
  const gisId = benefits[1].id;

  await knex('benefit_eligibility_rules').del();
  await knex('benefit_eligibility_rules').insert([
    { id: uuidv4(), benefit_id: oasId, condition: 'age', operator: 'greater_than', value: '64', weight: 50 },
    {
      id: uuidv4(),
      benefit_id: oasId,
      condition: 'residency_status',
      operator: 'in',
      value: 'canadian_citizen,permanent_resident',
      weight: 40,
    },
    {
      id: uuidv4(),
      benefit_id: gisId,
      condition: 'age',
      operator: 'greater_than',
      value: '64',
      weight: 50,
    },
    {
      id: uuidv4(),
      benefit_id: gisId,
      condition: 'income_range',
      operator: 'equals',
      value: 'low',
      weight: 60,
    },
  ]);

  console.log('Seed data inserted successfully');
};
