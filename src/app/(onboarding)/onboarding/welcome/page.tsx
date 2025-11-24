'use client'

import { useState } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'

export default function WelcomePage() {
  const { nextStep, skipOnboarding } = useOnboarding()
  const [formData, setFormData] = useState({
    companySize: '',
    industry: '',
    useCase: '',
    referralSource: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleContinue = async () => {
    setIsSubmitting(true)
    try {
      // Save welcome data
      await fetch('/api/user/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          data: formData,
        }),
      })

      nextStep()
    } catch (error) {
      console.error('Failed to save onboarding data:', error)
      // Continue anyway - this data is optional
      nextStep()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = async () => {
    setIsSubmitting(true)
    await skipOnboarding()
  }

  return (
    <>
      <div className="onboarding-progress">
        <div className="progress-dots">
          <span className="progress-dot active" />
          <span className="progress-dot" />
          <span className="progress-dot" />
          <span className="progress-dot" />
        </div>
      </div>

      <div className="onboarding-card">
        <h1 className="onboarding-title">
          Welcome to Entrolytics! 👋
        </h1>
        <p className="onboarding-subtitle">
          Let's get you set up in less than 2 minutes
        </p>

        <form className="onboarding-form" onSubmit={(e) => { e.preventDefault(); handleContinue(); }}>
          <div className="form-field">
            <label htmlFor="companySize" className="onboarding-label">
              Company Size (Optional)
            </label>
            <select
              id="companySize"
              className="onboarding-select"
              value={formData.companySize}
              onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
            >
              <option value="">Select company size</option>
              <option value="solo">Just me</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201+">201+ employees</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="industry" className="onboarding-label">
              Industry (Optional)
            </label>
            <input
              type="text"
              id="industry"
              className="onboarding-input"
              placeholder="e.g., SaaS, E-commerce, Media"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            />
          </div>

          <div className="form-field">
            <label htmlFor="useCase" className="onboarding-label">
              What do you want to track? (Optional)
            </label>
            <textarea
              id="useCase"
              className="onboarding-textarea"
              placeholder="e.g., User behavior on my SaaS dashboard, E-commerce conversion funnel"
              rows={3}
              value={formData.useCase}
              onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
            />
          </div>

          <div className="form-field">
            <label htmlFor="referralSource" className="onboarding-label">
              How did you hear about us? (Optional)
            </label>
            <select
              id="referralSource"
              className="onboarding-select"
              value={formData.referralSource}
              onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
            >
              <option value="">Select source</option>
              <option value="search">Google Search</option>
              <option value="social">Social Media</option>
              <option value="referral">Friend/Colleague</option>
              <option value="blog">Blog/Article</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="button-group">
            <button
              type="button"
              className="onboarding-btn-secondary"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              Skip for now
            </button>
            <button
              type="submit"
              className="onboarding-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Continue →'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
