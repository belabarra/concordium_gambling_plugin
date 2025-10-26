import React from 'react';

export default function Rolex() {
  return (
    <div className="sponsor-page">
      <div className="sponsor-header">
        <div className="sponsor-logo">⌚</div>
        <h1>Rolex</h1>
        <p className="tagline">Iconic Swiss watchmaking since 1905</p>
      </div>

      <div className="sponsor-content">
        <section>
          <h2>About Rolex</h2>
          <p>Rolex is renowned for its precision, durability, and timeless design. The company has a long history of innovation in watchmaking and is synonymous with quality and prestige.</p>
        </section>

        <section>
          <h2>Highlights</h2>
          <ul className="features-list">
            <li>✓ Oyster case and waterproof innovations</li>
            <li>✓ In-house movements and chronometer certification</li>
            <li>✓ Longstanding support for sport and exploration</li>
          </ul>
        </section>

        <section>
          <h2>Contact & Website</h2>
          <div className="contact-info">
            <p>🌐 Website: <a href="https://www.rolex.com" target="_blank" rel="noopener noreferrer">www.rolex.com</a></p>
          </div>
        </section>
      </div>
    </div>
  );
}
