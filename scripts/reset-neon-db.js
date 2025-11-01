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

async function resetDatabase() {
	console.log("🔄 Starting Neon PostgreSQL database reset...");

	try {
		// Get list of all tables to drop
		console.log("📋 Getting list of existing tables...");
		const tables = await sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

		if (tables.length > 0) {
			console.log(
				`📊 Found ${tables.length} tables to drop:`,
				tables.map((t) => t.tablename).join(", "),
			);

			// Drop all tables with CASCADE to handle dependencies
			console.log("🗑️  Dropping all existing tables...");
			for (const table of tables) {
				await sql.unsafe(`DROP TABLE IF EXISTS "${table.tablename}" CASCADE`);
				console.log(`   ✅ Dropped table: ${table.tablename}`);
			}
		} else {
			console.log("📭 No existing tables found");
		}

		// Drop Drizzle migration table if it exists
		console.log("🗑️  Dropping Drizzle migration tracking...");
		await sql.unsafe(`DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE`);

		// Read and apply the comprehensive migration
		console.log("📖 Reading comprehensive migration file...");
		const migrationPath = path.join(
			__dirname,
			"../src/lib/db/migrations/0001_complete_schema_migration.sql",
		);
		const migrationSQL = fs.readFileSync(migrationPath, "utf8");

		// Split migration into individual statements (split by --> statement-breakpoint)
		console.log("⚡ Applying comprehensive migration...");
		const statements = migrationSQL
			.split("--> statement-breakpoint")
			.map((stmt) => stmt.trim())
			.filter((stmt) => stmt && !stmt.startsWith("--"));

		console.log(`📝 Executing ${statements.length} migration statements...`);

		for (let i = 0; i < statements.length; i++) {
			const statement = statements[i].trim();
			if (statement) {
				try {
					await sql.unsafe(statement);
					if (statement.toLowerCase().includes("create table")) {
						const tableName = statement.match(/create table\s+"?(\w+)"?/i)?.[1];
						console.log(`   ✅ Created table: ${tableName}`);
					} else if (statement.toLowerCase().includes("create index")) {
						const indexName = statement.match(
							/create.*?index\s+"?(\w+)"?/i,
						)?.[1];
						console.log(`   📊 Created index: ${indexName}`);
					} else if (statement.toLowerCase().includes("insert into")) {
						console.log(`   📝 Inserted system data`);
					}
				} catch (error) {
					if (error.message.includes("already exists")) {
						console.log(
							`   ⚠️  Skipped (already exists): ${statement.substring(0, 50)}...`,
						);
					} else {
						console.error(
							`   ❌ Error executing statement: ${statement.substring(0, 100)}...`,
						);
						throw error;
					}
				}
			}
		}

		// Verify tables were created
		console.log("🔍 Verifying migration results...");
		const newTables = await sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

		console.log(`✅ Successfully created ${newTables.length} tables:`);
		newTables.forEach((table) => {
			console.log(`   📋 ${table.tablename}`);
		});

		// Check if system user was created
		const systemUser = await sql`
      SELECT user_id, clerk_id, email, role
      FROM "user"
      WHERE role = 'admin'
      LIMIT 1
    `;

		if (systemUser.length > 0) {
			console.log(`👤 System admin user created: ${systemUser[0].email}`);
		}

		console.log("\n🎉 Database reset and migration completed successfully!");
		console.log(
			"💡 You can now connect to your fresh Neon database with the comprehensive schema",
		);
	} catch (error) {
		console.error("❌ Database reset failed:", error.message);
		console.error("🔍 Full error:", error);
		process.exit(1);
	}
}

// Run the reset
resetDatabase();
