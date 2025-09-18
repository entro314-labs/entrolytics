#!/usr/bin/env node

/**
 * Entrolytics Admin Setup CLI
 *
 * Modern 2025 script for managing admin users with Clerk, Drizzle, and Neon PostgreSQL
 *
 * Usage:
 *   pnpm admin:promote <email>          - Promote user to admin by email
 *   pnpm admin:status                   - Show admin setup status
 *   pnpm admin:validate                 - Validate admin configuration
 *   pnpm admin:list                     - List all admin users
 */

import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq, sql } from 'drizzle-orm'
import { user } from '../src/lib/db/schema.js'

const db = drizzle(neon(process.env.DATABASE_URL))

const ROLES = {
  admin: 'admin',
  user: 'user',
  viewOnly: 'view-only',
}

// ANSI colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function colorize(text, color) {
  return `${colors[color] || ''}${text}${colors.reset}`
}

function printHeader() {
  console.log(colorize('\n🔐 Entrolytics Admin Setup CLI', 'cyan'))
  console.log(colorize('================================\n', 'cyan'))
}

function printUsage() {
  console.log(colorize('Usage:', 'bright'))
  console.log('  pnpm admin:promote <email>    - Promote user to admin by email')
  console.log('  pnpm admin:status             - Show admin setup status')
  console.log('  pnpm admin:validate           - Validate admin configuration')
  console.log('  pnpm admin:list               - List all admin users')
  console.log('  pnpm admin:help               - Show this help message')
}

async function getAdminSetupConfig() {
  return {
    initialAdminEmail: process.env.INITIAL_ADMIN_EMAIL?.toLowerCase(),
    autoPromoteFirstUser: process.env.AUTO_PROMOTE_FIRST_USER === 'true',
  }
}

async function hasAdminUsers() {
  try {
    const [result] = await db
      .select({ count: sql`count(*)` })
      .from(user)
      .where(eq(user.role, ROLES.admin))

    return result.count > 0
  } catch (error) {
    console.error(colorize('❌ Error checking for admin users:', 'red'), error.message)
    return false
  }
}

async function getTotalUserCount() {
  try {
    const [result] = await db
      .select({ count: sql`count(*)` })
      .from(user)

    return result.count
  } catch (error) {
    console.error(colorize('❌ Error getting total user count:', 'red'), error.message)
    return 0
  }
}

async function getUserByEmail(email) {
  try {
    const users = await db
      .select({
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        clerkId: user.clerkId,
        displayName: user.displayName,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.email, email.toLowerCase()))
      .limit(1)

    return users[0] || null
  } catch (error) {
    console.error(colorize('❌ Error finding user by email:', 'red'), error.message)
    return null
  }
}

async function promoteUserToAdmin(email) {
  try {
    const existingUser = await getUserByEmail(email)

    if (!existingUser) {
      console.log(colorize(`❌ User with email ${email} not found`, 'red'))
      console.log(colorize('💡 Make sure the user has signed up through Clerk first', 'yellow'))
      return false
    }

    if (existingUser.role === ROLES.admin) {
      console.log(colorize(`ℹ️  User ${email} is already an admin`, 'yellow'))
      return true
    }

    // Update user role to admin
    await db
      .update(user)
      .set({
        role: ROLES.admin,
        updatedAt: new Date()
      })
      .where(eq(user.userId, existingUser.userId))

    console.log(colorize(`✅ Successfully promoted ${email} to admin`, 'green'))
    console.log(`   User ID: ${existingUser.userId}`)
    console.log(`   Name: ${existingUser.displayName || 'N/A'}`)
    return true
  } catch (error) {
    console.error(colorize(`❌ Error promoting user ${email} to admin:`, 'red'), error.message)
    return false
  }
}

async function listAdminUsers() {
  try {
    const adminUsers = await db
      .select({
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        clerkId: user.clerkId,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.role, ROLES.admin))

    if (adminUsers.length === 0) {
      console.log(colorize('ℹ️  No admin users found', 'yellow'))
      return
    }

    console.log(colorize(`📋 Found ${adminUsers.length} admin user(s):`, 'green'))
    console.log('')

    adminUsers.forEach((admin, index) => {
      console.log(colorize(`${index + 1}. ${admin.displayName || 'Unnamed'}`, 'bright'))
      console.log(`   Email: ${admin.email}`)
      console.log(`   User ID: ${admin.userId}`)
      console.log(`   Clerk ID: ${admin.clerkId}`)
      console.log(`   Created: ${admin.createdAt?.toISOString() || 'Unknown'}`)
      console.log('')
    })
  } catch (error) {
    console.error(colorize('❌ Error listing admin users:', 'red'), error.message)
  }
}

async function showStatus() {
  try {
    const config = await getAdminSetupConfig()
    const [hasAdmins, totalUsers] = await Promise.all([
      hasAdminUsers(),
      getTotalUserCount(),
    ])

    console.log(colorize('📊 Admin Setup Status', 'bright'))
    console.log('━━━━━━━━━━━━━━━━━━━━━')

    console.log(`${colorize('Total Users:', 'blue')} ${totalUsers}`)
    console.log(`${colorize('Has Admin Users:', 'blue')} ${hasAdmins ? colorize('✅ Yes', 'green') : colorize('❌ No', 'red')}`)

    console.log('')
    console.log(colorize('Configuration:', 'bright'))
    console.log(`${colorize('INITIAL_ADMIN_EMAIL:', 'blue')} ${config.initialAdminEmail || colorize('Not set', 'yellow')}`)
    console.log(`${colorize('AUTO_PROMOTE_FIRST_USER:', 'blue')} ${config.autoPromoteFirstUser ? colorize('Enabled', 'green') : colorize('Disabled', 'yellow')}`)

    console.log('')

    if (!hasAdmins) {
      console.log(colorize('⚠️  Warning: No admin users exist!', 'yellow'))

      if (config.initialAdminEmail) {
        console.log(colorize(`💡 Users with email ${config.initialAdminEmail} will be auto-promoted to admin`, 'cyan'))
      }

      if (config.autoPromoteFirstUser) {
        console.log(colorize('💡 The first user to sign up will be auto-promoted to admin', 'cyan'))
      }

      if (!config.initialAdminEmail && !config.autoPromoteFirstUser) {
        console.log(colorize('💡 Set INITIAL_ADMIN_EMAIL or AUTO_PROMOTE_FIRST_USER to enable auto-promotion', 'cyan'))
      }
    } else {
      console.log(colorize('✅ Admin setup complete', 'green'))
    }
  } catch (error) {
    console.error(colorize('❌ Error getting status:', 'red'), error.message)
  }
}

function validateConfig() {
  const config = {
    initialAdminEmail: process.env.INITIAL_ADMIN_EMAIL?.toLowerCase(),
    autoPromoteFirstUser: process.env.AUTO_PROMOTE_FIRST_USER === 'true',
  }

  const errors = []

  console.log(colorize('🔍 Validating Admin Configuration', 'bright'))
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // Check database connection
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL environment variable is required')
  }

  // Validate email format
  if (config.initialAdminEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(config.initialAdminEmail)) {
      errors.push('INITIAL_ADMIN_EMAIL is not a valid email address')
    } else {
      console.log(colorize('✅ INITIAL_ADMIN_EMAIL format is valid', 'green'))
    }
  }

  // Check that at least one promotion method is configured
  if (!config.initialAdminEmail && !config.autoPromoteFirstUser) {
    errors.push('Either INITIAL_ADMIN_EMAIL or AUTO_PROMOTE_FIRST_USER should be configured')
  }

  if (config.autoPromoteFirstUser) {
    console.log(colorize('✅ AUTO_PROMOTE_FIRST_USER is enabled', 'green'))
  }

  console.log('')

  if (errors.length === 0) {
    console.log(colorize('✅ Configuration is valid', 'green'))
  } else {
    console.log(colorize('❌ Configuration errors found:', 'red'))
    errors.forEach(error => {
      console.log(colorize(`   • ${error}`, 'red'))
    })
  }

  return errors.length === 0
}

async function main() {
  const command = process.argv[2]
  const arg = process.argv[3]

  printHeader()

  if (!process.env.DATABASE_URL) {
    console.error(colorize('❌ DATABASE_URL environment variable is required', 'red'))
    process.exit(1)
  }

  try {
    switch (command) {
      case 'promote':
        if (!arg) {
          console.error(colorize('❌ Email address is required', 'red'))
          console.log(colorize('Usage: pnpm admin:promote <email>', 'yellow'))
          process.exit(1)
        }
        await promoteUserToAdmin(arg)
        break

      case 'status':
        await showStatus()
        break

      case 'validate':
        validateConfig()
        break

      case 'list':
        await listAdminUsers()
        break

      case 'help':
      case '--help':
      case '-h':
        printUsage()
        break

      default:
        console.error(colorize('❌ Unknown command:', 'red'), command || 'none')
        console.log('')
        printUsage()
        process.exit(1)
    }
  } catch (error) {
    console.error(colorize('❌ Unexpected error:', 'red'), error.message)
    process.exit(1)
  }
}

main().catch(console.error)