import React from 'react';
import { Globe2 } from 'lucide-react';

const CosmologyCard = ({ cosmology }) => {
  const formatLightYears = (mpc) => {
    const mly = mpc * 3.26156;
    if (mly >= 1000) {
      return `${(mly / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} Billion ly`;
    }
    return `${mly.toLocaleString(undefined, { maximumFractionDigits: 1 })} Million ly`;
  };

  return (
    <div className="glass-panel">
      <div className="metric-title" style={{ marginBottom: '16px' }}>
        <Globe2 size={16} />
        Cosmological Parameters
      </div>
      <div className="results-grid" style={{ marginBottom: 0 }}>
        <div className="metric-card">
          <div className="metric-title">Luminosity Distance</div>
          <div className="metric-value">
            {cosmology.luminosity_distance_mpc.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            <span className="metric-unit">Mpc</span>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 400, marginTop: '4px' }}>
              ≈ {formatLightYears(cosmology.luminosity_distance_mpc)}
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-title">Comoving Distance</div>
          <div className="metric-value">
            {cosmology.comoving_distance_mpc.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            <span className="metric-unit">Mpc</span>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 400, marginTop: '4px' }}>
              ≈ {formatLightYears(cosmology.comoving_distance_mpc)}
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-title">Lookback Time</div>
          <div className="metric-value">
            {cosmology.lookback_time_gyr.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            <span className="metric-unit">Gyr</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-title">Recession Speed</div>
          <div className="metric-value">
            {cosmology.recession_speed_kmps.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            <span className="metric-unit">km/s</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CosmologyCard;
