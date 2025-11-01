import React, { useState, useEffect } from 'react';
import { horses, jockeys } from '../data/horses';

export default function TrendingPicks() {
  const [trending, setTrending] = useState({
    horses: [],
    jockeys: []
  });

  // Helper to shuffle array
  const shuffle = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  // Update trending picks every 30 seconds
  useEffect(() => {
    const updateTrending = () => {
      // Get 3 random horses and 2 random jockeys
      const shuffledHorses = shuffle([...horses]);
      const shuffledJockeys = shuffle([...jockeys]);
      
      setTrending({
        horses: shuffledHorses.slice(0, 3),
        jockeys: shuffledJockeys.slice(0, 2)
      });
    };

    // Initial update
    updateTrending();

    // Set interval for updates
    const interval = setInterval(updateTrending, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card" style={{
      position: 'fixed',
      left: '20px',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '200px',
      backgroundColor: 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(10px)',
      zIndex: 100
    }}>
      <h4 style={{ margin: '0 0 12px 0' }}>🔥 Trending</h4>
      
      <div>
        <div className="muted" style={{ fontSize: '12px', marginBottom: '4px' }}>HOT HORSES</div>
        {trending.horses.map((horse, i) => (
          <div key={horse.id} style={{
            padding: '6px 10px',
            margin: '4px 0',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.05), transparent)',
            borderRadius: '6px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ opacity: 0.5 }}>#{i + 1}</span>
            <span>{horse.name}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '16px' }}>
        <div className="muted" style={{ fontSize: '12px', marginBottom: '4px' }}>TOP JOCKEYS</div>
        {trending.jockeys.map((jockey, i) => (
          <div key={jockey.id} style={{
            padding: '6px 10px',
            margin: '4px 0',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.05), transparent)',
            borderRadius: '6px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ opacity: 0.5 }}>#{i + 1}</span>
            <span>{jockey.name}</span>
          </div>
        ))}
      </div>

      <div style={{ 
        fontSize: '11px', 
        marginTop: '12px',
        padding: '8px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '6px',
        color: '#9fb6d8'
      }}>
        Trending picks updated every 30 seconds based on recent performance
      </div>
    </div>
  );
}