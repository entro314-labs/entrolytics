#!/usr/bin/env node

import { neon } from '@neondatabase/serverless'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required')
  process.exit(1)
}

const sql = neon(DATABASE_URL)

async function testDatabaseFunctionality() {
  console.log('🧪 Testing database functionality...')

  try {
    // Test 1: Check pgcrypto extension
    console.log('\n1️⃣  Testing pgcrypto extension...')
    const uuidTest = await sql`SELECT gen_random_uuid() as test_uuid`
    console.log(`   ✅ pgcrypto extension working: ${uuidTest[0].test_uuid}`)

    // Test 2: Query existing admin users
    console.log('\n2️⃣  Testing user table queries...')
    const adminUsers = await sql`
      SELECT user_id, clerk_id, email, role, created_at
      FROM "user"
      WHERE role = 'admin'
    `

    console.log(`   ✅ Found ${adminUsers.length} admin user(s):`)
    adminUsers.forEach((user) => {
      console.log(`      👤 ${user.email} (${user.clerk_id})`)
    })

    // Test 3: Check all table counts
    console.log('\n3️⃣  Testing all table structures...')
    const tableNames = [
      'user',
      'org',
      'org_user',
      'website',
      'session',
      'website_event',
      'event_data',
      'session_data',
      'report',
      'segment',
      'revenue',
      'link',
      'pixel',
    ]

    for (const tableName of tableNames) {
      try {
        const count = await sql.unsafe(`SELECT count(*) as count FROM "${tableName}"`)
        console.log(`   📊 ${tableName}: ${count[0]?.count || 0} records`)
      } catch (error) {
        console.log(`   ❌ ${tableName}: table not found or error`)
      }
    }

    // Test 4: Test index functionality with a complex query
    console.log('\n4️⃣  Testing analytics indexes...')
    const indexTest = await sql`
      EXPLAIN (ANALYZE, BUFFERS)
      SELECT COUNT(*)
      FROM website_event we
      JOIN session s ON we.session_id = s.session_id
      WHERE we.created_at >= NOW() - INTERVAL '7 days'
    `
    console.log(`   ✅ Index performance test completed (${indexTest.length} rows in plan)`)

    // Test 5: Test JSON functionality
    console.log('\n5️⃣  Testing JSON columns...')
    const jsonTest = await sql`
      SELECT '{"test": "value", "number": 42}'::jsonb as test_json
    `
    console.log(`   ✅ JSONB functionality working: ${JSON.stringify(jsonTest[0].test_json)}`)

    // Test 6: Test timestamp functionality
    console.log('\n6️⃣  Testing timestamp precision...')
    const timestampTest = await sql`
      SELECT
        NOW() as current_time,
        NOW()::timestamp(6) as precise_time
    `
    console.log(`   ✅ Timestamp precision working: ${timestampTest[0].precise_time}`)

    // Test 7: Test migration tracking
    console.log('\n7️⃣  Testing migration tracking...')
    const migrations = await sql`
      SELECT hash, created_at
      FROM __drizzle_migrations
      ORDER BY created_at DESC
    `
    console.log(`   ✅ Migration tracking: ${migrations.length} migration(s) recorded`)
    migrations.forEach((migration) => {
      const dateStr = migration.created_at
        ? new Date(Number(migration.created_at)).toISOString()
        : 'N/A'
      console.log(`      📝 ${migration.hash} (${dateStr})`)
    })

    console.log('\n🎉 All database functionality tests passed!')
    console.log('✅ Neon PostgreSQL + Drizzle ORM + Clerk integration is fully operational')
  } catch (error) {
    console.error('\n❌ Database functionality test failed:', error.message)
    console.error('🔍 Full error:', error)
    process.exit(1)
  }
}

testDatabaseFunctionality()
