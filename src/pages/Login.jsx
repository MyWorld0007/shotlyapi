import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

const API_URL = 'https://api.shotlyapi.in'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        return login(data.token)
      })
      .then(() => navigate('/dashboard'))
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="logo" style={{ justifyContent: 'center', marginBottom: '24px' }}>
          <img src="/logo.svg" alt="ShotlyAPI" style={{width: '32px', height: '32px', borderRadius: '8px'}} />
          ShotlyAPI
        </Link>
        <h2>Welcome back</h2>
        <p>Sign in to access your dashboard.</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Your password" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="auth-switch" style={{ marginBottom: '8px' }}>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        <div className="auth-switch">
          Don't have an account? <Link to="/signup">Sign up free</Link>
        </div>
      </div>
    </div>
  )
}
