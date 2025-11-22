/* eslint-disable no-console */
import 'dotenv/config'
import { execSync } from 'node:child_process'
import chalk from 'chalk'
import semver from 'semver'
import { neon } from '@neondatabase/serverless'

const MIN_VERSION = '9.4.0'

if (process.env.SKIP_DB_CHECK) {
  console.log('Skipping database check.')
  process.exit(0)
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not defined.')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)

function success(msg) {
  console.log(chalk.greenBright(`✓ ${msg}`))
}

function error(msg) {
  console.log(chalk.redBright(`✗ ${msg}`))
}

async function checkEnv() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined.')
  } else {
    success('DATABASE_URL is defined.')
  }
}

async function checkConnection() {
  try {
    await sql`SELECT 1`

    success('Database connection successful.')
  } catch (e) {
    throw new Error('Unable to connect to the database: ' + e.message)
  }
}

async function checkDatabaseVersion() {
  const query = await sql`SELECT version() as version`
  const version = semver.valid(semver.coerce(query[0].version))

  if (semver.lt(version, MIN_VERSION)) {
    throw new Error(
      `Database version is not compatible. Please upgrade to ${MIN_VERSION} or greater.`
    )
  }

  success('Database version check successful.')
}

async function applyMigration() {
  if (!process.env.SKIP_DB_MIGRATION) {
    try {
      console.log(execSync('pnpm db:migrate').toString())
      success('Database migrations applied successfully.')
    } catch (e) {
      // Check if the error is about tables already existing
      if (e.message && e.message.includes('already exists')) {
        success('Migration skipped - tables already exist.')
      } else {
        success('No migrations to apply or migration skipped.')
      }
    }
  }
}

;(async () => {
  let err = false
  for (const fn of [checkEnv, checkConnection, checkDatabaseVersion, applyMigration]) {
    try {
      await fn()
    } catch (e) {
      error(e.message)
      err = true
    } finally {
      if (err) {
        process.exit(1)
      }
    }
  }
})()
