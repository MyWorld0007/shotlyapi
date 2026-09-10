import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useTheme, ThemeToggle } from '../lib/ThemeToggle'
import Navbar from '../components/Navbar'

export default function PrivacyPolicy() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <div>
      <Navbar />

      <div className="legal-page">
        <div className="container">
          <div className="legal-content">
            <h1>Privacy Policy</h1>
            <p className="legal-updated">Last updated: September 10, 2026</p>

            <p>ShotlyAPI ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your data when you use our screenshot API service.</p>

            <h3 id="data-collection">Data We Collect</h3>
            <p>We collect and process the following data to provide our service:</p>
            <ul>
              <li><strong>Account Data:</strong> Email address, password (hashed), and account preferences</li>
              <li><strong>Usage Data:</strong> API requests, screenshot counts, timestamps, and error logs</li>
              <li><strong>Payment Data:</strong> Payment status and plan information (card details are handled by Razorpay, never stored by us)</li>
              <li><strong>Technical Data:</strong> IP address, browser type, and access logs for security and debugging</li>
            </ul>

            <h3 id="data-use">How We Use Your Data</h3>
            <p>We use your data solely to:</p>
            <ul>
              <li>Provide and maintain the screenshot API service</li>
              <li>Authenticate your requests and manage your account</li>
              <li>Process payments and manage subscriptions</li>
              <li>Monitor usage to prevent abuse and ensure fair usage</li>
              <li>Send essential service notifications (security alerts, payment confirmations)</li>
              <li>Respond to your support requests</li>
            </ul>
            <p>We do not sell, rent, or share your data with third parties for marketing purposes.</p>

            <h3 id="cookies">Cookies and Local Storage</h3>
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
              <Link to="/" className="logo" style={{ marginBottom: '12px' }}><img src="/logo.svg" alt="ShotlyAPI" style={{width: '32px', height: '32px', borderRadius: '8px'}} />ShotlyAPI</Link>
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
