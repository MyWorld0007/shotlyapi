import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function PrivacyPolicy() {
  const { user } = useAuth();

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
        <div className="docs-grid">
          <aside className="docs-sidebar">
            <h4>Contents</h4>
            <ul>
              <li><a href="#introduction">Introduction</a></li>
              <li><a href="#information-we-collect">Information We Collect</a></li>
              <li><a href="#how-we-use-information">How We Use Information</a></li>
              <li><a href="#data-storage">Data Storage</a></li>
              <li><a href="#cookies">Cookies</a></li>
              <li><a href="#third-party-services">Third-Party Services</a></li>
              <li><a href="#data-security">Data Security</a></li>
              <li><a href="#data-retention">Data Retention</a></li>
              <li><a href="#your-rights">Your Rights</a></li>
              <li><a href="#contact-us">Contact Us</a></li>
            </ul>
          </aside>

          <main className="docs-content">
            <h1>Privacy Policy</h1>
            <p className="effective-date">Effective date: September 4, 2026</p>

            <section id="introduction">
              <h3>Introduction</h3>
              <p>
                ShotlyAPI ("we", "us", or "our") operates a screenshot capture API that allows
                developers to programmatically capture web page screenshots. This Privacy Policy
                explains what information we collect, how we use it, and the choices you have.
                By using ShotlyAPI, you agree to the practices described here.
              </p>
            </section>

            <section id="information-we-collect">
              <h3>Information We Collect</h3>
              <p>We collect the following categories of information:</p>
              <ul>
                <li>
                  <strong>Account information:</strong> your email address and a password (stored
                  as a hashed value) when you register for an account.
                </li>
                <li>
                  <strong>API usage data:</strong> request counts, endpoints called, timestamps,
                  and error logs associated with your API key, used for billing and abuse prevention.
                </li>
                <li>
                  <strong>Payment information:</strong> payments are processed by Razorpay. We do
                  not store your full card number; we retain only the transaction reference and
                  billing status required to manage your subscription.
                </li>
              </ul>
            </section>

            <section id="how-we-use-information">
              <h3>How We Use Information</h3>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, operate, and maintain the ShotlyAPI service;</li>
                <li>Authenticate requests and enforce rate limits per your plan;</li>
                <li>Process payments and manage subscriptions;</li>
                <li>Monitor for abuse, fraud, and security issues;</li>
                <li>Send service notifications, such as quota warnings; and</li>
                <li>Comply with legal obligations.</li>
              </ul>
            </section>

            <section id="data-storage">
              <h3>Data Storage</h3>
              <p>
                Account and API usage metadata is stored in Cloudflare D1, our managed SQL database.
                Rendered screenshot artifacts, when cached, are stored in Cloudflare R2 object
                storage. All data resides within Cloudflare's infrastructure and is transmitted over
                encrypted connections.
              </p>
            </section>

            <section id="cookies">
              <h3>Cookies</h3>
              <p>
                We use a minimal set of cookies to keep you authenticated. Authentication is handled
                via JSON Web Tokens (JWT) stored in an HTTP-only cookie. We do not use third-party
                advertising or tracking cookies. You can disable cookies in your browser, though
                doing so will prevent you from logging in.
              </p>
            </section>

            <section id="third-party-services">
              <h3>Third-Party Services</h3>
              <p>We rely on the following third-party providers to operate the service:</p>
              <ul>
                <li>
                  <strong>Cloudflare</strong> &mdash; hosting, database (D1), object storage (R2),
                  and edge delivery.
                </li>
                <li>
                  <strong>Razorpay</strong> &mdash; payment processing. Razorpay handles your card
                  and UPI details under their own compliance framework.
                </li>
                <li>
                  <strong>Resend</strong> &mdash; transactional email delivery for receipts,
                  quota notices, and security alerts.
                </li>
              </ul>
              <p>
                Each provider processes data under their own privacy policy and only receives the
                information necessary to perform their function.
              </p>
            </section>

            <section id="data-security">
              <h3>Data Security</h3>
              <p>
                We protect your data using industry-standard measures: encrypted transport (TLS),
                hashed passwords, scoped API keys, and least-privilege access controls. API keys
                are shown only once at creation and stored as hashed values. While we work to
                safeguard your information, no method of transmission or storage is completely
                secure.
              </p>
            </section>

            <section id="data-retention">
              <h3>Data Retention</h3>
              <p>
                We retain account and billing records for as long as your account is active, and
                for up to 90 days after account closure for fraud and dispute resolution. Cached
                screenshot artifacts are deleted according to your plan's cache window, or on
                request. API request logs are aggregated and retained for 30 days.
              </p>
            </section>

            <section id="your-rights">
              <h3>Your Rights</h3>
              <p>You have the following rights regarding your personal data:</p>
              <ul>
                <li><strong>Access</strong> &mdash; request a copy of the data we hold about you.</li>
                <li><strong>Delete</strong> &mdash; request deletion of your account and associated data.</li>
                <li><strong>Export</strong> &mdash; receive your account and usage data in a portable format.</li>
                <li><strong>Rectify</strong> &mdash; correct inaccurate account information.</li>
              </ul>
              <p>
                To exercise any of these rights, email privacy@shotlyapi.in from your registered
                address. We respond to verified requests within 30 days.
              </p>
            </section>

            <section id="contact-us">
              <h3>Contact Us</h3>
              <p>
                If you have questions about this Privacy Policy or how we handle your data, contact
                our privacy team at <a href="mailto:privacy@shotlyapi.in">privacy@shotlyapi.in</a>.
              </p>
            </section>
          </main>
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
