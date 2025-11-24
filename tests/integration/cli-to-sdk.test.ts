/**
 * CLI-to-SDK Integration Tests
 *
 * Tests the complete flow from CLI initialization with token
 * to SDK event ingestion and verification.
 *
 * Flow: CLI init --token → SDK initialization → Event tracking → Verification
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { exec } from 'child_process'
import { promisify } from 'util'
import { promises as fs } from 'fs'
import path from 'path'
import { CLI_CONFIG, API_ENDPOINTS, getEnvVarNames } from '@entro314labs/shared-constants'

const execAsync = promisify(exec)

describe('CLI to SDK Integration', () => {
  let testToken: string
  let testWebsiteId: string
  let testDir: string

  beforeAll(async () => {
    // Create test directory
    testDir = path.join(process.cwd(), 'tmp', 'cli-sdk-test')
    await fs.mkdir(testDir, { recursive: true })

    // Generate test token via API
    const response = await fetch(`${API_ENDPOINTS.production}/api/cli/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user-id',
        websiteId: 'test-website-id',
      }),
    })

    const data = await response.json()
    testToken = data.token
    testWebsiteId = data.websiteId
  })

  afterAll(async () => {
    // Cleanup test directory
    await fs.rm(testDir, { recursive: true, force: true })
  })

  describe('CLI Token-based Setup', () => {
    it('should accept --token flag', async () => {
      const { stdout } = await execAsync(
        `npx @entro314labs/entro-cli init --token ${testToken}`,
        { cwd: testDir }
      )

      expect(stdout).toContain('Setup complete')
    })

    it('should create .env file with correct variables', async () => {
      // Initialize with Next.js
      await execAsync(
        `npx @entro314labs/entro-cli init --token ${testToken} --framework nextjs`,
        { cwd: testDir }
      )

      const envPath = path.join(testDir, '.env.local')
      const envContent = await fs.readFile(envPath, 'utf-8')

      const nextjsVars = getEnvVarNames('nextjs')

      expect(envContent).toContain(nextjsVars.websiteId)
      expect(envContent).toContain(nextjsVars.host)
      expect(envContent).toContain(testWebsiteId)
    })

    it('should validate token before setup', async () => {
      const invalidToken = 'invalid-token-12345'

      try {
        await execAsync(
          `npx @entro314labs/entro-cli init --token ${invalidToken}`,
          { cwd: testDir }
        )
        fail('Should have thrown error for invalid token')
      } catch (error: any) {
        expect(error.message).toContain('Invalid token')
      }
    })

    it('should respect token expiry', async () => {
      // Token should be valid immediately
      const response = await fetch(`${API_ENDPOINTS.production}/api/cli/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: testToken }),
      })

      expect(response.ok).toBe(true)

      // Wait for token to expire (CLI_CONFIG.tokenExpiryMinutes)
      const expiryMs = CLI_CONFIG.tokenExpiryMinutes * 60 * 1000
      await new Promise(resolve => setTimeout(resolve, expiryMs + 1000))

      // Token should now be expired
      const expiredResponse = await fetch(`${API_ENDPOINTS.production}/api/cli/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: testToken }),
      })

      expect(expiredResponse.status).toBe(401)
    }, 20 * 60 * 1000) // 20 minute timeout for this test
  })

  describe('SDK Initialization', () => {
    it('should initialize Next.js SDK with CLI-generated config', async () => {
      // Setup with CLI
      await execAsync(
        `npx @entro314labs/entro-cli init --token ${testToken} --framework nextjs`,
        { cwd: testDir }
      )

      // Create test Next.js app file
      const appCode = `
import { track } from '@entro314labs/entro-nextjs'

export default function TestPage() {
  track('page_view', { page: 'test' })
  return <div>Test</div>
}
`
      await fs.writeFile(path.join(testDir, 'test-page.tsx'), appCode)

      // Verify .env.local has correct values
      const envPath = path.join(testDir, '.env.local')
      const envContent = await fs.readFile(envPath, 'utf-8')

      expect(envContent).toContain('NEXT_PUBLIC_ENTROLYTICS_WEBSITE_ID')
      expect(envContent).toContain('NEXT_PUBLIC_ENTROLYTICS_HOST')
    })

    it('should initialize React SDK with CLI-generated config', async () => {
      await execAsync(
        `npx @entro314labs/entro-cli init --token ${testToken} --framework react`,
        { cwd: testDir }
      )

      const envPath = path.join(testDir, '.env')
      const envContent = await fs.readFile(envPath, 'utf-8')

      expect(envContent).toContain('REACT_APP_ENTROLYTICS_WEBSITE_ID')
      expect(envContent).toContain('REACT_APP_ENTROLYTICS_HOST')
    })

    it('should initialize Vue SDK with CLI-generated config', async () => {
      await execAsync(
        `npx @entro314labs/entro-cli init --token ${testToken} --framework vue`,
        { cwd: testDir }
      )

      const envPath = path.join(testDir, '.env')
      const envContent = await fs.readFile(envPath, 'utf-8')

      expect(envContent).toContain('VITE_ENTROLYTICS_WEBSITE_ID')
      expect(envContent).toContain('VITE_ENTROLYTICS_HOST')
    })
  })

  describe('Event Ingestion', () => {
    it('should track events with SDK after CLI setup', async () => {
      // Setup with CLI
      await execAsync(
        `npx @entro314labs/entro-cli init --token ${testToken} --framework node`,
        { cwd: testDir }
      )

      // Send test event via SDK endpoint
      const eventResponse = await fetch(`${API_ENDPOINTS.production}/api/collect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: testWebsiteId,
          name: 'test_event',
          data: { test: true },
        }),
      })

      expect(eventResponse.ok).toBe(true)
    })

    it('should verify events are stored correctly', async () => {
      // Send event
      await fetch(`${API_ENDPOINTS.production}/api/collect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: testWebsiteId,
          name: 'verification_test',
          data: { verified: true },
        }),
      })

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Verify via API
      const eventsResponse = await fetch(
        `${API_ENDPOINTS.production}/api/websites/${testWebsiteId}/recent-events`
      )

      const events = await eventsResponse.json()
      const verificationEvent = events.find((e: any) => e.name === 'verification_test')

      expect(verificationEvent).toBeDefined()
      expect(verificationEvent.data.verified).toBe(true)
    })
  })

  describe('Framework Detection', () => {
    it('should detect Next.js from package.json', async () => {
      const packageJson = {
        dependencies: {
          next: '^14.0.0',
          react: '^18.0.0',
        },
      }

      await fs.writeFile(
        path.join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      )

      const { stdout } = await execAsync(
        `npx @entro314labs/entro-cli init --token ${testToken}`,
        { cwd: testDir }
      )

      expect(stdout).toContain('Detected: Next.js')
    })

    it('should detect React from package.json', async () => {
      const packageJson = {
        dependencies: {
          react: '^18.0.0',
          'react-dom': '^18.0.0',
        },
      }

      await fs.writeFile(
        path.join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      )

      const { stdout } = await execAsync(
        `npx @entro314labs/entro-cli init --token ${testToken}`,
        { cwd: testDir }
      )

      expect(stdout).toContain('Detected: React')
    })

    it('should detect Vue from package.json', async () => {
      const packageJson = {
        dependencies: {
          vue: '^3.0.0',
        },
      }

      await fs.writeFile(
        path.join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      )

      const { stdout } = await execAsync(
        `npx @entro314labs/entro-cli init --token ${testToken}`,
        { cwd: testDir }
      )

      expect(stdout).toContain('Detected: Vue')
    })

    it('should detect Svelte from svelte.config.js', async () => {
      await fs.writeFile(
        path.join(testDir, 'svelte.config.js'),
        'export default {}'
      )

      const { stdout } = await execAsync(
        `npx @entro314labs/entro-cli init --token ${testToken}`,
        { cwd: testDir }
      )

      expect(stdout).toContain('Detected: Svelte')
    })

    it('should detect Astro from astro.config.mjs', async () => {
      await fs.writeFile(
        path.join(testDir, 'astro.config.mjs'),
        'export default {}'
      )

      const { stdout } = await execAsync(
        `npx @entro314labs/entro-cli init --token ${testToken}`,
        { cwd: testDir }
      )

      expect(stdout).toContain('Detected: Astro')
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Use invalid API endpoint
      process.env.ENTROLYTICS_API_URL = 'http://invalid-endpoint.local'

      try {
        await execAsync(
          `npx @entro314labs/entro-cli init --token ${testToken}`,
          { cwd: testDir }
        )
        fail('Should have thrown error for network failure')
      } catch (error: any) {
        expect(error.message).toContain('network')
      }
    })

    it('should handle missing website ID gracefully', async () => {
      // Create .env without website ID
      await fs.writeFile(path.join(testDir, '.env'), 'ENTROLYTICS_HOST=http://localhost:3000')

      // Try to send event
      const response = await fetch(`${API_ENDPOINTS.production}/api/collect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'test_event',
          data: {},
        }),
      })

      expect(response.status).toBe(400)
    })
  })

  describe('Onboarding Integration', () => {
    it('should mark onboarding as complete after successful setup', async () => {
      await execAsync(
        `npx @entro314labs/entro-cli init --token ${testToken}`,
        { cwd: testDir }
      )

      // Check onboarding status via API
      const response = await fetch(
        `${API_ENDPOINTS.production}/api/user/onboarding`
      )

      const data = await response.json()
      expect(data.steps).toContainEqual(
        expect.objectContaining({
          step: 'install-tracking',
          status: 'completed',
        })
      )
    })

    it('should enable event verification after setup', async () => {
      await execAsync(
        `npx @entro314labs/entro-cli init --token ${testToken}`,
        { cwd: testDir }
      )

      // Send test event
      await fetch(`${API_ENDPOINTS.production}/api/collect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: testWebsiteId,
          name: 'onboarding_verification',
          data: {},
        }),
      })

      // Check if onboarding verify step is enabled
      const response = await fetch(
        `${API_ENDPOINTS.production}/api/user/onboarding`
      )

      const data = await response.json()
      expect(data.currentStep).toBe('verify')
    })
  })
})
