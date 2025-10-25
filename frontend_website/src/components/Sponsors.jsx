import React from 'react';

const sponsors = [
  {
    name: "Rolex",
    logo: "⌚",
    description: "Luxury Swiss watches since 1905",
    type: "luxury",
    website: "https://www.rolex.com"
  },
  {
    name: "Richard Mille",
    logo: "⏱️",
    description: "High-end technical watchmaking",
    type: "luxury",
    website: "https://www.richardmille.com"
  },
  {
    name: "Omega",
    logo: "🌐",
    description: "Swiss precision and Olympic timekeeping",
    type: "luxury",
    website: "https://www.omegawatches.com"
  },
  {
    name: "Patek Philippe",
    logo: "🏅",
    description: "Prestigious watchmaker with timeless designs",
    type: "luxury",
    website: "https://www.patek.com"
  }
];

export default function Sponsors() {
  return (
    <div className="sponsors-section">
      <div className="sponsors-title">
        <h3>Our Trusted Partners</h3>
        <p className="muted">Supporting safe and responsible gambling</p>
      </div>
      
      <div className="sponsors-grid">
        {sponsors.map((sponsor, index) => (
          <div 
            key={index} 
            className="sponsor-card" 
            onClick={() => window.location.hash = `#sponsor/${sponsor.name.toLowerCase().replace(/\s+/g, '-')}`}
            role="button"
            tabIndex={0}
          >
            <div className="sponsor-logo">{sponsor.logo}</div>
            <div className="sponsor-info">
              <h4>{sponsor.name}</h4>
              <p className="muted">{sponsor.description}</p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
              {sponsor.website && (
                <a
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="btn ghost"
                  style={{ padding: '6px 10px' }}
                >
                  Visit
                </a>
              )}
              <div className="view-more">View →</div>
            </div>
          </div>
        ))}
      </div>

      <style jsx="true">{`
        .sponsors-section {
          padding: 40px 20px;
          background: linear-gradient(0deg, rgba(255,255,255,0.02), transparent);
          border-top: 1px solid rgba(255,255,255,0.03);
          margin-top: 40px;
        }

        .sponsors-title {
          text-align: center;
          margin-bottom: 32px;
        }

        .sponsors-title h3 {
          margin: 0;
          font-size: 24px;
          background: linear-gradient(90deg, #4ea8ff, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sponsors-title p {
          margin: 8px 0 0 0;
        }

        .sponsors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .sponsor-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.2s ease;
        }

        .sponsor-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(2,6,23,0.3);
          background: linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
        }

        .sponsor-logo {
          font-size: 32px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
          border-radius: 12px;
        }

        .sponsor-info h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
          color: #e6eef8;
        }

        .sponsor-info p {
          margin: 0;
          font-size: 13px;
        }

        @media (max-width: 640px) {
          .sponsors-section {
            padding: 32px 16px;
          }

          .sponsors-grid {
            grid-template-columns: 1fr;
          }

          .sponsor-card {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}