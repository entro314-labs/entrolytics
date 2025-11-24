/**
 * Documentation Validation Script
 *
 * Validates code examples in documentation for:
 * - Correct environment variable names
 * - Proper API endpoints
 * - Consistent CLI commands
 * - No hardcoded values
 */

import { promises as fs } from 'fs'
import path from 'path'

interface ValidationError {
  file: string
  line: number
  issue: string
  codeBlock?: string
}

const VALIDATION_RULES = {
  // Environment variable patterns
  envVars: {
    correct: [
      'NEXT_PUBLIC_ENTROLYTICS_WEBSITE_ID',
      'NEXT_PUBLIC_ENTROLYTICS_HOST',
      'VITE_ENTROLYTICS_WEBSITE_ID',
      'VITE_ENTROLYTICS_HOST',
      'PUBLIC_ENTROLYTICS_WEBSITE_ID',
      'PUBLIC_ENTROLYTICS_HOST',
      'REACT_APP_ENTROLYTICS_WEBSITE_ID',
      'REACT_APP_ENTROLYTICS_HOST',
      'ENTROLYTICS_WEBSITE_ID',
      'ENTROLYTICS_HOST',
    ],
    incorrect: [
      'ENTROLYTICS_SITE_ID',
      'ENTRO_WEBSITE_ID',
      'WEBSITE_ID',
    ],
  },

  // API endpoints
  apiHosts: {
    correct: ['https://edge.entrolytics.click', 'http://localhost:3000'],
    incorrect: ['api.entrolytics.com', 'entrolytics.com/api'],
  },

  // CLI commands
  cliCommands: {
    correct: ['npx @entro314labs/entro-cli init', '@entro314labs/entro-cli'],
    incorrect: ['entro init', 'entrolytics init'],
  },

  // Placeholders that should be variables
  placeholders: ['website-id-here', 'your-website-id', 'INSERT_ID_HERE'],
}

async function findMdxFiles(dir: string, files: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      await findMdxFiles(fullPath, files)
    } else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
      files.push(fullPath)
    }
  }

  return files
}

function extractCodeBlocks(content: string): Array<{ code: string; line: number }> {
  const blocks: Array<{ code: string; line: number }> = []
  const lines = content.split('\n')
  let inCodeBlock = false
  let currentBlock: string[] = []
  let blockStartLine = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        blocks.push({
          code: currentBlock.join('\n'),
          line: blockStartLine,
        })
        currentBlock = []
        inCodeBlock = false
      } else {
        // Start of code block
        inCodeBlock = true
        blockStartLine = i + 1
      }
    } else if (inCodeBlock) {
      currentBlock.push(line)
    }
  }

  return blocks
}

async function validateFile(filePath: string): Promise<ValidationError[]> {
  const content = await fs.readFile(filePath, 'utf-8')
  const errors: ValidationError[] = []
  const relativePath = filePath.replace(process.cwd(), '')

  const codeBlocks = extractCodeBlocks(content)

  for (const block of codeBlocks) {
    const code = block.code

    // Check for incorrect env vars
    for (const incorrect of VALIDATION_RULES.envVars.incorrect) {
      if (code.includes(incorrect)) {
        errors.push({
          file: relativePath,
          line: block.line,
          issue: `Uses incorrect environment variable name: ${incorrect}`,
          codeBlock: code.substring(0, 100),
        })
      }
    }

    // Check for incorrect API hosts
    for (const incorrect of VALIDATION_RULES.apiHosts.incorrect) {
      if (code.includes(incorrect)) {
        errors.push({
          file: relativePath,
          line: block.line,
          issue: `Uses incorrect API host: ${incorrect}`,
          codeBlock: code.substring(0, 100),
        })
      }
    }

    // Check for incorrect CLI commands
    for (const incorrect of VALIDATION_RULES.cliCommands.incorrect) {
      if (code.includes(incorrect) && !code.includes('npx @entro314labs/entro-cli')) {
        errors.push({
          file: relativePath,
          line: block.line,
          issue: `Uses incorrect CLI command: ${incorrect}`,
          codeBlock: code.substring(0, 100),
        })
      }
    }

    // Check for placeholder values
    for (const placeholder of VALIDATION_RULES.placeholders) {
      if (code.includes(placeholder)) {
        errors.push({
          file: relativePath,
          line: block.line,
          issue: `Contains placeholder value: ${placeholder}`,
          codeBlock: code.substring(0, 100),
        })
      }
    }
  }

  return errors
}

async function validateDocumentation() {
  console.log('📚 Validating documentation...\n')

  const docsDir = path.join(process.cwd(), '..', 'entro-docs', 'content')

  try {
    const mdxFiles = await findMdxFiles(docsDir)
    console.log(`Found ${mdxFiles.length} documentation files\n`)

    const allErrors: ValidationError[] = []

    for (const file of mdxFiles) {
      const errors = await validateFile(file)
      allErrors.push(...errors)
    }

    if (allErrors.length === 0) {
      console.log('✅ All documentation validated successfully!')
      console.log(`Checked ${mdxFiles.length} files`)
      process.exit(0)
    } else {
      console.log(`❌ Found ${allErrors.length} issue(s) in documentation:\n`)

      // Group by file
      const byFile = new Map<string, ValidationError[]>()
      for (const error of allErrors) {
        if (!byFile.has(error.file)) {
          byFile.set(error.file, [])
        }
        byFile.get(error.file)!.push(error)
      }

      for (const [file, errors] of byFile) {
        console.log(`📄 ${file}`)
        for (const error of errors) {
          console.log(`   Line ${error.line}: ${error.issue}`)
          if (error.codeBlock) {
            console.log(`   Code: ${error.codeBlock}...`)
          }
        }
        console.log()
      }

      process.exit(1)
    }
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      console.log('⚠️  Documentation directory not found, skipping validation')
      process.exit(0)
    }
    throw error
  }
}

validateDocumentation().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
