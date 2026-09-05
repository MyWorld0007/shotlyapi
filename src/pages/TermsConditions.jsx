import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useTheme, ThemeToggle } from '../lib/ThemeToggle'

const sections = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'account', label: 'Account Terms' },
  { id: 'api-usage', label: 'API Usage' },
  { id: 'acceptable-use', label: 'Acceptable Use' },
  { id: 'payment', label: 'Payment Terms' },
  { id: 'ip', label: 'Intellectual Property' },
  { id: 'termination', label: 'Termination' },
  { id: 'disclaimers', label: 'Disclaimers' },
  { id: 'liability', label: 'Limitation of Liability' },
  { id: 'contact', label: 'Contact' },
]

export default function TermsConditions() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
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
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
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
            <h2>Terms & Conditions</h2>
            <p className="updated">Effective date: September 4, 2026</p>

            <h3 id="introduction">Introduction</h3>
            <p>These Terms govern your use of ShotlyAPI, a screenshot capture API operated by ShotlyAPI ("we", "us", or "our"). By creating an account or making any API request, you agree to be bound by these Terms. If you do not agree, do not use the service.</p>

            <h3 id="account">Account Terms</h3>
            <p>To use ShotlyAPI you must register an account with a valid email address. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must be at least 18 years old and authorised to enter into a binding agreement. You agree to provide accurate information and to keep it current.</p>

            <h3 id="api-usage">API Usage</h3>
            <p>Each subscription plan defines a monthly request quota and a per-minute rate limit. Usage in excess of your plan quota may be rejected or billed at overage rates at our discretion. You must include a valid API key with every request, and you must not attempt to circumvent rate limits, quotas, or access controls. We may modify plan limits with reasonable advance notice.</p>

            <h3 id="acceptable-use">Acceptable Use</h3>
            <p>You agree not to use ShotlyAPI to:</p>
            <ul>
              <li>Capture screenshots of websites you do not have permission to access</li>
              <li>Violate any applicable law, regulation, or third-party rights</li>
              <li>Attempt to overload, crash, or disrupt the service</li>
              <li>Use the service for spamming, phishing, or malware distribution</li>
              <li>Scrape or extract data from websites in violation of their terms</li>
              <li>Resell or redistribute screenshots as a standalone service</li>
            </ul>
            <p>We reserve the right to suspend or terminate accounts that violate these terms.</p>

            <h3 id="payment">Payment Terms</h3>
            <p>Paid plans are billed monthly through Razorpay. Payments are processed in USD or INR. All fees are non-refundable except where required by law. You can cancel your subscription at any time, and your plan will remain active until the end of the current billing period. We may change pricing with 30 days notice.</p>

            <h3 id="ip">Intellectual Property</h3>
            <p>ShotlyAPI and all associated software, documentation, and branding are the property of ShotlyAPI. Screenshots captured using our API are the property of the respective website owners. You are responsible for ensuring you have the right to capture and use screenshots of third-party websites. We grant you a limited, non-exclusive license to use the service under these Terms.</p>

            <h3 id="termination">Termination</h3>
            <p>You may terminate your account at any time by contacting us. We may terminate or suspend your account if you violate these Terms, if your account is inactive for 12 months, or if required by law. Upon termination, your API key will be deactivated and your data will be deleted within 30 days.</p>

            <h3 id="disclaimers">Disclaimers</h3>
            <p>The service is provided "as is" and "as available" without warranties of any kind, express or implied. We do not guarantee that screenshots will be accurate, complete, or timely. We do not guarantee uninterrupted or error-free service. You use the service at your own risk.</p>

            <h3 id="liability">Limitation of Liability</h3>
            <p>To the maximum extent permitted by law, ShotlyAPI shall not be liable for any indirect, incidental, special, or consequential damages, including loss of profits, data, or business opportunities. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.</p>

            <h3 id="contact">Contact</h3>
            <p>If you have questions about these Terms, please contact us at legal@shotlyapi.in. We will respond within 48 hours.</p>

            <p style={{ marginTop: '32px', fontSize: '13px', color: 'var(--text-mute)' }}>These Terms are governed by the laws of India. Disputes shall be resolved in the courts of Bengaluru, India.</p>
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
