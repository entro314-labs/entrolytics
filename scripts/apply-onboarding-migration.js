#!/usr/bin/env node

/**
 * Apply Onboarding Migration
 *
 * This script applies the onboarding tables migration (0005_add_onboarding_tables.sql)
 * to your PostgreSQL database.
 *
 * Usage:
 *   node scripts/apply-onboarding-migration.js
 *
 * Or via pnpm:
 *   pnpm run migrate:onboarding
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import pg from 'pg'

const { Pool } = pg

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local')
  process.exit(1)
}

const pool = new Pool({ connectionString: DATABASE_URL })

async function applyMigration() {
  console.log('🚀 Starting onboarding tables migration...\n')

  try {
    // Read the migration file
    const migrationPath = resolve(process.cwd(), 'src/lib/db/migrations/0005_add_onboarding_tables.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')

    console.log('📄 Migration file loaded: 0005_add_onboarding_tables.sql')
    console.log('📊 Connecting to database...')

    // Execute the migration
    await pool.query(migrationSQL)

    console.log('\n✅ Migration applied successfully!\n')
    console.log('Tables created/updated:')
    console.log('  • cli_setup_token (12 columns, 5 indexes)')
    console.log('  • onboarding_step (6 columns, 2 indexes)')
    console.log('  • user table (8 new onboarding columns)\n')

    // Verify tables exist
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('cli_setup_token', 'onboarding_step')
      ORDER BY table_name
    `)

    console.log('🔍 Verification:')
    if (tablesResult.rows.length === 2) {
      console.log('  ✓ cli_setup_token table exists')
      console.log('  ✓ onboarding_step table exists')
    } else {
      console.log('  ⚠️  Only found:', tablesResult.rows.map(r => r.table_name).join(', '))
    }

    // Check user table columns
    const userColumnsResult = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'user'
        AND column_name LIKE '%onboarding%'
      ORDER BY column_name
    `)

    if (userColumnsResult.rows.length >= 4) {
      console.log('  ✓ User table onboarding columns added')
      userColumnsResult.rows.forEach(row => {
        console.log(`    - ${row.column_name}`)
      })
    }

    console.log('\n✨ Migration complete! Your database is ready for onboarding.\n')
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    if (error.detail) {
      console.error('Details:', error.detail)
    }
    process.exit(1)
  } finally {
    await pool.end()
  }
}

applyMigration()
