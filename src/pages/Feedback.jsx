import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import Navbar from '../components/Navbar'

const API_URL = 'https://api.shotlyapi.in'

const categories = [
  { value: 'bug', label: 'Bug Report', icon: '\u{1F41B}' },
  { value: 'feature', label: 'Feature Request', icon: '\u{1F4A1}' },
  { value: 'general', label: 'General Feedback', icon: '\u{1F4AC}' },
  { value: 'pricing', label: 'Pricing Question', icon: '\u{1F4B0}' },
  { value: 'docs', label: 'Documentation', icon: '\u{1F4DA}' },
  { value: 'other', label: 'Other', icon: '\u2753' },
]

const ratingLabels = { 1: 'Very Bad', 2: 'Poor', 3: 'Okay', 4: 'Good', 5: 'Excellent' }

function Star({ filled, onClick, onMouseEnter }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={() => {}}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '34px',
        lineHeight: 1,
        padding: '0 6px',
        color: filled ? '#f59e0b' : 'var(--border, #d1d5db)',
        transition: 'color 0.15s ease, transform 0.1s ease',
        transform: filled ? 'scale(1.08)' : 'scale(1)',
      }}
      aria-label="star"
    >
      {'\u2605'}
    </button>
  )
}

export default function Feedback() {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [category, setCategory] = useState('general')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const displayRating = hoverRating || rating

  function handleSubmit(e) {
    e.preventDefault()
    if (!rating) { setError('Please select a star rating'); return }
    if (!message.trim()) { setError('Please write a short message'); return }
    setLoading(true)
    setError(null)
    fetch(`${API_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        rating: rating,
        category: category,
        message: message.trim(),
        email: user ? undefined : (email || undefined),
      })
    })
      .then(r => r.json().then(data => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.error || 'Failed to submit feedback')
        setSubmitted(true)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message || 'Something went wrong. Please try again.')
        setLoading(false)
      })
  }

  function resetForm() {
    setRating(0)
    setHoverRating(0)
    setCategory('general')
    setMessage('')
    setError(null)
    setSubmitted(false)
  }

  return (
    <div>
      <Navbar />

      {submitted ? (
        <div className="auth-page">
          <div className="auth-card" style={{ textAlign: 'center', maxWidth: '480px' }}>
            <div style={{ fontSize: '52px', marginBottom: '16px' }}>{'\u{1F389}'}</div>
            <h2 style={{ marginBottom: '12px' }}>Thank you!</h2>
            <p style={{ color: 'var(--text-mute)', marginBottom: '24px', lineHeight: 1.6 }}>
              Your feedback has been received. We read every single message and use it to make
              ShotlyAPI better. If you reported a bug and left your email, we will get back to you.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/" className="btn btn-outline">Back to Home</Link>
              <button className="btn btn-primary" onClick={resetForm} type="button">
                Send Another
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="auth-page">
          <div className="auth-card" style={{ maxWidth: '560px' }}>
            <Link to="/" className="logo" style={{ justifyContent: 'center', marginBottom: '24px' }}>
              <img src="/logo.svg" alt="ShotlyAPI" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
              ShotlyAPI
            </Link>
            <h2 style={{ textAlign: 'center' }}>Share your feedback</h2>
            <p style={{ color: 'var(--text-mute)', textAlign: 'center', marginBottom: '28px', fontSize: '15px' }}>
              Found a bug? Have an idea? Want to tell us what you think of ShotlyAPI?
              We want to hear it all.
            </p>

            <form onSubmit={handleSubmit}>
              {/* Star rating */}
              <div className="form-group" style={{ textAlign: 'center' }}>
                <label style={{ display: 'block', marginBottom: '10px' }}>How would you rate ShotlyAPI?</label>
                <div
                  style={{ display: 'inline-flex', alignItems: 'center' }}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star
                      key={n}
                      filled={n <= displayRating}
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHoverRating(n)}
                    />
                  ))}
                </div>
                <div style={{ color: 'var(--text-mute)', fontSize: '13px', marginTop: '8px', minHeight: '18px' }}>
                  {displayRating ? ratingLabels[displayRating] : ''}
                </div>
              </div>

              {/* Category */}
              <div className="form-group">
                <label>What is this about?</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {categories.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCategory(c.value)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: category === c.value ? '1px solid var(--primary, #2563eb)' : '1px solid var(--border, #e2e8f0)',
                        background: category === c.value ? 'rgba(37,99,235,0.08)' : 'transparent',
                        color: category === c.value ? 'var(--primary, #2563eb)' : 'var(--text-dim, #64748b)',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontWeight: category === c.value ? 600 : 400,
                      }}
                    >
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="form-group">
                <label>Your message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Tell us more..."
                  rows={5}
                  maxLength={2000}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border, #e2e8f0)',
                    background: 'var(--bg, #fff)',
                    color: 'var(--text, #0f172a)',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ color: 'var(--text-mute)', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>
                  {message.length} / 2000
                </div>
              </div>

              {/* Email (only for logged-out visitors) */}
              {!user && (
                <div className="form-group">
                  <label>Email (optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com — only if you want a reply"
                  />
                </div>
              )}

              {error && <div className="auth-error">{error}</div>}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', marginTop: '8px' }}
              >
                {loading ? 'Sending...' : 'Send Feedback'}
              </button>
            </form>
          </div>
        </div>
      )}

      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <Link to="/" className="logo" style={{ marginBottom: '12px' }}>
                <img src="/logo.svg" alt="ShotlyAPI" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                ShotlyAPI
              </Link>
              <p>The fastest way to capture website screenshots and PDFs via API.</p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <Link to="/" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>Home</Link>
              <Link to="/playground" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>Capture Studio</Link>
              <a href="/#pricing" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>Pricing</a>
              <Link to="/feedback" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>Feedback</Link>
            </div>
            <div className="footer-col">
              <h4>Developers</h4>
              <Link to="/docs" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>API Docs</Link>
              <a href="https://api.shotlyapi.in/health">API Status</a>
              <a href="https://github.com/MyWorld0007/shotlyapi">GitHub</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <Link to="/privacy" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>Privacy Policy</Link>
              <Link to="/terms" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>Terms & Conditions</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>{'\u00A9'} 2026 ShotlyAPI. Built with Cloudflare Workers, D1, and R2.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
