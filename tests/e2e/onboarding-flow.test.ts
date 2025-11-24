/**
 * End-to-End Onboarding Flow Test
 *
 * Tests the complete user journey from signup through onboarding
 * to CLI setup, SDK initialization, and event verification.
 *
 * Complete Flow:
 * 1. User signup/login
 * 2. Onboarding welcome page
 * 3. Create website
 * 4. Install tracking (CLI with token)
 * 5. Verify events received
 * 6. Onboarding complete
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { chromium, Browser, Page } from 'playwright'
import { exec } from 'child_process'
import { promisify } from 'util'
import { API_ENDPOINTS, ONBOARDING_STEPS } from '@entro314labs/shared-constants'

const execAsync = promisify(exec)

describe('End-to-End Onboarding Flow', () => {
  let browser: Browser
  let page: Page
  let testUserId: string
  let testWebsiteId: string
  let testToken: string

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true })
    page = await browser.newPage()
  })

  afterAll(async () => {
    await browser.close()
  })

  describe('Step 1: User Signup/Login', () => {
    it('should navigate to signup page', async () => {
      await page.goto(`${API_ENDPOINTS.production}/signup`)
      await page.waitForLoadState('networkidle')

      const url = page.url()
      expect(url).toContain('signup')
    })

    it('should create new account', async () => {
      const testEmail = `test-${Date.now()}@example.com`
      const testPassword = 'TestPassword123!'

      await page.fill('input[name="email"]', testEmail)
      await page.fill('input[name="password"]', testPassword)
      await page.click('button[type="submit"]')

      await page.waitForNavigation()

      // Should redirect to onboarding
      const url = page.url()
      expect(url).toContain('/onboarding')
    })
  })

  describe('Step 2: Onboarding Welcome', () => {
    it('should show welcome page', async () => {
      await page.waitForSelector('text=Welcome to Entrolytics')

      const heading = await page.textContent('h1')
      expect(heading).toContain('Welcome')
    })

    it('should have correct onboarding step', async () => {
      const response = await page.evaluate(async () => {
        const res = await fetch('/api/user/onboarding')
        return res.json()
      })

      expect(response.currentStep).toBe(ONBOARDING_STEPS.WELCOME)
    })

    it('should navigate to create website step', async () => {
      await page.click('button:has-text("Get Started")')
      await page.waitForURL('**/onboarding/create-website')

      const url = page.url()
      expect(url).toContain('create-website')
    })
  })

  describe('Step 3: Create Website', () => {
    it('should show create website form', async () => {
      await page.waitForSelector('text=Create Your First Website')

      const heading = await page.textContent('h1')
      expect(heading).toContain('Create Your First Website')
    })

    it('should create website successfully', async () => {
      const websiteName = `Test Site ${Date.now()}`
      const websiteDomain = `test-${Date.now()}.example.com`

      await page.fill('input[name="name"]', websiteName)
      await page.fill('input[name="domain"]', websiteDomain)
      await page.click('button[type="submit"]')

      await page.waitForNavigation()

      // Should redirect to install tracking
      const url = page.url()
      expect(url).toContain('install-tracking')
    })

    it('should update onboarding step to create-website', async () => {
      const response = await page.evaluate(async () => {
        const res = await fetch('/api/user/onboarding')
        return res.json()
      })

      const createWebsiteStep = response.steps.find(
        (s: any) => s.step === ONBOARDING_STEPS.CREATE_WEBSITE
      )

      expect(createWebsiteStep.status).toBe('completed')
    })

    it('should store website ID for later use', async () => {
      const response = await page.evaluate(async () => {
        const res = await fetch('/api/websites')
        return res.json()
      })

      expect(response.websites).toHaveLength(1)
      testWebsiteId = response.websites[0].id
    })
  })

  describe('Step 4: Install Tracking', () => {
    it('should show CLI installation instructions', async () => {
      await page.waitForSelector('text=Install Tracking')

      const hasCliInstructions = await page.isVisible('code:has-text("npx @entro314labs/entro-cli")')
      expect(hasCliInstructions).toBe(true)
    })

    it('should generate setup token', async () => {
      await page.click('button:has-text("Generate Setup Token")')
      await page.waitForSelector('[data-testid="setup-token"]')

      const tokenElement = await page.textContent('[data-testid="setup-token"]')
      expect(tokenElement).toBeTruthy()
      expect(tokenElement!.length).toBeGreaterThan(20)

      testToken = tokenElement!
    })

    it('should show CLI command with token', async () => {
      const cliCommand = await page.textContent('code:has-text("--token")')
      expect(cliCommand).toContain('--token')
      expect(cliCommand).toContain(testToken)
    })

    it('should copy CLI command to clipboard', async () => {
      await page.click('button:has-text("Copy Command")')

      // Verify clipboard (requires clipboard permissions in test)
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
      expect(clipboardText).toContain('npx @entro314labs/entro-cli init')
      expect(clipboardText).toContain('--token')
    })

    it('should execute CLI setup command', async () => {
      const testDir = '/tmp/entrolytics-e2e-test'
      await execAsync(`mkdir -p ${testDir}`)

      const { stdout } = await execAsync(
        `npx @entro314labs/entro-cli init --token ${testToken} --framework nextjs`,
        { cwd: testDir }
      )

      expect(stdout).toContain('Setup complete')
    }, 60000) // 60 second timeout for CLI execution

    it('should mark install-tracking step as completed', async () => {
      // Wait for CLI completion to be detected
      await page.waitForTimeout(2000)

      const response = await page.evaluate(async () => {
        const res = await fetch('/api/user/onboarding')
        return res.json()
      })

      const installStep = response.steps.find(
        (s: any) => s.step === ONBOARDING_STEPS.INSTALL_TRACKING
      )

      expect(installStep.status).toBe('completed')
    })

    it('should proceed to verify step', async () => {
      await page.click('button:has-text("Continue to Verification")')
      await page.waitForURL('**/onboarding/verify')

      const url = page.url()
      expect(url).toContain('verify')
    })
  })

  describe('Step 5: Verify Events', () => {
    it('should show verification page', async () => {
      await page.waitForSelector('text=Verify Event Tracking')

      const heading = await page.textContent('h1')
      expect(heading).toContain('Verify')
    })

    it('should send test event via SDK', async () => {
      const response = await page.evaluate(async (websiteId) => {
        const res = await fetch('/api/collect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            websiteId,
            name: 'page_view',
            data: { page: '/test', test: true },
          }),
        })
        return res.ok
      }, testWebsiteId)

      expect(response).toBe(true)
    })

    it('should detect event and show success', async () => {
      await page.waitForSelector('[data-testid="event-detected"]', { timeout: 10000 })

      const successMessage = await page.textContent('[data-testid="event-detected"]')
      expect(successMessage).toContain('Event detected')
    })

    it('should show recent events list', async () => {
      await page.waitForSelector('[data-testid="recent-events"]')

      const events = await page.$$eval('[data-testid="event-item"]', els => els.length)
      expect(events).toBeGreaterThan(0)
    })

    it('should verify event data correctness', async () => {
      const eventData = await page.evaluate(async (websiteId) => {
        const res = await fetch(`/api/websites/${websiteId}/recent-events`)
        return res.json()
      }, testWebsiteId)

      expect(eventData).toHaveLength(1)
      expect(eventData[0].name).toBe('page_view')
      expect(eventData[0].data.test).toBe(true)
    })

    it('should complete verification step', async () => {
      await page.click('button:has-text("Complete Setup")')
      await page.waitForTimeout(1000)

      const response = await page.evaluate(async () => {
        const res = await fetch('/api/user/onboarding')
        return res.json()
      })

      const verifyStep = response.steps.find(
        (s: any) => s.step === ONBOARDING_STEPS.VERIFY
      )

      expect(verifyStep.status).toBe('completed')
    })
  })

  describe('Step 6: Onboarding Complete', () => {
    it('should redirect to dashboard', async () => {
      await page.waitForNavigation()

      const url = page.url()
      expect(url).toContain('/dashboard')
    })

    it('should mark onboarding as complete', async () => {
      const response = await page.evaluate(async () => {
        const res = await fetch('/api/user/onboarding')
        return res.json()
      })

      expect(response.isComplete).toBe(true)
      expect(response.currentStep).toBe(ONBOARDING_STEPS.COMPLETE)
    })

    it('should show dashboard with website', async () => {
      await page.waitForSelector('[data-testid="website-card"]')

      const websiteName = await page.textContent('[data-testid="website-card"]')
      expect(websiteName).toContain('Test Site')
    })

    it('should show event count', async () => {
      await page.waitForSelector('[data-testid="event-count"]')

      const eventCount = await page.textContent('[data-testid="event-count"]')
      expect(parseInt(eventCount!)).toBeGreaterThan(0)
    })

    it('should not show onboarding prompt again', async () => {
      await page.reload()
      await page.waitForLoadState('networkidle')

      const hasOnboardingBanner = await page.isVisible('text=Complete your setup')
      expect(hasOnboardingBanner).toBe(false)
    })
  })

  describe('Onboarding Data Persistence', () => {
    it('should persist onboarding steps in database', async () => {
      const response = await page.evaluate(async () => {
        const res = await fetch('/api/user/onboarding')
        return res.json()
      })

      expect(response.steps).toHaveLength(5) // welcome, create, install, verify, complete

      const allStepsCompleted = response.steps.every(
        (s: any) => s.status === 'completed'
      )
      expect(allStepsCompleted).toBe(true)
    })

    it('should have correct step timestamps', async () => {
      const response = await page.evaluate(async () => {
        const res = await fetch('/api/user/onboarding')
        return res.json()
      })

      for (const step of response.steps) {
        expect(step.completedAt).toBeTruthy()

        const timestamp = new Date(step.completedAt).getTime()
        const now = Date.now()

        // Should be within last 5 minutes
        expect(now - timestamp).toBeLessThan(5 * 60 * 1000)
      }
    })

    it('should store CLI token in database', async () => {
      // This would require database access - mock for now
      const response = await page.evaluate(async (token) => {
        const res = await fetch('/api/cli/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        return res.json()
      }, testToken)

      expect(response.valid).toBe(true)
      expect(response.websiteId).toBe(testWebsiteId)
    })
  })

  describe('Skip Onboarding Flow', () => {
    it('should allow skipping onboarding', async () => {
      // Create new user
      await page.goto(`${API_ENDPOINTS.production}/signup`)

      const testEmail = `skip-test-${Date.now()}@example.com`
      await page.fill('input[name="email"]', testEmail)
      await page.fill('input[name="password"]', 'TestPassword123!')
      await page.click('button[type="submit"]')

      await page.waitForNavigation()

      // Skip onboarding
      await page.click('button:has-text("Skip for now")')
      await page.waitForNavigation()

      const url = page.url()
      expect(url).toContain('/dashboard')
    })

    it('should mark onboarding as skipped', async () => {
      const response = await page.evaluate(async () => {
        const res = await fetch('/api/user/onboarding')
        return res.json()
      })

      expect(response.currentStep).toBe(ONBOARDING_STEPS.SKIPPED)
      expect(response.skippedAt).toBeTruthy()
    })

    it('should allow resuming skipped onboarding', async () => {
      await page.click('button:has-text("Complete Setup")')
      await page.waitForNavigation()

      const url = page.url()
      expect(url).toContain('/onboarding')
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid token gracefully', async () => {
      await page.goto(`${API_ENDPOINTS.production}/onboarding/install-tracking`)

      const invalidToken = 'invalid-token-12345'

      const testDir = '/tmp/entrolytics-error-test'
      await execAsync(`mkdir -p ${testDir}`)

      try {
        await execAsync(
          `npx @entro314labs/entro-cli init --token ${invalidToken}`,
          { cwd: testDir }
        )
        fail('Should have thrown error')
      } catch (error: any) {
        expect(error.message).toContain('Invalid token')
      }
    })

    it('should handle network errors', async () => {
      // Simulate offline mode
      await page.setOfflineMode(true)

      const response = await page.evaluate(async () => {
        try {
          await fetch('/api/user/onboarding')
          return { success: true }
        } catch (error) {
          return { success: false }
        }
      })

      expect(response.success).toBe(false)

      await page.setOfflineMode(false)
    })

    it('should handle duplicate website creation', async () => {
      await page.goto(`${API_ENDPOINTS.production}/onboarding/create-website`)

      await page.fill('input[name="name"]', 'Test Site')
      await page.fill('input[name="domain"]', 'test.example.com')
      await page.click('button[type="submit"]')

      await page.waitForTimeout(1000)

      // Try to create again
      await page.goto(`${API_ENDPOINTS.production}/onboarding/create-website`)
      await page.fill('input[name="name"]', 'Test Site')
      await page.fill('input[name="domain"]', 'test.example.com')
      await page.click('button[type="submit"]')

      const errorMessage = await page.textContent('[data-testid="error-message"]')
      expect(errorMessage).toContain('already exists')
    })
  })
})
