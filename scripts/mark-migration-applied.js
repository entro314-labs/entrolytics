#!/usr/bin/env node

import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	console.error("❌ DATABASE_URL environment variable is required");
	process.exit(1);
}

const sql = neon(DATABASE_URL);

async function markMigrationApplied() {
	console.log("📝 Marking Drizzle migration as applied...");

	try {
		// Create Drizzle migrations table if it doesn't exist
		await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `);

		// Get migration hash from meta file
		const journalPath = path.join(
			__dirname,
			"../src/lib/db/migrations/meta/_journal.json",
		);
		const journal = JSON.parse(fs.readFileSync(journalPath, "utf8"));

		const migration = journal.entries[0];
		console.log(`📋 Migration: ${migration.tag}`);
		console.log(`🕒 When: ${new Date(migration.when).toISOString()}`);

		// Check if migration is already marked as applied
		const existing = await sql.unsafe(
			`
      SELECT * FROM "__drizzle_migrations"
      WHERE hash = $1
    `,
			[migration.tag],
		);

		if (existing.length > 0) {
			console.log("✅ Migration already marked as applied");
		} else {
			// Mark migration as applied
			await sql.unsafe(
				`
        INSERT INTO "__drizzle_migrations" (hash, created_at)
        VALUES ($1, $2)
      `,
				[migration.tag, migration.when],
			);

			console.log("✅ Migration marked as applied in Drizzle tracking");
		}

		// Verify schema is correct
		console.log("🔍 Verifying schema...");
		const tables = await sql`
      SELECT tablename, schemaname
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

		console.log(`📊 Database contains ${tables.length} tables:`);
		tables.forEach((table) => {
			console.log(`   📋 ${table.tablename}`);
		});

		// Verify system user exists
		const users = await sql`
      SELECT user_id, clerk_id, email, role
      FROM "user"
      WHERE role = 'admin'
    `;

		if (users.length > 0) {
			console.log(`👤 Found ${users.length} admin user(s)`);
		}

		console.log("\n🎉 Migration tracking completed successfully!");
	} catch (error) {
		console.error("❌ Failed to mark migration as applied:", error.message);
		process.exit(1);
	}
}

markMigrationApplied();
