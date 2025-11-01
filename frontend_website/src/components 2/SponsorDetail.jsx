import React from 'react';
import Rolex from './sponsors/Rolex';
import RichardMille from './sponsors/RichardMille';
import Omega from './sponsors/Omega';
import PatekPhilippe from './sponsors/PatekPhilippe';

export default function SponsorDetail({ slug }) {
  if (!slug) return null;
  // normalize
  const s = slug.toLowerCase();
  if (s === 'rolex') return <Rolex />;
  if (s === 'richard-mille' || s === 'richardmille') return <RichardMille />;
  if (s === 'omega') return <Omega />;
  if (s === 'patek-philippe' || s === 'patekphilippe' || s === 'patek') return <PatekPhilippe />;

  // Generic fallback page using slug
  const pretty = slug.replace(/-/g, ' ');
  return (
    <div className="sponsor-page">
      <div style={{ padding: 24 }}>
        <h1>{pretty}</h1>
        <p className="muted">Information about {pretty} is not available yet. This is a placeholder sponsor page.</p>
        <div style={{ marginTop: 12 }}>
          <p>We can add a full sponsor profile here on request.</p>
        </div>
      </div>
    </div>
  );
}
