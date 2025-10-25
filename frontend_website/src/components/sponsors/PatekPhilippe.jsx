import React from 'react';

export default function PatekPhilippe() {
  return (
    <div className="sponsor-page">
      <div className="sponsor-header">
        <div className="sponsor-logo">🏅</div>
        <h1>Patek Philippe</h1>
        <p className="tagline">Mastery in watchmaking and heritage</p>
      </div>

      <div className="sponsor-content">
        <section>
          <h2>About Patek Philippe</h2>
          <p>Patek Philippe is a prestigious Swiss watch manufacturer celebrated for its tradition, complicated movements and enduring investment value.</p>
        </section>

        <section>
          <h2>Expertise</h2>
          <ul className="features-list">
            <li>✓ Grand complications and perpetual calendars</li>
            <li>✓ Hand-finished movements and cases</li>
            <li>✓ Strong collector and auction market</li>
          </ul>
        </section>

        <section>
          <h2>Contact & Website</h2>
          <div className="contact-info">
            <p>🌐 Website: <a href="https://www.patek.com" target="_blank" rel="noopener noreferrer">www.patek.com</a></p>
          </div>
        </section>
      </div>
    </div>
  );
}
