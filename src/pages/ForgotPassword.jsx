import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme, ThemeToggle } from '../lib/ThemeToggle'

const API_URL = 'https://api.shotlyapi.in'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)
  const { theme, toggleTheme } = useTheme()

  function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    fetch(`${API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setSent(true)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <Link to="/" className="logo" style={{ justifyContent: 'center', marginBottom: '24px' }}>
          <span className="logo-mark">S</span>
          ShotlyAPI
        </Link>
        <h2>Forgot password?</h2>
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--green)', marginBottom: '20px', fontSize: '16px' }}>
              ✓ If the email exists, a reset link has been sent.
            </p>
            <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '24px' }}>
              Check your inbox (and spam folder) for an email from ShotlyAPI.
            </p>
            <Link to="/login" className="btn btn-primary">Back to Login</Link>
          </div>
        ) : (
          <>
            <p>Enter your email and we'll send you a reset link.</p>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
        <div className="auth-switch">
          Remembered your password? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
