import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

const API_URL = 'https://api.shotlyapi.in'

export default function Signup() {
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

    fetch(`${API_URL}/api/auth/signup`, {
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
          <span className="logo-mark">S</span>
          ShotlyAPI
        </Link>
        <h2>Create your account</h2>
        <p>Get a free API key and 50 screenshots per month.</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Min 6 characters" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up Free'}
          </button>
        </form>
        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
