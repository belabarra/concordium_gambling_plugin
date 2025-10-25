import React from 'react';

export default function FastPay() {
  return (
    <div className="sponsor-page">
      <div className="sponsor-header">
        <div className="sponsor-logo">💳</div>
        <h1>FastPay</h1>
        <p className="tagline">Lightning-fast, secure payment processing</p>
      </div>

      <div className="sponsor-content">
        <section>
          <h2>About Us</h2>
          <p>FastPay is an innovative payment solutions provider specializing in the gaming industry. 
          We process millions of transactions securely and instantly.</p>
        </section>

        <section>
          <h2>Payment Solutions</h2>
          <div className="services-grid">
            <div className="service-card">
              <h3>⚡ Instant Deposits</h3>
              <p>Real-time deposit processing with multiple payment methods</p>
            </div>
            <div className="service-card">
              <h3>💸 Quick Withdrawals</h3>
              <p>Same-day withdrawals to supported payment methods</p>
            </div>
            <div className="service-card">
              <h3>🌍 Global Support</h3>
              <p>Supporting 50+ currencies and payment methods</p>
            </div>
          </div>
        </section>

        <section>
          <h2>Our Advantages</h2>
          <ul className="features-list">
            <li>✓ Lowest processing fees in the industry</li>
            <li>✓ Advanced fraud protection</li>
            <li>✓ 24/7 payment monitoring</li>
            <li>✓ Instant payment confirmation</li>
          </ul>
        </section>

        <section>
          <h2>Payment Methods</h2>
          <div className="payment-methods">
            <span className="payment-icon">💳 Credit Cards</span>
            <span className="payment-icon">🏦 Bank Transfer</span>
            <span className="payment-icon">📱 Mobile Payment</span>
            <span className="payment-icon">₿ Cryptocurrency</span>
          </div>
        </section>

        <section>
          <h2>Contact Us</h2>
          <div className="contact-info">
            <p>📧 Email: support@fastpay.example</p>
            <p>📞 Phone: +1 (555) 987-6543</p>
            <p>🌐 Website: <a href="#sponsor/fastpay">fastpay (in-app)</a></p>
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

        .payment-methods {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-top: 20px;
        }

        .payment-icon {
          background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 16px;
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