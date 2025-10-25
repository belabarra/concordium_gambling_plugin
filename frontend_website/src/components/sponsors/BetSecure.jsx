import React from 'react';

export default function BetSecure() {
  return (
    <div className="sponsor-page">
      <div className="sponsor-header">
        <div className="sponsor-logo">🛡️</div>
        <h1>BetSecure</h1>
        <p className="tagline">Your trusted partner in gaming security</p>
      </div>

      <div className="sponsor-content">
        <section>
          <h2>About Us</h2>
          <p>BetSecure is a leading provider of security solutions for online gambling platforms. 
          With over a decade of experience, we protect millions of transactions daily.</p>
        </section>

        <section>
          <h2>Our Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <h3>🔒 Fraud Prevention</h3>
              <p>Real-time transaction monitoring and fraud detection systems</p>
            </div>
            <div className="service-card">
              <h3>🔐 KYC Solutions</h3>
              <p>Advanced identity verification and authentication</p>
            </div>
            <div className="service-card">
              <h3>🛠️ Security Audits</h3>
              <p>Comprehensive platform security assessments</p>
            </div>
          </div>
        </section>

        <section>
          <h2>Why Choose BetSecure?</h2>
          <ul className="features-list">
            <li>✓ 99.99% uptime guarantee</li>
            <li>✓ 24/7 security monitoring</li>
            <li>✓ Compliant with global gaming regulations</li>
            <li>✓ Advanced encryption protocols</li>
          </ul>
        </section>

        <section>
          <h2>Contact Us</h2>
          <div className="contact-info">
            <p>📧 Email: contact@betsecure.example</p>
            <p>📞 Phone: +1 (555) 123-4567</p>
            <p>🌐 Website: <a href="#sponsor/betsecure">betsecure (in-app)</a></p>
          </div>
        </section>
      </div>

      <style jsx="true">{`
        .sponsor-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .sponsor-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .sponsor-logo {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .tagline {
          color: #9fb6d8;
          font-size: 18px;
        }

        section {
          margin-bottom: 40px;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .service-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 12px;
          padding: 20px;
        }

        .features-list {
          list-style: none;
          padding: 0;
        }

        .features-list li {
          margin: 10px 0;
          color: #e6eef8;
        }

        .contact-info {
          background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
          border-radius: 12px;
          padding: 20px;
        }

        .contact-info p {
          margin: 10px 0;
        }

        @media (max-width: 640px) {
          .sponsor-page {
            padding: 20px;
          }
          
          .services-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}