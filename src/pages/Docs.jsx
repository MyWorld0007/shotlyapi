import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function Docs() {
  const { user } = useAuth()

  return (
    <>
      <nav>
        <div className="container nav-inner">
          <Link to="/" className="logo">
            <img src="/logo.svg" alt="ShotlyAPI" style={{width: '32px', height: '32px', borderRadius: '8px'}} />
            ShotlyAPI
          </Link>
          <div className="nav-links">
            <a href="/#features">Features</a>
            <Link to="/docs">Docs</Link>
            <a href="/#pricing">Pricing</a>
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-sm">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
                <Link to="/signup" className="btn btn-primary btn-sm">Get API Key</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="docs-page">
        <div className="container">
          <div className="docs-grid">
            <div className="docs-sidebar">
              <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-mute)', marginBottom: '12px' }}>Contents</h3>
              <a href="#getting-started" className="active">Getting Started</a>
              <a href="#authentication">Authentication</a>
              <a href="#take-screenshot">Take Screenshot</a>
              <a href="#parameters">Parameters</a>
              <a href="#response">Response</a>
              <a href="#errors">Error Codes</a>
              <a href="#code-examples">Code Examples</a>
              <a href="#rate-limits">Rate Limits</a>
            </div>

            <div className="docs-content">
              <h2>API Documentation</h2>
              <p>Everything you need to integrate ShotlyAPI into your application.</p>

              <h3 id="getting-started">Getting Started</h3>
              <p>ShotlyAPI is a simple REST API that captures screenshots of any website. All you need is an API key and a URL to capture.</p>
              <p>Your API key is available in your <Link to="/dashboard">dashboard</Link> after signing up.</p>

              <h3 id="authentication">Authentication</h3>
              <p>All API requests require an API key. Pass it as the <code>api_key</code> query parameter:</p>
              <pre>{`https://api.shotlyapi.in/api/screenshot?url=https://example.com&api_key=YOUR_API_KEY`}</pre>

              <h3 id="take-screenshot">Take a Screenshot</h3>
              <p>Makes a GET request to capture a screenshot of any URL.</p>
              <pre>{`curl "https://api.shotlyapi.in/api/screenshot?url=https://example.com&api_key=YOUR_API_KEY" -o screenshot.png`}</pre>

              <h3 id="parameters">Parameters</h3>
              <table>
                <thead>
                  <tr><th>Parameter</th><th>Type</th><th>Required</th><th>Description</th></tr>
                </thead>
                <tbody>
                  <tr><td><code>url</code></td><td>string</td><td>Yes</td><td>The URL to capture (must include http:// or https://)</td></tr>
                  <tr><td><code>api_key</code></td><td>string</td><td>Yes</td><td>Your API key from the dashboard</td></tr>
                </tbody>
              </table>

              <h3 id="response">Response</h3>
              <p>Returns a PNG image (1920x1080) with <code>Content-Type: image/png</code>.</p>
              <pre>{`HTTP/1.1 200 OK
Content-Type: image/png
Content-Length: 22134

(binary PNG data)`}</pre>

              <h3 id="errors">Error Codes</h3>
              <table>
                <thead>
                  <tr><th>Status</th><th>Error</th><th>Description</th></tr>
                </thead>
                <tbody>
                  <tr><td>401</td><td><code>Invalid API key</code></td><td>API key is missing or invalid</td></tr>
                  <tr><td>403</td><td><code>Usage limit exceeded</code></td><td>Monthly screenshot limit reached</td></tr>
                  <tr><td>500</td><td><code>Could not reach screenshot server</code></td><td>Backend server is starting up or unreachable</td></tr>
                  <tr><td>500</td><td><code>Screenshot failed</code></td><td>The URL could not be captured</td></tr>
                </tbody>
              </table>

              <h3 id="code-examples">Code Examples</h3>
              <p><strong>Python:</strong></p>
              <pre>{`import requests

url = "https://api.shotlyapi.in/api/screenshot"
params = {
    "url": "https://example.com",
    "api_key": "YOUR_API_KEY"
}
response = requests.get(url, params=params)

with open("screenshot.png", "wb") as f:
    f.write(response.content)`}</pre>

              <p><strong>JavaScript (Node.js):</strong></p>
              <pre>{`const fs = require('fs');
const https = require('https');

const url = 'https://api.shotlyapi.in/api/screenshot?url=https://example.com&api_key=YOUR_API_KEY';

https.get(url, (res) => {
  const chunks = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    fs.writeFileSync('screenshot.png', Buffer.concat(chunks));
    console.log('Screenshot saved!');
  });
});`}</pre>

              <p><strong>JavaScript (Browser):</strong></p>
              <pre>{`fetch('https://api.shotlyapi.in/api/screenshot?url=https://example.com&api_key=YOUR_API_KEY')
  .then(r => r.blob())
  .then(blob => {
    const url = URL.createObjectURL(blob);
    document.getElementById('screenshot').src = url;
  });`}</pre>

              <h3 id="rate-limits">Rate Limits</h3>
              <table>
                <thead>
                  <tr><th>Plan</th><th>Limit</th><th>Rate</th></tr>
                </thead>
                <tbody>
                  <tr><td>Free</td><td>50/month</td><td>5/minute</td></tr>
                  <tr><td>Starter</td><td>2,000/month</td><td>20/minute</td></tr>
                  <tr><td>Growth</td><td>4,000/month</td><td>30/minute</td></tr>
                  <tr><td>Pro</td><td>10,000/month</td><td>60/minute</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
