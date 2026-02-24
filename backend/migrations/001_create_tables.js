exports.up = async (knex) => {
  // Create users table
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary();
    table.string('email').unique().notNullable();
    table.string('password').notNullable();
    table.string('first_name');
    table.string('last_name');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Create user_profiles table
  await knex.schema.createTable('user_profiles', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable().unique().references('id').inTable('users').onDelete('CASCADE');
    table.integer('age').notNullable();
    table.string('province', 2).notNullable();
    table.string('postal_code');
    table.enum('residency_status', ['canadian_citizen', 'permanent_resident', 'temporary_resident']).notNullable();
    table.enum('income_range', ['low', 'medium', 'high']).notNullable();
    table.specificType('medical_conditions', 'text[]').defaultTo('{}');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Create benefits table
  await knex.schema.createTable('benefits', (table) => {
    table.uuid('id').primary();
    table.string('name').notNullable();
    table.text('description');
    table.string('provider').notNullable();
    table.string('application_url');
    table.string('phone_number');
    table.integer('minimum_age');
    table.integer('maximum_age');
    table.string('residency_requirement');
    table.integer('income_limit_low');
    table.integer('income_limit_high');
    table.specificType('provinces', 'text[]').defaultTo('{}');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Create benefit_eligibility_rules table
  await knex.schema.createTable('benefit_eligibility_rules', (table) => {
    table.uuid('id').primary();
    table.uuid('benefit_id').notNullable().references('id').inTable('benefits').onDelete('CASCADE');
    table.string('condition').notNullable();
    table.enum('operator', ['equals', 'greater_than', 'less_than', 'in', 'contains']).notNullable();
    table.string('value').notNullable();
    table.integer('weight').defaultTo(10);
  });

  // Create user_benefit_history table
  await knex.schema.createTable('user_benefit_history', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('benefit_id').notNullable().references('id').inTable('benefits').onDelete('CASCADE');
    table.integer('match_score');
    table.string('recommendation_source');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  console.log('Migration 001_create_tables completed');
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('user_benefit_history');
  await knex.schema.dropTableIfExists('benefit_eligibility_rules');
  await knex.schema.dropTableIfExists('benefits');
  await knex.schema.dropTableIfExists('user_profiles');
  await knex.schema.dropTableIfExists('users');
};
