import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'

const sections = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'information', label: 'Information We Collect' },
  { id: 'usage', label: 'How We Use Information' },
  { id: 'storage', label: 'Data Storage' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'third-party', label: 'Third-Party Services' },
  { id: 'security', label: 'Data Security' },
  { id: 'retention', label: 'Data Retention' },
  { id: 'rights', label: 'Your Rights' },
  { id: 'contact', label: 'Contact Us' },
]

export default function PrivacyPolicy() {
  const { user } = useAuth()
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

      <div className="docs-page">
        <div className="docs-grid">
          <div className="docs-sidebar">
            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-mute)', marginBottom: '16px' }}>Contents</h3>
            {sections.map(s => <a key={s.id} href={'#' + s.id}>{s.label}</a>)}
          </div>
          <div className="docs-content">
            <h2>Privacy Policy</h2>
            <p className="updated">Effective date: September 4, 2026</p>

            <h3 id="introduction">Introduction</h3>
            <p>This Privacy Policy describes how ShotlyAPI ("we", "us", or "our") collects, uses, and protects your information when you use our website screenshot API service. We are committed to protecting your privacy and being transparent about our data practices.</p>

            <h3 id="information">Information We Collect</h3>
            <p>We collect the following types of information:</p>
            <ul>
              <li><strong>Account information:</strong> Your email address and password (stored as a salted SHA-256 hash) when you create an account.</li>
              <li><strong>API usage data:</strong> URLs you request screenshots of, timestamps, and request counts. We log these for billing and usage analytics.</li>
              <li><strong>Payment information:</strong> Processed securely through Razorpay. We do not store your card details or banking information. Razorpay handles all payment data.</li>
              <li><strong>Technical data:</strong> IP address, browser type, and access times for security and abuse prevention.</li>
            </ul>

            <h3 id="usage">How We Use Information</h3>
            <p>We use your information to:</p>
            <ul>
              <li>Authenticate your account and manage API keys</li>
              <li>Track usage against your plan limits (free, starter, growth, pro)</li>
              <li>Process payments and manage billing</li>
              <li>Send transactional emails (welcome, password reset, usage alerts)</li>
              <li>Monitor for abuse, fraud, and security threats</li>
              <li>Improve our service and develop new features</li>
            </ul>

            <h3 id="storage">Data Storage</h3>
            <p>Your data is stored on Cloudflare infrastructure:</p>
            <ul>
              <li><strong>Cloudflare D1 (SQLite):</strong> User accounts, API keys, usage logs, and billing records</li>
              <li><strong>Cloudflare R2:</strong> Cached screenshot images (stored with a URL hash, not linked to your identity)</li>
              <li><strong>Cloudflare Workers:</strong> API request processing and authentication</li>
            </ul>
            <p>All data is stored encrypted at-rest with Cloudflare built-in encryption. Your password is never stored in plain text. We use SHA-256 hashing with a unique salt per user.</p>

            <h3 id="cookies">Cookies</h3>
            <p>We use a minimal cookie approach. Your JWT authentication token is stored in localStorage (not a cookie) for session management. We do not use third-party tracking cookies, advertising cookies, or analytics cookies.</p>

            <h3 id="third-party">Third-Party Services</h3>
            <p>We use the following third-party services that may process your data:</p>
            <ul>
              <li><strong>Cloudflare:</strong> Hosting, database (D1), object storage (R2), and edge compute (Workers)</li>
              <li><strong>Razorpay:</strong> Payment processing. Razorpay collects and processes payment data under their own privacy policy.</li>
              <li><strong>Resend:</strong> Transactional email delivery (welcome emails, password resets)</li>
              <li><strong>Oracle Cloud:</strong> Screenshot rendering server running Chromium</li>
            </ul>

            <h3 id="security">Data Security</h3>
            <p>We take security seriously. All API requests require authentication via API key. Passwords are hashed with SHA-256 and a unique salt. All communication uses HTTPS/TLS encryption. We monitor for suspicious activity and rate-limit requests to prevent abuse. However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.</p>

            <h3 id="retention">Data Retention</h3>
            <p>We retain your data for as long as your account is active. Usage logs are retained for 90 days. Cached screenshots in R2 are retained for 30 days then automatically deleted. If you delete your account, we will remove all personal data within 30 days, except where retention is required by law.</p>

            <h3 id="rights">Your Rights</h3>
            <p>You have the following rights regarding your data:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Download your usage data in JSON format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from non-essential emails</li>
            </ul>
            <p>To exercise any of these rights, contact us at privacy@shotlyapi.in</p>

            <h3 id="contact">Contact Us</h3>
            <p>If you have questions about this Privacy Policy or your data, please contact us at privacy@shotlyapi.in. We will respond within 48 hours.</p>

            <p style={{ marginTop: '32px', fontSize: '13px', color: 'var(--text-mute)' }}>This policy may be updated from time to time. We will notify you of significant changes via email.</p>
          </div>
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
              <Link to="/terms" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>Terms & Conditions</Link>
            </div>
          </div>
          <div className="footer-bottom"><p>{'\u00A9'} 2026 ShotlyAPI. Built with Cloudflare Workers, D1, and R2.</p></div>
        </div>
      </footer>
    </div>
  )
}
