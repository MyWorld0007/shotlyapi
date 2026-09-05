import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

const API_URL = 'https://api.shotlyapi.in'

const PLANS = {
  trial:   { name: 'Trial',   price: 1,  limit: 100,   type: 'one_time', duration: '7 days' },
  starter: { name: 'Starter', price: 5,  limit: 2000,  type: 'subscription' },
  growth:  { name: 'Growth',  price: 9,  limit: 4000,  type: 'subscription' },
  pro:     { name: 'Pro',     price: 19, limit: 10000, type: 'subscription' },
}

const PLAN_FEATURES = {
  trial:   ['PNG & JPEG format', '1920x1080 resolution', 'Full Page capture', 'Mobile / Tablet / Desktop', 'R2 caching', '7-day access period'],
  starter: ['PNG & JPEG format', '1920x1080 resolution', 'Full Page capture', 'Mobile / Tablet / Desktop', 'R2 caching', 'Block Ads'],
  growth:  ['PNG & JPEG & WebP', '1920x1080 resolution', 'Full Page capture', 'Mobile / Tablet / Desktop', 'R2 caching', 'Block Ads', 'CSS / JS injection'],
  pro:     ['All formats (PNG/JPEG/WebP/PDF)', '4K resolution', 'Full Page capture', 'All viewports', 'R2 caching', 'Block Ads', 'CSS / JS injection', 'HTML-to-Image & Text extraction', 'Bulk API'],
}

export default function Billing() {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()
  const [currentPlan, setCurrentPlan] = useState('none')
  const [upgrading, setUpgrading] = useState(null)
  const [usageData, setUsageData] = useState(null)

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [loading, user, navigate])

  useEffect(() => {
    if (user) {
      fetch(`${API_URL}/api/usage`, {
        headers: { 'Authorization': 'Bearer ' + user.token }
      })
        .then(r => r.json())
        .then(data => {
          if (data.stats) {
            setCurrentPlan(data.stats.plan || 'none')
            setUsageData(data.stats)
          }
        })
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
          alert('Demo mode: In production, this would open Razorpay checkout for ' + PLANS[planKey].name + ' plan ($' + PLANS[planKey].price + '). Complete Razorpay KYC to enable live payments.')
          setCurrentPlan(planKey)
          setUpgrading(null)
          return
        }

        if (!window.Razorpay) {
          alert('Razorpay SDK not loaded. Please refresh and try again.')
          setUpgrading(null)
          return
        }

        // Build Razorpay checkout options based on payment type
        const plan = PLANS[planKey]
        const isSubscription = data.type === 'subscription' || plan.type === 'subscription'

        const options = {
          key: data.key_id,
          name: 'ShotlyAPI',
          description: plan.name + ' Plan',
          amount: data.amount,
          currency: 'USD',
          prefill: { email: user.email },
          theme: { color: '#7c3aed' },
          handler: function(response) {
            // Build verify payload based on payment type
            let verifyBody
            if (isSubscription) {
              verifyBody = {
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: planKey
              }
            } else {
              verifyBody = {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: planKey
              }
            }

            fetch(`${API_URL}/api/billing/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + user.token
              },
              body: JSON.stringify(verifyBody)
            })
              .then(r => r.json())
              .then(result => {
                if (result.success) {
                  alert('Payment successful! Your plan has been activated.')
                  setCurrentPlan(planKey)
                  // Refresh usage data
                  fetch(`${API_URL}/api/usage`, {
                    headers: { 'Authorization': 'Bearer ' + user.token }
                  })
                    .then(r => r.json())
                    .then(d => { if (d.stats) setUsageData(d.stats) })
                    .catch(() => {})
                } else {
                  alert('Payment verification failed. Please contact support.')
                }
                setUpgrading(null)
              })
              .catch(() => {
                alert('Network error during verification. Please contact support.')
                setUpgrading(null)
              })
          },
          modal: {
            ondismiss: function() {
              setUpgrading(null)
            }
          }
        }

        // For one-time payments: use order_id
        // For subscriptions: use subscription_id
        if (isSubscription && data.subscription_id) {
          options.subscription_id = data.subscription_id
        } else if (data.order_id) {
          options.order_id = data.order_id
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
      })
      .catch(err => {
        alert('Error: ' + err.message)
        setUpgrading(null)
      })
  }

  if (loading || !user) return <div className="auth-page"><p>Loading...</p></div>

  const planEntries = Object.entries(PLANS)

  return (
    <>
      <nav>
        <div className="container nav-inner">
          <Link to="/" className="logo">
            <img src="/logo.svg" alt="ShotlyAPI" style={{width: '32px', height: '32px', borderRadius: '8px'}} />
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
                {currentPlan === 'none' ? (
                  <>
                    <div className="plan-name">No Active Plan</div>
                    <div className="plan-price">Purchase a plan below to start capturing screenshots</div>
                  </>
                ) : (
                  <>
                    <div className="plan-name">{PLANS[currentPlan]?.name || 'Unknown'} Plan</div>
                    <div className="plan-price">
                      {PLANS[currentPlan]?.type === 'one_time'
                        ? `$${PLANS[currentPlan]?.price} one-time — ${PLANS[currentPlan]?.limit} screenshots for ${PLANS[currentPlan]?.duration}`
                        : `$${PLANS[currentPlan]?.price}/mo — ${PLANS[currentPlan]?.limit} screenshots per month`
                      }
                      {usageData?.trial_expired && currentPlan === 'trial' && (
                        <span style={{ color: '#ef4444', fontWeight: 600, marginLeft: '8px' }}>— EXPIRED</span>
                      )}
                    </div>
                  </>
                )}
              </div>

              {usageData?.trial_expired && currentPlan === 'trial' && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  marginBottom: '24px',
                  color: '#ef4444',
                  fontSize: '14px'
                }}>
                  Your 7-day Trial has expired. Upgrade to a paid plan below to continue capturing screenshots.
                </div>
              )}

              <h3 style={{ marginBottom: '16px', fontSize: '20px' }}>Available Plans</h3>
              <div className="pricing-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {planEntries.map(([key, plan]) => (
                  <div key={key} className={`price-card ${key === 'growth' ? 'popular' : ''}`}>
                    {key === currentPlan && <div className="price-badge">Current Plan</div>}
                    <div className="price-name">{plan.name}</div>
                    <div className="price-amount">
                      ${plan.price}
                      <span className="period">{plan.type === 'one_time' ? '' : '/mo'}</span>
                    </div>
                    <div className="price-desc">
                      {plan.limit} screenshots{plan.type === 'one_time' ? ` / ${plan.duration}` : ' / month'}
                    </div>
                    <ul className="price-features">
                      {PLAN_FEATURES[key].map((feat, i) => (
                        <li key={i}>{feat}</li>
                      ))}
                    </ul>
                    {key === currentPlan ? (
                      <button className="btn btn-outline" disabled>Current</button>
                    ) : (
                      <button
                        className={`btn ${key === 'trial' ? 'btn-outline' : 'btn-primary'}`}
                        onClick={() => upgrade(key)}
                        disabled={upgrading === key}
                      >
                        {upgrading === key
                          ? 'Processing...'
                          : key === 'trial'
                            ? 'Buy Trial — $1'
                            : 'Subscribe'
                        }
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: '32px',
                padding: '20px',
                background: 'rgba(124, 58, 237, 0.05)',
                borderRadius: '12px',
                fontSize: '13px',
                color: '#94a3b8',
                lineHeight: 1.6
              }}>
                <strong style={{ color: '#7c3aed' }}>How billing works:</strong><br/>
                • <strong>Trial ($1)</strong> — One-time payment. 100 screenshots for 7 days. After 7 days, your account stops working until you buy a monthly plan.<br/>
                • <strong>Monthly plans</strong> — Auto-recurring subscription via Razorpay. Billed automatically every month. Cancel anytime from your Razorpay dashboard or by contacting support.<br/>
                • All payments are processed securely by Razorpay. We never store your card details.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
