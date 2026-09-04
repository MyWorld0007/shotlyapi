import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'

const faqs = [
  { q: 'What is a screenshot API?', a: 'A screenshot API is a service that programmatically captures visual snapshots of web pages. Instead of running a headless browser yourself, you send a simple HTTP request and receive a high-quality image or PDF of the target website in return.' },
  { q: 'How does ShotlyAPI work?', a: 'You send a GET request to our API endpoint with the target URL and your API key. Our rendering engine loads the page in a real Chromium browser, captures the screenshot, and returns the image within seconds. Repeat requests are served instantly from R2 cache.' },
  { q: 'Is there a free tier?', a: 'Yes. Our free tier includes 50 screenshots per month at no cost, with no credit card required. It is perfect for testing, personal projects, and small-scale usage. You can upgrade to a paid plan anytime for higher limits.' },
  { q: 'What image formats are supported?', a: 'ShotlyAPI supports PNG, JPEG, and WEBP image formats, plus PDF document export. You can specify the desired format via the format query parameter in your API request.' },
  { q: 'How fast is the API?', a: 'Our average response time is under 3 seconds for fresh captures. Cached screenshots return in under 500ms. Our global edge network ensures low latency regardless of your geographic location.' },
  { q: 'Can I capture full-page screenshots?', a: 'Yes! ShotlyAPI captures the entire scrollable page, not just the visible viewport. This is perfect for archiving long articles, landing pages, and documentation sites.' },
  { q: 'Do you cache screenshots?', a: 'Yes. We cache screenshots in Cloudflare R2 storage. When you request a screenshot of a URL that has been recently captured, we serve it instantly from cache — typically in under 500ms.' },
  { q: 'Is my API key secure?', a: 'Your API key is unique to your account and should be kept secret. All API requests are made over HTTPS. We never log or expose your API key. If your key is compromised, you can regenerate it from your dashboard.' },
  { q: 'Can I use screenshots commercially?', a: 'Absolutely. ShotlyAPI is designed for commercial use. All paid plans include a commercial license. You are responsible for ensuring you have the right to capture and use screenshots of third-party websites.' },
  { q: 'How do I upgrade my plan?', a: 'Log in to your dashboard, go to the Billing page, and select the plan you want to upgrade to. Payment is processed securely through Razorpay. Your new limits take effect immediately after payment.' },
]

export default function FAQ() {
  const { user } = useAuth()
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div>
      <nav>
        <div className="nav-inner container">
          <Link to="/" className="logo"><span className="logo-mark">S</span>ShotlyAPI</Link>
          <div className="nav-links">
            <Link to="/" style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: 500, textDecoration: 'none' }}>Features</Link>
            <Link to="/docs" style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: 500, textDecoration: 'none' }}>Docs</Link>
            <Link to="/" style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: 500, textDecoration: 'none' }}>Pricing</Link>
          </div>
          <div className="nav-actions">
            {user ? <Link to="/dashboard" className="btn btn-primary btn-sm">Dashboard</Link> : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
                <Link to="/signup" className="btn btn-primary btn-sm">Get API Key</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div style={{ padding: '80px 24px', maxWidth: '760px', margin: '0 auto' }}>
        <h2 className="section-title">Frequently Asked Questions</h2>
        <p className="section-sub">Everything you need to know about ShotlyAPI.</p>
        <div className="faq-list" style={{ marginTop: '32px' }}>
          {faqs.map((item, index) => (
            <div className="faq-item" key={item.q}>
              <button className="faq-question" onClick={() => setOpenIndex(openIndex === index ? -1 : index)} type="button">
                {item.q}
                <span className="faq-toggle">{openIndex === index ? '\u2212' : '+'}</span>
              </button>
              {openIndex === index && <div className="faq-answer">{item.a}</div>}
            </div>
          ))}
        </div>
      </div>

      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <Link to="/" className="logo" style={{ marginBottom: '12px' }}><span className="logo-mark">S</span>ShotlyAPI</Link>
              <p>The fastest way to capture website screenshots and PDFs via API.</p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <Link to="/" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>Features</Link>
              <Link to="/" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>Pricing</Link>
              <Link to="/faq" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>FAQ</Link>
            </div>
            <div className="footer-col">
              <h4>Developers</h4>
              <Link to="/docs" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>API Docs</Link>
              <a href="https://api.shotlyapi.in/health" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>API Status</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <Link to="/privacy" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>Privacy Policy</Link>
              <Link to="/terms" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>Terms &amp; Conditions</Link>
            </div>
          </div>
          <div className="footer-bottom"><p>{'\u00A9'} 2026 ShotlyAPI. Built with Cloudflare Workers, D1, and R2.</p></div>
        </div>
      </footer>
    </div>
  )
}
