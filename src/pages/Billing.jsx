import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

const API_URL = 'https://api.shotlyapi.in'

const PLANS = {
  free: { name: 'Free', price: 0, limit: 50 },
  starter: { name: 'Starter', price: 5, limit: 2000 },
  growth: { name: 'Growth', price: 9, limit: 4000 },
  pro: { name: 'Pro', price: 19, limit: 10000 },
}

export default function Billing() {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()
  const [currentPlan, setCurrentPlan] = useState('free')
  const [upgrading, setUpgrading] = useState(null)

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [loading, user, navigate])

  useEffect(() => {
    if (user) {
      fetch(`${API_URL}/api/usage`, {
        headers: { 'Authorization': 'Bearer ' + user.token }
      })
        .then(r => r.json())
        .then(data => { if (data.stats) setCurrentPlan(data.stats.plan) })
        .catch(() => {})
    }
  }, [user])

  function upgrade(planKey) {
    setUpgrading(planKey)
    fetch(`${API_URL}/api/billing/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + user.token
      },
      body: JSON.stringify({ plan: planKey })
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        if (data.demo) {
          alert('Demo mode: In production, this would open Razorpay checkout for ' + PLANS[planKey].name + ' plan ($' + PLANS[planKey].price + '/mo). Complete Razorpay KYC to enable live payments.')
          setCurrentPlan(planKey)
          setUpgrading(null)
          return
        }
        if (window.Razorpay) {
          const rzp = new window.Razorpay({
            key: data.key_id,
            order_id: data.order_id,
            name: 'ShotlyAPI',
            description: PLANS[planKey].name + ' Plan',
            amount: data.amount,
            currency: 'USD',
            handler: function(response) {
              fetch(`${API_URL}/api/billing/verify`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + user.token
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  plan: planKey
                })
              })
                .then(r => r.json())
                .then(result => {
                  if (result.success) {
                    alert('Payment successful! Your plan has been upgraded.')
                    setCurrentPlan(planKey)
                  } else {
                    alert('Payment verification failed. Please contact support.')
                  }
                  setUpgrading(null)
                })
            },
            prefill: { email: user.email },
            theme: { color: '#2563eb' }
          })
          rzp.open()
        } else {
          alert('Razorpay SDK not loaded. Please refresh and try again.')
          setUpgrading(null)
        }
      })
      .catch(err => {
        alert('Error: ' + err.message)
        setUpgrading(null)
      })
  }

  if (loading || !user) return <div className="auth-page"><p>Loading...</p></div>

  return (
    <>
      <nav>
        <div className="container nav-inner">
          <Link to="/" className="logo">
            <span className="logo-mark">S</span>
            ShotlyAPI
          </Link>
          <div className="nav-links">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/billing" className="active">Billing</Link>
            <Link to="/docs">Docs</Link>
            <button onClick={() => { logout(); navigate('/') }} className="btn btn-outline btn-sm">Sign Out</button>
          </div>
        </div>
      </nav>

      <div className="dashboard">
        <div className="container">
          <div className="dash-grid">
            <div className="dash-sidebar">
              <h3>Menu</h3>
              <Link to="/dashboard">Overview</Link>
              <Link to="/billing" className="active">Billing</Link>
              <Link to="/docs">API Docs</Link>
            </div>
            <div className="dash-content">
              <h2>Billing</h2>
              <p>Manage your subscription and payment method.</p>

              <div className="billing-current">
                <div className="plan-name">{PLANS[currentPlan]?.name || 'Free'} Plan</div>
                <div className="plan-price">${PLANS[currentPlan]?.price || 0}/mo — {PLANS[currentPlan]?.limit || 50} screenshots per month</div>
              </div>

              <h3 style={{ marginBottom: '16px', fontSize: '20px' }}>Available Plans</h3>
              <div className="pricing-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {Object.entries(PLANS).map(([key, plan]) => (
                  <div key={key} className={`price-card ${key === 'starter' ? 'popular' : ''}`}>
                    {key === currentPlan && <div className="price-badge">Current Plan</div>}
                    <div className="price-name">{plan.name}</div>
                    <div className="price-amount">${plan.price}<span className="period">/mo</span></div>
                    <div className="price-desc">{plan.limit} screenshots / month</div>
                    <ul className="price-features">
                      <li>1920x1080 resolution</li>
                      <li>PNG & JPEG format</li>
                      <li>R2 caching</li>
                    </ul>
                    {key === currentPlan ? (
                      <button className="btn btn-outline" disabled>Current</button>
                    ) : (
                      <button className={`btn ${key === 'free' ? 'btn-outline' : 'btn-primary'}`} onClick={() => upgrade(key)} disabled={upgrading === key}>
                        {upgrading === key ? 'Processing...' : key === 'free' ? 'Downgrade' : 'Upgrade'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </>
  )
}
