import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const API_URL = 'https://api.shotlyapi.in'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const resp = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })
      const data = await resp.json()
      if (data.error) {
        setError(data.error)
        return
      }
      navigate('/admin')
    } catch(err) {
      setError('Network error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" className="logo" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '20px' }}>
            <img src="/logo.svg" alt="ShotlyAPI" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
            <span style={{ fontWeight: 800, fontSize: '20px', color: '#e4e7ee' }}>ShotlyAPI</span>
          </Link>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#e4e7ee', marginBottom: '8px' }}>Admin Panel</h1>
          <p style={{ color: '#8b92a5', fontSize: '14px' }}>Restricted access - administrators only</p>
        </div>

        <div style={{ background: 'rgba(35,40,56,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px' }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#8b92a5', marginBottom: '6px' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 14px', background: 'rgba(15,17,23,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e4e7ee', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                placeholder="admin@shotlyapi.in"
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#8b92a5', marginBottom: '6px' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 14px', background: 'rgba(15,17,23,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e4e7ee', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                placeholder="Enter password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Signing in...' : 'Sign In to Admin'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#5a6178' }}>Admin access is restricted to authorized personnel only.</p>
      </div>
    </div>
  )
}
