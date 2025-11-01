import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function initializeDrizzleMigrations() {
	try {
		console.log(
			"Initializing Drizzle migration state for existing database...",
		);

		// Create the Drizzle migrations table
		await sql`
      CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
        "id" SERIAL PRIMARY KEY,
        "hash" text NOT NULL,
        "created_at" bigint
      )
    `;

		console.log("✓ Created __drizzle_migrations table");

		// Mark the initial migration as applied
		const migrationHash =
			"f82063db35b7e8ac1e5e41b54b2a26eb4cd01b6dbc1e0ea0a6da7b5726d1c7d6";
		const timestamp = 1758155722812;

		await sql`
      INSERT INTO "__drizzle_migrations" ("hash", "created_at")
      VALUES (${migrationHash}, ${timestamp})
      ON CONFLICT DO NOTHING
    `;

		console.log("✓ Marked initial migration as applied");
		console.log("✓ Drizzle migration state initialized successfully!");
	} catch (error) {
		console.error("Error initializing Drizzle migration state:", error);
		process.exit(1);
	}
}

initializeDrizzleMigrations();
