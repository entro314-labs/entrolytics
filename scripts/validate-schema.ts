/**
 * Database Schema Validation Script
 *
 * This script validates the database schema to ensure:
 * - No orphaned foreign keys
 * - Proper indexes exist
 * - Onboarding state consistency
 * - CLI token integrity
 */

import { db } from '../src/lib/db'
import { sql } from 'drizzle-orm'

interface ValidationResult {
  passed: boolean
  message: string
  details?: unknown[]
}

async function validateOrphanedCliTokens(): Promise<ValidationResult> {
  try {
    const result = await db.execute(sql`
      SELECT ct.token_id, ct.user_id, ct.website_id
      FROM cli_setup_token ct
      LEFT JOIN "user" u ON ct.user_id = u.user_id
      LEFT JOIN website w ON ct.website_id = w.website_id
      WHERE u.user_id IS NULL OR w.website_id IS NULL
    `)

    if (result.rows.length > 0) {
      return {
        passed: false,
        message: `Found ${result.rows.length} orphaned CLI tokens`,
        details: result.rows,
      }
    }

    return {
      passed: true,
      message: 'No orphaned CLI tokens found',
    }
  } catch (error) {
    return {
      passed: false,
      message: `Error checking CLI tokens: ${error}`,
    }
  }
}

async function validateOnboardingConsistency(): Promise<ValidationResult> {
  try {
    const result = await db.execute(sql`
      SELECT user_id, onboarding_completed, onboarding_step
      FROM "user"
      WHERE onboarding_completed = 'true'
        AND onboarding_step NOT IN ('complete', 'skipped')
    `)

    if (result.rows.length > 0) {
      return {
        passed: false,
        message: `Found ${result.rows.length} users with inconsistent onboarding state`,
        details: result.rows,
      }
    }

    return {
      passed: true,
      message: 'Onboarding state is consistent',
    }
  } catch (error) {
    return {
      passed: false,
      message: `Error checking onboarding state: ${error}`,
    }
  }
}

async function validateIndexes(): Promise<ValidationResult> {
  try {
    const result = await db.execute(sql`
      SELECT
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `)

    const requiredIndexes = [
      'cli_setup_token_token_idx',
      'cli_setup_token_user_id_idx',
      'cli_setup_token_status_idx',
      'cli_setup_token_expires_at_idx',
      'user_onboarding_completed_idx',
      'onboarding_step_user_id_idx',
    ]

    const existingIndexNames = result.rows.map((row: any) => row.indexname)
    const missingIndexes = requiredIndexes.filter(
      (idx) => !existingIndexNames.includes(idx)
    )

    if (missingIndexes.length > 0) {
      return {
        passed: false,
        message: `Missing ${missingIndexes.length} required indexes`,
        details: missingIndexes,
      }
    }

    return {
      passed: true,
      message: `All ${result.rows.length} indexes are present`,
    }
  } catch (error) {
    return {
      passed: false,
      message: `Error checking indexes: ${error}`,
    }
  }
}

async function validateExpiredTokens(): Promise<ValidationResult> {
  try {
    const result = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM cli_setup_token
      WHERE status = 'pending'
        AND expires_at < NOW()
    `)

    const count = Number(result.rows[0]?.count || 0)

    if (count > 0) {
      return {
        passed: false,
        message: `Found ${count} expired tokens that should be marked as expired`,
        details: [{ count, suggestion: 'Run cleanup script' }],
      }
    }

    return {
      passed: true,
      message: 'No expired pending tokens found',
    }
  } catch (error) {
    return {
      passed: false,
      message: `Error checking expired tokens: ${error}`,
    }
  }
}

async function validateForeignKeys(): Promise<ValidationResult> {
  try {
    const result = await db.execute(sql`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name
    `)

    return {
      passed: true,
      message: `Found ${result.rows.length} foreign key constraints`,
      details: result.rows,
    }
  } catch (error) {
    return {
      passed: false,
      message: `Error checking foreign keys: ${error}`,
    }
  }
}

async function runValidation() {
  console.log('🔍 Validating database schema...\n')

  const validations = [
    { name: 'Orphaned CLI Tokens', fn: validateOrphanedCliTokens },
    { name: 'Onboarding Consistency', fn: validateOnboardingConsistency },
    { name: 'Required Indexes', fn: validateIndexes },
    { name: 'Expired Tokens', fn: validateExpiredTokens },
    { name: 'Foreign Keys', fn: validateForeignKeys },
  ]

  let allPassed = true

  for (const validation of validations) {
    const result = await validation.fn()

    const icon = result.passed ? '✅' : '❌'
    console.log(`${icon} ${validation.name}: ${result.message}`)

    if (result.details && result.details.length > 0) {
      console.log('   Details:', JSON.stringify(result.details, null, 2))
    }

    if (!result.passed) {
      allPassed = false
    }

    console.log()
  }

  if (allPassed) {
    console.log('✅ All schema validations passed!')
    process.exit(0)
  } else {
    console.log('❌ Some schema validations failed. Please review the issues above.')
    process.exit(1)
  }
}

// Run validation
runValidation().catch((error) => {
  console.error('Fatal error during validation:', error)
  process.exit(1)
})
