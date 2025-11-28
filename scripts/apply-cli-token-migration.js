/* eslint-disable no-console */
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import chalk from 'chalk';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  console.error(chalk.redBright('✗ DATABASE_URL is not defined.'));
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function applyCliTokenMigration() {
  try {
    // Read the migration file
    const migrationPath = join(
      __dirname,
      '..',
      'src',
      'lib',
      'db',
      'migrations',
      '0006_add_cli_access_token.sql',
    );

    const migrationSql = readFileSync(migrationPath, 'utf-8');

    console.log(chalk.blueBright('Applying CLI access token migration...'));

    // Split SQL into individual statements and execute them
    const statements = migrationSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await sql.query(statement);
    }

    console.log(chalk.greenBright('✓ CLI access token table created successfully.'));

    // Verify the table was created
    const result = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'cli_access_token'
    `;

    if (result.length > 0) {
      console.log(chalk.greenBright('✓ Verified: cli_access_token table exists.'));
    } else {
      console.log(chalk.yellowBright('⚠ Warning: Could not verify table creation.'));
    }
  } catch (e) {
    if (e.message && e.message.includes('already exists')) {
      console.log(chalk.yellowBright('⚠ Table already exists - skipping migration.'));
    } else {
      console.error(chalk.redBright('✗ Migration failed:'), e.message);
      throw e;
    }
  }
}

(async () => {
  try {
    await applyCliTokenMigration();
    process.exit(0);
  } catch (e) {
    process.exit(1);
  }
})();
