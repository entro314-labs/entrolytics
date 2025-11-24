/**
 * CLI Token Cleanup Script
 *
 * Removes expired CLI tokens older than 24 hours
 * Run this via cron job in production
 */

import { CliTokenService } from '../src/lib/cli-tokens'

async function cleanup() {
  console.log('🧹 Starting CLI token cleanup...\n')

  try {
    const deletedCount = await CliTokenService.cleanupExpiredTokens()
    console.log(`✅ Cleaned up ${deletedCount} expired token(s)`)

    // Get current stats
    const stats = await CliTokenService.getTokenStats()
    console.log('\n📊 Current token statistics:')
    console.log(`  Active (pending): ${stats.totalActive}`)
    console.log(`  Used: ${stats.totalUsed}`)
    console.log(`  Expired: ${stats.totalExpired}`)
    console.log(`  Revoked: ${stats.totalRevoked}`)
    console.log()

    process.exit(0)
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    process.exit(1)
  }
}

cleanup()
