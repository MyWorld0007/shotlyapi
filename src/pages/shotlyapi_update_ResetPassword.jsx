import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

const API_URL = 'https://api.shotlyapi.in'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setSuccess(true)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <Link to="/" className="logo" style={{ justifyContent: 'center', marginBottom: '24px' }}>
            <span className="logo-mark">S</span>
            ShotlyAPI
          </Link>
          <h2>Invalid Link</h2>
          <p>This password reset link is invalid or missing a token.</p>
          <Link to="/forgot-password" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Request a new reset link
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <Link to="/" className="logo" style={{ justifyContent: 'center', marginBottom: '24px' }}>
            <span className="logo-mark">S</span>
            ShotlyAPI
          </Link>
          <h2>Password Reset! 🎉</h2>
          <p>Your password has been changed successfully. You can now log in with your new password.</p>
          <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="logo" style={{ justifyContent: 'center', marginBottom: '24px' }}>
          <span className="logo-mark">S</span>
          ShotlyAPI
        </Link>
        <h2>Reset your password</h2>
        <p>Enter your new password below.</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Min 6 characters" />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={6} placeholder="Repeat your password" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        <div className="auth-switch">
          Remembered your password? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
