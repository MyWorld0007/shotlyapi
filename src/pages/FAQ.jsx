import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const FAQS = [
  {
    q: 'What is a screenshot API?',
    a: 'A screenshot API lets your application capture an image of a web page programmatically. Instead of rendering pages manually in a browser, you send a single HTTP request with a URL and receive a rendered image back — ready to store, display, or embed.',
  },
  {
    q: 'How does ShotlyAPI work?',
    a: 'You pass a target URL (plus optional options like viewport size, format, and full-page flag) to our endpoint. We spin up a headless browser at the edge, render the page, capture the screenshot, and return the image bytes or a short-lived URL.',
  },
  {
    q: 'Is there a free tier?',
    a: 'Yes. The free plan includes 250 screenshots per month with a small watermark and standard rate limits. No credit card is required to sign up — just generate an API key and start testing.',
  },
  {
    q: 'What image formats are supported?',
    a: 'We support PNG, JPEG, and WebP output. You can set the format using the format query parameter. PNG is best for crisp UI captures, while JPEG and WebP produce smaller files for photography-heavy pages.',
  },
  {
    q: 'How fast is the API?',
    a: 'A typical screenshot is returned in under 3 seconds, with cached responses served in under 500ms. Cold captures of heavy single-page applications may take longer depending on the target site\'s render time.',
  },
  {
    q: 'Can I capture full-page screenshots?',
    a: 'Yes. Set the fullPage parameter to true and we will capture the entire scrollable height of the document, not just the viewport. This is useful for archiving long articles or generating PDF-style previews.',
  },
  {
    q: 'Do you cache screenshots?',
    a: 'We cache rendered screenshots for a configurable duration (default 1 hour on paid plans). Cached responses are served from Cloudflare R2 at the edge for low latency. You can bypass the cache per request using the refresh parameter.',
  },
  {
    q: 'Is my API key secure?',
    a: 'Your API key is shown only once at creation and is stored as a hashed value. Always keep it server-side — never expose it in client-side code or public repositories. If a key is leaked, you can rotate it instantly from the dashboard.',
  },
  {
    q: 'Can I use screenshots commercially?',
    a: 'Yes. Screenshots you generate are yours to use, including in commercial products, provided you have the right to capture the underlying content. ShotlyAPI does not claim ownership over the images your requests produce.',
  },
  {
    q: 'How do I upgrade my plan?',
    a: 'Open the Billing section of your dashboard and choose a higher tier. The upgrade is prorated immediately through Razorpay and your new quota and rate limits apply right away. Downgrades take effect at the next renewal.',
  },
];

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="faq-item">
      <button
        className="faq-question"
        onClick={onToggle}
        aria-expanded={isOpen}
        type="button"
      >
        <span>{item.q}</span>
        <span className="faq-toggle">{isOpen ? '\u2013' : '+'}</span>
      </button>
      {isOpen && (
        <div className="faq-answer">
          <p>{item.a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const { user } = useAuth();
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (i) => setOpenIndex(openIndex === i ? -1 : i);

  return (
    <div className="docs-page">
      <nav className="nav">
        <div className="nav-inner">
          <Link to="/" className="logo">
            <span className="logo-mark">S</span>
            ShotlyAPI
          </Link>
          <div className="nav-links">
            <Link to="/features">Features</Link>
            <Link to="/docs">Docs</Link>
            <Link to="/pricing">Pricing</Link>
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-sm">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
                <Link to="/signup" className="btn btn-primary btn-sm">Get API Key</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="docs-content" style={{ maxWidth: '760px', margin: '0 auto' }}>
          <h1>Frequently Asked Questions</h1>
          <p>Everything you need to know about ShotlyAPI. Can't find an answer? Reach out to our team.</p>

          <div className="faq-list">
            {FAQS.map((item, i) => (
              <FaqItem
                key={i}
                item={item}
                isOpen={openIndex === i}
                onToggle={() => toggle(i)}
              />
            ))}
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="logo">
                <span className="logo-mark">S</span>
                ShotlyAPI
              </div>
              <p>Fast, reliable screenshot API for developers.</p>
            </div>
            <div className="footer-col">
              <h5>Product</h5>
              <Link to="/features">Features</Link>
              <Link to="/pricing">Pricing</Link>
              <Link to="/docs">Docs</Link>
            </div>
            <div className="footer-col">
              <h5>Legal</h5>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms & Conditions</Link>
              <Link to="/faq">FAQ</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} ShotlyAPI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
