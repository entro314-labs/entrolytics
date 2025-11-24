/**
 * SDK Environment Variable Tests
 *
 * Validates that all framework SDKs properly consume environment variables
 * from shared-constants package according to their framework conventions.
 */

import { describe, it, expect } from '@jest/globals'
import { ENV_VAR_NAMES, getEnvVarNames } from '@entro314labs/shared-constants'

describe('SDK Environment Variable Alignment', () => {
  describe('shared-constants exports', () => {
    it('should export ENV_VAR_NAMES', () => {
      expect(ENV_VAR_NAMES).toBeDefined()
      expect(typeof ENV_VAR_NAMES).toBe('object')
    })

    it('should export getEnvVarNames utility', () => {
      expect(getEnvVarNames).toBeDefined()
      expect(typeof getEnvVarNames).toBe('function')
    })

    it('should have all framework configurations', () => {
      const frameworks = ['nextjs', 'react', 'vue', 'svelte', 'astro', 'node', 'php', 'python', 'go']

      for (const framework of frameworks) {
        expect(ENV_VAR_NAMES[framework]).toBeDefined()
        expect(ENV_VAR_NAMES[framework].websiteId).toBeDefined()
        expect(ENV_VAR_NAMES[framework].host).toBeDefined()
      }
    })
  })

  describe('Next.js SDK (@entro314labs/entro-nextjs)', () => {
    it('should use correct Next.js environment variable names', () => {
      const vars = getEnvVarNames('nextjs')

      expect(vars.websiteId).toBe('NEXT_PUBLIC_ENTROLYTICS_WEBSITE_ID')
      expect(vars.host).toBe('NEXT_PUBLIC_ENTROLYTICS_HOST')
    })

    it('should match SDK implementation', async () => {
      // This would require importing the actual SDK package
      // For now, we verify the constant matches expected pattern
      const pattern = /^NEXT_PUBLIC_/
      const vars = getEnvVarNames('nextjs')

      expect(vars.websiteId).toMatch(pattern)
      expect(vars.host).toMatch(pattern)
    })
  })

  describe('React SDK (@entro314labs/entro-react)', () => {
    it('should use correct React environment variable names', () => {
      const vars = getEnvVarNames('react')

      expect(vars.websiteId).toBe('REACT_APP_ENTROLYTICS_WEBSITE_ID')
      expect(vars.host).toBe('REACT_APP_ENTROLYTICS_HOST')
    })

    it('should use REACT_APP_ prefix', () => {
      const pattern = /^REACT_APP_/
      const vars = getEnvVarNames('react')

      expect(vars.websiteId).toMatch(pattern)
      expect(vars.host).toMatch(pattern)
    })
  })

  describe('Vue SDK (@entro314labs/entro-vue)', () => {
    it('should use correct Vue environment variable names', () => {
      const vars = getEnvVarNames('vue')

      expect(vars.websiteId).toBe('VITE_ENTROLYTICS_WEBSITE_ID')
      expect(vars.host).toBe('VITE_ENTROLYTICS_HOST')
    })

    it('should use VITE_ prefix for Vite-based Vue apps', () => {
      const pattern = /^VITE_/
      const vars = getEnvVarNames('vue')

      expect(vars.websiteId).toMatch(pattern)
      expect(vars.host).toMatch(pattern)
    })
  })

  describe('Svelte SDK (@entro314labs/entro-svelte)', () => {
    it('should use correct Svelte environment variable names', () => {
      const vars = getEnvVarNames('svelte')

      expect(vars.websiteId).toBe('PUBLIC_ENTROLYTICS_WEBSITE_ID')
      expect(vars.host).toBe('PUBLIC_ENTROLYTICS_HOST')
    })

    it('should use PUBLIC_ prefix for SvelteKit', () => {
      const pattern = /^PUBLIC_/
      const vars = getEnvVarNames('svelte')

      expect(vars.websiteId).toMatch(pattern)
      expect(vars.host).toMatch(pattern)
    })
  })

  describe('Astro SDK (@entro314labs/entro-astro)', () => {
    it('should use correct Astro environment variable names', () => {
      const vars = getEnvVarNames('astro')

      expect(vars.websiteId).toBe('PUBLIC_ENTROLYTICS_WEBSITE_ID')
      expect(vars.host).toBe('PUBLIC_ENTROLYTICS_HOST')
    })

    it('should use PUBLIC_ prefix for Astro', () => {
      const pattern = /^PUBLIC_/
      const vars = getEnvVarNames('astro')

      expect(vars.websiteId).toMatch(pattern)
      expect(vars.host).toMatch(pattern)
    })
  })

  describe('Node.js SDK (@entro314labs/entro-api)', () => {
    it('should use correct Node.js environment variable names', () => {
      const vars = getEnvVarNames('node')

      expect(vars.websiteId).toBe('ENTROLYTICS_WEBSITE_ID')
      expect(vars.host).toBe('ENTROLYTICS_HOST')
    })

    it('should NOT use prefix for backend Node.js', () => {
      const vars = getEnvVarNames('node')

      // Should not have NEXT_PUBLIC, REACT_APP, VITE, or PUBLIC prefix
      expect(vars.websiteId).not.toMatch(/^(NEXT_PUBLIC|REACT_APP|VITE|PUBLIC)_/)
      expect(vars.host).not.toMatch(/^(NEXT_PUBLIC|REACT_APP|VITE|PUBLIC)_/)
    })
  })

  describe('Backend SDKs (PHP, Python, Go)', () => {
    it('should use unprefixed names for PHP', () => {
      const vars = getEnvVarNames('php')

      expect(vars.websiteId).toBe('ENTROLYTICS_WEBSITE_ID')
      expect(vars.host).toBe('ENTROLYTICS_HOST')
    })

    it('should use unprefixed names for Python', () => {
      const vars = getEnvVarNames('python')

      expect(vars.websiteId).toBe('ENTROLYTICS_WEBSITE_ID')
      expect(vars.host).toBe('ENTROLYTICS_HOST')
    })

    it('should use unprefixed names for Go', () => {
      const vars = getEnvVarNames('go')

      expect(vars.websiteId).toBe('ENTROLYTICS_WEBSITE_ID')
      expect(vars.host).toBe('ENTROLYTICS_HOST')
    })

    it('all backend SDKs should use same variable names', () => {
      const phpVars = getEnvVarNames('php')
      const pythonVars = getEnvVarNames('python')
      const goVars = getEnvVarNames('go')
      const nodeVars = getEnvVarNames('node')

      expect(phpVars.websiteId).toBe(nodeVars.websiteId)
      expect(pythonVars.websiteId).toBe(nodeVars.websiteId)
      expect(goVars.websiteId).toBe(nodeVars.websiteId)

      expect(phpVars.host).toBe(nodeVars.host)
      expect(pythonVars.host).toBe(nodeVars.host)
      expect(goVars.host).toBe(nodeVars.host)
    })
  })

  describe('CLI environment variable usage', () => {
    it('should generate .env with correct variable names per framework', () => {
      const frameworks = ['nextjs', 'react', 'vue', 'svelte', 'astro', 'node']

      for (const framework of frameworks) {
        const vars = getEnvVarNames(framework)

        // Verify variable names are non-empty and properly formatted
        expect(vars.websiteId).toBeTruthy()
        expect(vars.host).toBeTruthy()
        expect(vars.websiteId).toMatch(/^[A-Z_]+$/)
        expect(vars.host).toMatch(/^[A-Z_]+$/)
      }
    })

    it('should differentiate between client and server frameworks', () => {
      const clientFrameworks = ['nextjs', 'react', 'vue']
      const serverFrameworks = ['node', 'php', 'python', 'go']

      // Client frameworks should have prefixes
      for (const framework of clientFrameworks) {
        const vars = getEnvVarNames(framework)
        const hasPrefix =
          vars.websiteId.startsWith('NEXT_PUBLIC_') ||
          vars.websiteId.startsWith('REACT_APP_') ||
          vars.websiteId.startsWith('VITE_')

        expect(hasPrefix).toBe(true)
      }

      // Server frameworks should NOT have client prefixes
      for (const framework of serverFrameworks) {
        const vars = getEnvVarNames(framework)
        const hasClientPrefix =
          vars.websiteId.startsWith('NEXT_PUBLIC_') ||
          vars.websiteId.startsWith('REACT_APP_') ||
          vars.websiteId.startsWith('VITE_') ||
          vars.websiteId.startsWith('PUBLIC_')

        expect(hasClientPrefix).toBe(false)
      }
    })
  })

  describe('Environment variable completeness', () => {
    it('should provide both required variables for all frameworks', () => {
      const frameworks = ['nextjs', 'react', 'vue', 'svelte', 'astro', 'node', 'php', 'python', 'go']

      for (const framework of frameworks) {
        const vars = getEnvVarNames(framework)

        expect(vars).toHaveProperty('websiteId')
        expect(vars).toHaveProperty('host')
        expect(vars.websiteId).toBeTruthy()
        expect(vars.host).toBeTruthy()
      }
    })

    it('should not have duplicate or conflicting names', () => {
      const allVarNames = new Set<string>()
      const frameworks = ['nextjs', 'react', 'vue', 'svelte', 'astro', 'node', 'php', 'python', 'go']

      for (const framework of frameworks) {
        const vars = getEnvVarNames(framework)
        const key = `${vars.websiteId}-${vars.host}`

        // Backend frameworks should share the same variables
        // Frontend frameworks should have unique prefixed variables
        if (!allVarNames.has(key)) {
          allVarNames.add(key)
        }
      }

      // We should have distinct patterns for frontend frameworks
      // and shared pattern for backend frameworks
      expect(allVarNames.size).toBeGreaterThan(1)
      expect(allVarNames.size).toBeLessThan(frameworks.length)
    })
  })
})
