import React from 'react';

export default function RichardMille() {
  return (
    <div className="sponsor-page">
      <div className="sponsor-header">
        <div className="sponsor-logo">⏱️</div>
        <h1>Richard Mille</h1>
        <p className="tagline">Innovative, technical haute horlogerie</p>
      </div>

      <div className="sponsor-content">
        <section>
          <h2>About Richard Mille</h2>
          <p>Richard Mille creates avant-garde timepieces that blend cutting-edge materials and engineering with artisanal finishing. Known for bold designs and high performance.</p>
        </section>

        <section>
          <h2>Signature Traits</h2>
          <ul className="features-list">
            <li>✓ Skeletonised movements</li>
            <li>✓ Use of exotic materials (NTPT carbon, titanium)</li>
            <li>✓ Extremely light and robust constructions</li>
          </ul>
        </section>

        <section>
          <h2>Contact & Website</h2>
          <div className="contact-info">
            <p>🌐 Website: <a href="https://www.richardmille.com" target="_blank" rel="noopener noreferrer">www.richardmille.com</a></p>
          </div>
        </section>
      </div>
    </div>
  );
}
