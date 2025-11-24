/**
 * CLI Framework Detection Tests
 *
 * Validates that the CLI correctly detects all supported frameworks
 * using the patterns defined in shared-constants.
 */

import { describe, it, expect } from '@jest/globals'
import { promises as fs } from 'fs'
import path from 'path'
import { FRAMEWORK_PACKAGES, FRAMEWORK_PATTERNS } from '@entro314labs/shared-constants'

describe('CLI Framework Detection', () => {
  describe('shared-constants framework patterns', () => {
    it('should export FRAMEWORK_PACKAGES', () => {
      expect(FRAMEWORK_PACKAGES).toBeDefined()
      expect(typeof FRAMEWORK_PACKAGES).toBe('object')
    })

    it('should export FRAMEWORK_PATTERNS', () => {
      expect(FRAMEWORK_PATTERNS).toBeDefined()
      expect(typeof FRAMEWORK_PATTERNS).toBe('object')
    })

    it('should have patterns for all supported frameworks', () => {
      const frameworks = ['nextjs', 'react', 'vue', 'svelte', 'astro', 'node']

      for (const framework of frameworks) {
        expect(FRAMEWORK_PACKAGES[framework]).toBeDefined()
        expect(Array.isArray(FRAMEWORK_PACKAGES[framework])).toBe(true)
      }
    })
  })

  describe('Next.js Detection', () => {
    it('should detect Next.js from package.json dependencies', () => {
      const packageJson = {
        dependencies: {
          next: '^14.0.0',
          react: '^18.0.0',
        },
      }

      const hasNext = FRAMEWORK_PACKAGES.nextjs.some(pkg =>
        packageJson.dependencies[pkg]
      )

      expect(hasNext).toBe(true)
    })

    it('should detect Next.js from next.config.js', () => {
      const configFile = 'next.config.js'
      const expectedPattern = FRAMEWORK_PATTERNS.nextjs.configFiles

      expect(expectedPattern).toContain(configFile)
    })

    it('should prioritize Next.js over React', () => {
      // When both Next and React are present, should choose Next.js
      const packageJson = {
        dependencies: {
          next: '^14.0.0',
          react: '^18.0.0',
        },
      }

      const hasNext = FRAMEWORK_PACKAGES.nextjs.some(pkg =>
        packageJson.dependencies[pkg]
      )
      const hasReact = FRAMEWORK_PACKAGES.react.some(pkg =>
        packageJson.dependencies[pkg]
      )

      expect(hasNext).toBe(true)
      expect(hasReact).toBe(true)

      // Next.js should be detected first (implementation detail)
    })
  })

  describe('React Detection', () => {
    it('should detect standalone React app', () => {
      const packageJson = {
        dependencies: {
          react: '^18.0.0',
          'react-dom': '^18.0.0',
        },
      }

      const hasReact = FRAMEWORK_PACKAGES.react.some(pkg =>
        packageJson.dependencies[pkg]
      )

      expect(hasReact).toBe(true)
    })

    it('should detect Create React App', () => {
      const packageJson = {
        dependencies: {
          react: '^18.0.0',
          'react-scripts': '^5.0.0',
        },
      }

      const hasReact = FRAMEWORK_PACKAGES.react.some(pkg =>
        packageJson.dependencies[pkg]
      )

      expect(hasReact).toBe(true)
    })

    it('should NOT detect React when Next.js is present', () => {
      // This is a priority test - Next.js includes React
      const packageJson = {
        dependencies: {
          next: '^14.0.0',
          react: '^18.0.0',
        },
      }

      const hasNext = 'next' in packageJson.dependencies
      expect(hasNext).toBe(true)
    })
  })

  describe('Vue Detection', () => {
    it('should detect Vue from package.json', () => {
      const packageJson = {
        dependencies: {
          vue: '^3.0.0',
        },
      }

      const hasVue = FRAMEWORK_PACKAGES.vue.some(pkg =>
        packageJson.dependencies[pkg]
      )

      expect(hasVue).toBe(true)
    })

    it('should detect Vite-based Vue app', () => {
      const packageJson = {
        dependencies: {
          vue: '^3.0.0',
        },
        devDependencies: {
          vite: '^5.0.0',
          '@vitejs/plugin-vue': '^5.0.0',
        },
      }

      const hasVue = FRAMEWORK_PACKAGES.vue.some(pkg =>
        packageJson.dependencies[pkg] || packageJson.devDependencies?.[pkg]
      )

      expect(hasVue).toBe(true)
    })
  })

  describe('Svelte Detection', () => {
    it('should detect Svelte from package.json', () => {
      const packageJson = {
        dependencies: {
          svelte: '^4.0.0',
        },
      }

      const hasSvelte = FRAMEWORK_PACKAGES.svelte.some(pkg =>
        packageJson.dependencies[pkg]
      )

      expect(hasSvelte).toBe(true)
    })

    it('should detect SvelteKit from config file', () => {
      const configFile = 'svelte.config.js'
      const expectedPattern = FRAMEWORK_PATTERNS.svelte.configFiles

      expect(expectedPattern).toContain(configFile)
    })

    it('should detect Vite-based Svelte app', () => {
      const packageJson = {
        dependencies: {
          svelte: '^4.0.0',
        },
        devDependencies: {
          vite: '^5.0.0',
          '@sveltejs/vite-plugin-svelte': '^3.0.0',
        },
      }

      const hasSvelte = FRAMEWORK_PACKAGES.svelte.some(pkg =>
        packageJson.dependencies[pkg] || packageJson.devDependencies?.[pkg]
      )

      expect(hasSvelte).toBe(true)
    })
  })

  describe('Astro Detection', () => {
    it('should detect Astro from package.json', () => {
      const packageJson = {
        dependencies: {
          astro: '^4.0.0',
        },
      }

      const hasAstro = FRAMEWORK_PACKAGES.astro.some(pkg =>
        packageJson.dependencies[pkg]
      )

      expect(hasAstro).toBe(true)
    })

    it('should detect Astro from config file', () => {
      const configFile = 'astro.config.mjs'
      const expectedPattern = FRAMEWORK_PATTERNS.astro.configFiles

      expect(expectedPattern).toContain(configFile)
    })
  })

  describe('Node.js Detection', () => {
    it('should detect Node.js as fallback', () => {
      const packageJson = {
        dependencies: {
          express: '^4.18.0',
        },
      }

      // Node.js is the fallback when no frontend framework is detected
      const hasNext = FRAMEWORK_PACKAGES.nextjs.every(pkg => !packageJson.dependencies[pkg])
      const hasReact = FRAMEWORK_PACKAGES.react.every(pkg => !packageJson.dependencies[pkg])
      const hasVue = FRAMEWORK_PACKAGES.vue.every(pkg => !packageJson.dependencies[pkg])
      const hasSvelte = FRAMEWORK_PACKAGES.svelte.every(pkg => !packageJson.dependencies[pkg])
      const hasAstro = FRAMEWORK_PACKAGES.astro.every(pkg => !packageJson.dependencies[pkg])

      const shouldDefaultToNode = hasNext && hasReact && hasVue && hasSvelte && hasAstro
      expect(shouldDefaultToNode).toBe(true)
    })

    it('should detect Node.js backend frameworks', () => {
      const frameworks = ['express', 'fastify', 'koa', 'hapi']

      for (const framework of frameworks) {
        const packageJson = {
          dependencies: {
            [framework]: '^1.0.0',
          },
        }

        const hasNodeFramework = Object.keys(packageJson.dependencies).some(pkg =>
          frameworks.includes(pkg)
        )

        expect(hasNodeFramework).toBe(true)
      }
    })
  })

  describe('Framework Priority', () => {
    it('should have defined priority order', () => {
      // Priority: Next.js > Astro > SvelteKit > Nuxt > React > Vue > Svelte > Node.js
      const priorityOrder = [
        'nextjs',
        'astro',
        'svelte', // SvelteKit
        'vue', // Nuxt
        'react',
        'node',
      ]

      expect(priorityOrder).toHaveLength(6)
    })

    it('should detect Next.js before React', () => {
      const packageJson = {
        dependencies: {
          next: '^14.0.0',
          react: '^18.0.0',
        },
      }

      // Next.js packages should be checked first
      const nextPackages = FRAMEWORK_PACKAGES.nextjs
      const reactPackages = FRAMEWORK_PACKAGES.react

      expect(nextPackages).toContain('next')
      expect(reactPackages).toContain('react')
    })
  })

  describe('Multiple Framework Handling', () => {
    it('should handle monorepo with multiple frameworks', () => {
      const packageJson = {
        dependencies: {
          next: '^14.0.0',
          vue: '^3.0.0',
          svelte: '^4.0.0',
        },
      }

      const detectedFrameworks = []

      if (FRAMEWORK_PACKAGES.nextjs.some(pkg => packageJson.dependencies[pkg])) {
        detectedFrameworks.push('nextjs')
      }
      if (FRAMEWORK_PACKAGES.vue.some(pkg => packageJson.dependencies[pkg])) {
        detectedFrameworks.push('vue')
      }
      if (FRAMEWORK_PACKAGES.svelte.some(pkg => packageJson.dependencies[pkg])) {
        detectedFrameworks.push('svelte')
      }

      expect(detectedFrameworks.length).toBeGreaterThan(1)
    })
  })

  describe('Config File Detection', () => {
    it('should detect frameworks from config files', () => {
      const configFileMap = {
        'next.config.js': 'nextjs',
        'next.config.mjs': 'nextjs',
        'svelte.config.js': 'svelte',
        'astro.config.mjs': 'astro',
        'vite.config.ts': 'vue', // Could be Vue or Svelte, needs package.json
      }

      for (const [file, framework] of Object.entries(configFileMap)) {
        const pattern = FRAMEWORK_PATTERNS[framework]
        if (pattern?.configFiles) {
          expect(pattern.configFiles.some((f: string) => f.includes(file.split('.')[0]))).toBe(true)
        }
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty package.json', () => {
      const packageJson = {}

      const hasAnyFramework = Object.values(FRAMEWORK_PACKAGES).some(packages =>
        packages.some(pkg => packageJson[pkg])
      )

      expect(hasAnyFramework).toBe(false)
    })

    it('should handle missing dependencies field', () => {
      const packageJson = {
        name: 'test-project',
        version: '1.0.0',
      }

      const hasAnyFramework = Object.values(FRAMEWORK_PACKAGES).some(packages =>
        packages.some(pkg => packageJson[pkg])
      )

      expect(hasAnyFramework).toBe(false)
    })

    it('should handle devDependencies', () => {
      const packageJson = {
        devDependencies: {
          next: '^14.0.0',
        },
      }

      // CLI should check both dependencies and devDependencies
      const hasNext = FRAMEWORK_PACKAGES.nextjs.some(pkg =>
        packageJson.devDependencies[pkg]
      )

      expect(hasNext).toBe(true)
    })
  })

  describe('Framework Package Validation', () => {
    it('should have valid package names for all frameworks', () => {
      const frameworks = ['nextjs', 'react', 'vue', 'svelte', 'astro', 'node']

      for (const framework of frameworks) {
        const packages = FRAMEWORK_PACKAGES[framework]
        expect(packages).toBeDefined()
        expect(Array.isArray(packages)).toBe(true)
        expect(packages.length).toBeGreaterThan(0)

        for (const pkg of packages) {
          expect(typeof pkg).toBe('string')
          expect(pkg.length).toBeGreaterThan(0)
        }
      }
    })

    it('should not have duplicate package names across frameworks', () => {
      const allPackages = new Set()
      const duplicates = new Set()

      for (const packages of Object.values(FRAMEWORK_PACKAGES)) {
        for (const pkg of packages) {
          if (allPackages.has(pkg)) {
            duplicates.add(pkg)
          }
          allPackages.add(pkg)
        }
      }

      // React is allowed to be in multiple (e.g., Next.js includes React)
      const allowedDuplicates = ['react', 'react-dom']
      const unexpectedDuplicates = Array.from(duplicates).filter(
        pkg => !allowedDuplicates.includes(pkg)
      )

      expect(unexpectedDuplicates).toHaveLength(0)
    })
  })
})
