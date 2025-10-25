import React from 'react';

export default function Omega() {
  return (
    <div className="sponsor-page">
      <div className="sponsor-header">
        <div className="sponsor-logo">🌐</div>
        <h1>Omega</h1>
        <p className="tagline">Trusted timekeeper for sports and exploration</p>
      </div>

      <div className="sponsor-content">
        <section>
          <h2>About Omega</h2>
          <p>Omega is a Swiss watchmaker known for precision, innovation and a strong connection to sport timekeeping, space exploration and cinematic partnerships.</p>
        </section>

        <section>
          <h2>Notable Achievements</h2>
          <ul className="features-list">
            <li>✓ Official Olympic timekeeper</li>
            <li>✓ Chosen for NASA space missions</li>
            <li>✓ Seamaster and Speedmaster icons</li>
          </ul>
        </section>

        <section>
          <h2>Contact & Website</h2>
          <div className="contact-info">
            <p>🌐 Website: <a href="https://www.omegawatches.com" target="_blank" rel="noopener noreferrer">www.omegawatches.com</a></p>
          </div>
        </section>
      </div>
    </div>
  );
}
