import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function TermsConditions() {
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
              <li><a href="#account-terms">Account Terms</a></li>
              <li><a href="#api-usage">API Usage</a></li>
              <li><a href="#acceptable-use">Acceptable Use</a></li>
              <li><a href="#payment-terms">Payment Terms</a></li>
              <li><a href="#intellectual-property">Intellectual Property</a></li>
              <li><a href="#termination">Termination</a></li>
              <li><a href="#disclaimers">Disclaimers</a></li>
              <li><a href="#limitation-of-liability">Limitation of Liability</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </aside>

          <main className="docs-content">
            <h1>Terms & Conditions</h1>
            <p className="effective-date">Effective date: September 4, 2026</p>

            <section id="introduction">
              <h3>Introduction</h3>
              <p>
                These Terms govern your use of ShotlyAPI, a screenshot capture API operated by
                ShotlyAPI ("we", "us", or "our"). By creating an account or making any API request,
                you agree to be bound by these Terms. If you do not agree, do not use the service.
              </p>
            </section>

            <section id="account-terms">
              <h3>Account Terms</h3>
              <p>
                To use ShotlyAPI you must register an account with a valid email address. You are
                responsible for maintaining the confidentiality of your account credentials and for
                all activity under your account. You must be at least 18 years old and authorised to
                enter into a binding agreement. You agree to provide accurate information and to
                keep it current.
              </p>
            </section>

            <section id="api-usage">
              <h3>API Usage</h3>
              <p>
                Each subscription plan defines a monthly request quota and a per-minute rate limit.
                Usage in excess of your plan's quota may be rejected or billed at overage rates at
                our discretion. You must include a valid API key with every request, and you must
                not attempt to circumvent rate limits, quotas, or access controls. We may modify
                plan limits with reasonable advance notice.
              </p>
            </section>

            <section id="acceptable-use">
              <h3>Acceptable Use</h3>
              <p>You agree not to use ShotlyAPI to:</p>
              <ul>
                <li>Capture content from sites you do not have permission to access;</li>
                <li>Support illegal activities, including but not limited to sites involved in piracy, phishing, or malware distribution;</li>
                <li>Scrape, harvest, or redistribute copyrighted material without authorisation;</li>
                <li>Overwhelm, stress-test, or attempt to disable the service or any third-party system;</li>
                <li>Resell or sublicense access to the API without our written consent.</li>
              </ul>
              <p>
                Violations may result in immediate suspension of your API key and account, without
                refund.
              </p>
            </section>

            <section id="payment-terms">
              <h3>Payment Terms</h3>
              <p>
                Paid plans are billed in advance through Razorpay. You authorise us to charge your
                selected payment method for recurring subscription fees until you cancel. Fees are
                non-refundable except where required by law. Refund requests for billing errors must
                be submitted within 30 days of the charge by emailing
                <a href="mailto:legal@shotlyapi.in"> legal@shotlyapi.in</a>. We may change pricing
                with at least 30 days' notice; changes take effect on your next renewal.
              </p>
            </section>

            <section id="intellectual-property">
              <h3>Intellectual Property</h3>
              <p>
                We retain all rights, title, and interest in the ShotlyAPI service, including
                software, documentation, and trademarks. Screenshots generated via the API are
                output you commission; you are responsible for ensuring you have the rights to the
                content captured. You retain ownership of any data you submit to the service.
              </p>
            </section>

            <section id="termination">
              <h3>Termination</h3>
              <p>
                You may cancel your account at any time from the dashboard. We may suspend or
                terminate your account immediately if you breach these Terms or pose a risk to the
                service. Upon termination, your API key is deactivated and we may delete your data
                after the retention period described in our Privacy Policy. Sections that by their
                nature should survive termination will remain in effect.
              </p>
            </section>

            <section id="disclaimers">
              <h3>Disclaimers</h3>
              <p>
                The service is provided "as is" and "as available" without warranties of any kind,
                whether express or implied. We do not guarantee that the service will be
                uninterrupted, error-free, or secure, or that screenshots will be captured
                accurately or completely. Any reliance on the service is at your own risk.
              </p>
            </section>

            <section id="limitation-of-liability">
              <h3>Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by law, in no event shall ShotlyAPI be liable for
                any indirect, incidental, special, or consequential damages, or any loss of data,
                revenue, or profits, arising out of or related to your use of the service. Our
                total aggregate liability for any claim shall not exceed the amount you paid us in
                the 12 months preceding the claim.
              </p>
            </section>

            <section id="contact">
              <h3>Contact</h3>
              <p>
                These Terms are governed by the laws of India, without regard to conflict-of-law
                principles, and the courts of Bengaluru shall have exclusive jurisdiction over any
                dispute. For questions about these Terms, contact us at
                <a href="mailto:legal@shotlyapi.in"> legal@shotlyapi.in</a>.
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
