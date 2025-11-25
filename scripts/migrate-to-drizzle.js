#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple glob-like function for finding TypeScript files
function findTsFiles(dir) {
  const files = [];

  function walkDir(currentDir) {
    const entries = fs.readdirSync(currentDir);

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  }

  walkDir(dir);
  return files;
}

/**
 * Script to automatically migrate SQL query files from Prisma to Drizzle
 */

const QUERIES_DIR = path.join(__dirname, '../src/queries/sql');

// Transformation rules
const transformations = [
  // Import changes
  {
    pattern: /import prisma from '@\/lib\/db'/g,
    replacement: '',
  },
  {
    pattern: /import.*?PRISMA.*?from '@\/lib\/db'/g,
    replacement: match => match.replace('PRISMA', 'DRIZZLE'),
  },
  {
    pattern: /\[PRISMA\]/g,
    replacement: '[DRIZZLE]',
  },

  // Add analytics utils import when needed
  {
    pattern: /(import.*?from '@\/lib\/db')/,
    replacement: (match, importStatement, offset, string) => {
      // Check if file uses these utilities
      const needsUtilsImport =
        string.includes('parseFilters') ||
        string.includes('getTimestampDiffSQL') ||
        string.includes('getDateSQL') ||
        string.includes('rawQuery');

      if (needsUtilsImport && !string.includes('@/lib/analytics-utils')) {
        return `${importStatement}\nimport { getTimestampDiffSQL, getDateSQL, parseFilters, rawQuery } from '@/lib/analytics-utils'`;
      }
      return importStatement;
    },
  },

  // Remove prisma destructuring
  {
    pattern: /const\s*\{\s*([^}]*rawQuery[^}]*)\}\s*=\s*prisma/g,
    replacement: '// Using rawQuery from analytics-utils',
  },

  // SQL keyword capitalization for consistency
  {
    pattern: /\bselect\b/gi,
    replacement: 'SELECT',
  },
  {
    pattern: /\bfrom\b/gi,
    replacement: 'FROM',
  },
  {
    pattern: /\bwhere\b/gi,
    replacement: 'WHERE',
  },
  {
    pattern: /\band\b/gi,
    replacement: 'AND',
  },
  {
    pattern: /\bor\b/gi,
    replacement: 'OR',
  },
  {
    pattern: /\bgroup by\b/gi,
    replacement: 'GROUP BY',
  },
  {
    pattern: /\border by\b/gi,
    replacement: 'ORDER BY',
  },
  {
    pattern: /\bjoin\b/gi,
    replacement: 'JOIN',
  },
  {
    pattern: /\binner join\b/gi,
    replacement: 'INNER JOIN',
  },
  {
    pattern: /\bleft join\b/gi,
    replacement: 'LEFT JOIN',
  },
  {
    pattern: /\bright join\b/gi,
    replacement: 'RIGHT JOIN',
  },
  {
    pattern: /\bcount\b/gi,
    replacement: 'COUNT',
  },
  {
    pattern: /\bsum\b/gi,
    replacement: 'SUM',
  },
  {
    pattern: /\bmin\b/gi,
    replacement: 'MIN',
  },
  {
    pattern: /\bmax\b/gi,
    replacement: 'MAX',
  },
  {
    pattern: /\bavg\b/gi,
    replacement: 'AVG',
  },
  {
    pattern: /\bdistinct\b/gi,
    replacement: 'DISTINCT',
  },
  {
    pattern: /\bcase\b/gi,
    replacement: 'CASE',
  },
  {
    pattern: /\bwhen\b/gi,
    replacement: 'WHEN',
  },
  {
    pattern: /\bthen\b/gi,
    replacement: 'THEN',
  },
  {
    pattern: /\belse\b/gi,
    replacement: 'ELSE',
  },
  {
    pattern: /\bend\b/gi,
    replacement: 'END',
  },
];

function transformFile(filePath) {
  console.log(`Processing: ${filePath}`);

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Check if file needs migration (contains PRISMA references)
  if (!content.includes('PRISMA') && !content.includes('prisma from')) {
    console.log(`  Skipping (already migrated): ${filePath}`);
    return;
  }

  // Apply transformations
  transformations.forEach(({ pattern, replacement }) => {
    const originalContent = content;
    if (typeof replacement === 'function') {
      content = content.replace(pattern, replacement);
    } else {
      content = content.replace(pattern, replacement);
    }
    if (content !== originalContent) {
      modified = true;
    }
  });

  // Additional specific transformations based on file content
  if (
    content.includes('parseFilters') ||
    content.includes('getTimestampDiffSQL') ||
    content.includes('getDateSQL')
  ) {
    // Ensure the analytics utils import is present
    if (!content.includes('@/lib/analytics-utils')) {
      // Find the existing db import line and add the utils import after it
      content = content.replace(
        /(import.*?from '@\/lib\/db')/,
        "$1\nimport { getTimestampDiffSQL, getDateSQL, parseFilters, rawQuery } from '@/lib/analytics-utils'",
      );
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Updated: ${filePath}`);
  } else {
    console.log(`  ⏭️  No changes needed: ${filePath}`);
  }
}

function main() {
  console.log('🔄 Starting Prisma to Drizzle migration...');
  console.log(`📁 Searching in: ${QUERIES_DIR}`);

  // Find all TypeScript files in the queries/sql directory
  const files = findTsFiles(QUERIES_DIR);

  console.log(`📄 Found ${files.length} files to process`);

  files.forEach(transformFile);

  console.log('\n✅ Migration completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Review the changes with `git diff`');
  console.log('2. Test the application to ensure everything works');
  console.log('3. Run linting with `pnpm lint`');
  console.log('4. Commit the changes');
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { transformFile, transformations };
