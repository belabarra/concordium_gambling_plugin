import React from 'react';

export default function RaceTrackPro() {
  return (
    <div className="sponsor-page">
      <div className="sponsor-header">
        <div className="sponsor-logo">🏇</div>
        <h1>RaceTrack Pro</h1>
        <p className="tagline">Professional Racing Analytics & Insights</p>
      </div>

      <div className="sponsor-content">
        <section>
          <h2>About Us</h2>
          <p>RaceTrack Pro delivers cutting-edge analytics and insights for horse racing enthusiasts and professionals. 
          Our advanced algorithms process thousands of races to provide accurate predictions and analysis.</p>
        </section>

        <section>
          <h2>Our Analytics</h2>
          <div className="services-grid">
            <div className="service-card">
              <h3>📊 Performance Tracking</h3>
              <p>Detailed horse and jockey performance statistics</p>
            </div>
            <div className="service-card">
              <h3>🎯 Predictions</h3>
              <p>AI-powered race outcome predictions</p>
            </div>
            <div className="service-card">
              <h3>📈 Trend Analysis</h3>
              <p>Historical data and trend analysis</p>
            </div>
          </div>
        </section>

        <section>
          <h2>Key Features</h2>
          <ul className="features-list">
            <li>✓ Real-time race analytics</li>
            <li>✓ Historical performance data</li>
            <li>✓ Weather impact analysis</li>
            <li>✓ Track condition reports</li>
          </ul>
        </section>

        <section>
          <h2>Latest Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Races Analyzed</h4>
              <div className="stat-value">50,000+</div>
            </div>
            <div className="stat-card">
              <h4>Prediction Accuracy</h4>
              <div className="stat-value">87%</div>
            </div>
            <div className="stat-card">
              <h4>Tracks Covered</h4>
              <div className="stat-value">200+</div>
            </div>
          </div>
        </section>

        <section>
          <h2>Contact Us</h2>
          <div className="contact-info">
            <p>📧 Email: info@racetrackpro.example</p>
            <p>📞 Phone: +1 (555) 456-7890</p>
            <p>🌐 Website: <a href="#sponsor/racetrack-pro">racetrack pro (in-app)</a></p>
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

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .stat-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }

        .stat-card h4 {
          margin: 0;
          color: #9fb6d8;
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          margin-top: 10px;
          background: linear-gradient(90deg, #4ea8ff, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
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
          
          .services-grid, .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}