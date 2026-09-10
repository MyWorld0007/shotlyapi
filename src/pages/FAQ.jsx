import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useTheme, ThemeToggle } from '../lib/ThemeToggle'
import Navbar from '../components/Navbar'

const faqs = [
  { q: 'What is a screenshot API?', a: 'A screenshot API is a service that programmatically captures visual snapshots of web pages. Instead of running a headless browser yourself, you send a simple HTTP request and receive a high-quality image or PDF of the target website in return.' },
  { q: 'How does ShotlyAPI work?', a: 'You send a GET request to our API endpoint with the target URL and your API key. Our rendering engine loads the page in a real Chromium browser, captures the screenshot, and returns the image within seconds. Repeat requests are served instantly from R2 cache.' },
  { q: 'Is there a free tier?', a: 'Yes. Our free tier includes 20 screenshots at no cost, with no credit card required. It is perfect for testing, personal projects, and small-scale usage. You can upgrade to a paid plan anytime for higher limits.' },
  { q: 'What image formats are supported?', a: 'ShotlyAPI supports PNG, JPEG, and WEBP image formats, plus PDF document export. You can specify the desired format via the format query parameter in your API request.' },
  { q: 'How fast is the API?', a: 'Our average response time is under 3 seconds for fresh captures. Cached screenshots return in under 500ms. Our global edge network ensures low latency regardless of your geographic location.' },
  { q: 'Can I capture full-page screenshots?', a: 'Yes! ShotlyAPI captures the entire scrollable page, not just the visible viewport. Use the full_page=true parameter to capture long landing pages, articles, or documentation in a single screenshot.' },
  { q: 'Can you block cookie banners and ads?', a: 'Yes! Use block_ads=true to automatically strip cookie banners, GDPR consent popups, chat widgets, and ads before the screenshot is taken. This feature is available on the Growth plan and above.' },
  { q: 'Can I inject custom CSS or JavaScript?', a: 'Yes. Use the css parameter to inject custom styles, or the js parameter to execute JavaScript on the page before capture. This is available on the Starter plan and above.' },
  { q: 'What is the Trial plan?', a: 'The Trial plan is a one-time Rs.99 payment that gives you 100 screenshots for 7 days. It includes PNG and JPEG formats, Mobile/Tablet/Desktop viewports, and full page capture. After 7 days, you can upgrade to a paid plan to continue using the API.' },
  { q: 'What happens after my Trial expires?', a: 'After 7 days, your account will no longer be able to take screenshots. You can upgrade to any paid plan (Starter, Growth, or Pro) at any time to continue using the API with higher limits and more features.' },
  { q: 'Do you offer bulk screenshot processing?', a: 'Yes. The Pro plan includes bulk screenshots, allowing you to process up to 50 URLs in a single POST request. Perfect for SEO audits and competitive analysis.' },
  { q: 'Is my data secure?', a: 'All API requests require authentication via API key. Passwords are hashed with SHA-256 and a unique salt. All communication uses HTTPS/TLS encryption. We monitor for suspicious activity and rate-limit requests to prevent abuse.' },
]

function FAQItem({ item, isOpen, onClick }) {
  return (
    <div className="faq-item">
      <button className="faq-question" onClick={onClick} type="button">
        {item.q}
        <span className="faq-toggle">{isOpen ? '\u2212' : '+'}</span>
      </button>
      {isOpen && <div className="faq-answer">{item.a}</div>}
    </div>
  )
}

export default function FAQ() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <div>
      <Navbar />

      <section className="faq-page">
        <div className="container">
          <h1 className="section-title">Frequently Asked Questions</h1>
          <p className="section-sub">Everything you need to know about ShotlyAPI.</p>

          <div className="faq-list" style={{ marginTop: '40px' }}>
            {faqs.map((item, index) => (
              <FAQItem
                key={item.q}
                item={item}
                isOpen={openFaq === index}
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
              />
            ))}
          </div>

          <div className="faq-contact" style={{ marginTop: '48px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '12px' }}>Still have questions?</h3>
            <p style={{ color: 'var(--text-mute)', marginBottom: '20px' }}>We are here to help. Reach out to us anytime.</p>
            <Link to="/signup" className="btn btn-primary btn-lg">Get Started for Rs.99</Link>
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <Link to="/" className="logo" style={{ marginBottom: '12px' }}>
                <img src="/logo.svg" alt="ShotlyAPI" style={{width: '32px', height: '32px', borderRadius: '8px'}} />
                ShotlyAPI
              </Link>
              <p>The fastest way to capture website screenshots and PDFs via API.</p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <Link to="/" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>Home</Link>
              <Link to="/playground" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>Capture Studio</Link>
              <a href="#pricing" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>Pricing</a>
            </div>
            <div className="footer-col">
              <h4>Developers</h4>
              <Link to="/docs" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>API Docs</Link>
              <a href="https://api.shotlyapi.in/health">API Status</a>
              <a href="https://github.com/MyWorld0007/shotlyapi">GitHub</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <Link to="/privacy" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>Privacy Policy</Link>
              <Link to="/terms" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>Terms & Conditions</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>{'\u00A9'} 2026 ShotlyAPI. Built with Cloudflare Workers, D1, and R2.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
