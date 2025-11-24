'use client'

import { useState } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { useUser } from '@clerk/nextjs'

export default function CreateWebsitePage() {
  const { setWebsiteId, nextStep, skipOnboarding } = useOnboarding()
  const { user } = useUser()
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('Website name is required')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          domain: formData.domain.trim() || undefined,
          userId: user?.id,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create website')
      }

      const data = await response.json()
      const websiteId = data.websiteId || data.id

      // Save to onboarding context
      setWebsiteId(websiteId)

      // Track onboarding step
      await fetch('/api/user/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'step',
          step: 'create-website',
          websiteId,
        }),
      })

      nextStep()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create website')
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="onboarding-progress">
        <div className="progress-dots">
          <span className="progress-dot completed" />
          <span className="progress-dot active" />
          <span className="progress-dot" />
          <span className="progress-dot" />
        </div>
      </div>

      <div className="onboarding-card">
        <h1 className="onboarding-title">
          Create Your First Website
        </h1>
        <p className="onboarding-subtitle">
          Add the site you want to track
        </p>

        <form className="onboarding-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="name" className="onboarding-label">
              Website Name *
            </label>
            <input
              type="text"
              id="name"
              className="onboarding-input"
              placeholder="My Awesome Site"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="form-field">
            <label htmlFor="domain" className="onboarding-label">
              Domain (Optional)
            </label>
            <input
              type="text"
              id="domain"
              className="onboarding-input"
              placeholder="example.com"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
            />
            <span className="onboarding-hint">
              ℹ️ Used for organization only. You can track multiple domains per website.
            </span>
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <div className="button-group">
            <button
              type="button"
              className="onboarding-btn-secondary"
              onClick={skipOnboarding}
              disabled={isSubmitting}
            >
              Skip
            </button>
            <button
              type="submit"
              className="onboarding-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create & Continue →'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
