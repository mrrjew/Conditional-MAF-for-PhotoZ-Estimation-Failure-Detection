import React from 'react';
import { Globe2, HelpCircle } from 'lucide-react';

const CosmologyCard = ({ cosmology }) => {
  const formatLightYears = (mpc) => {
    const mly = mpc * 3.26156;
    if (mly >= 1000) {
      return `${(mly / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} Billion ly`;
    }
    return `${mly.toLocaleString(undefined, { maximumFractionDigits: 1 })} Million ly`;
  };

  const tooltips = {
    luminosity: "Distance derived from how faint the galaxy appears, accounting for spatial expansion.",
    comoving: "Real physical distance measured along a spatial slice today, factoring out cosmic expansion.",
    lookback: "How long ago the emitted light left the galaxy to reach our telescopes.",
    recession: "Apparent speed at which the galaxy recedes from Earth due to Hubble expansion."
  };

  return (
    <div className="glass-panel">
      <div className="metric-title" style={{ marginBottom: '10px' }}>
        <Globe2 size={15} />
        Cosmological Parameters
      </div>
      <div className="cosmo-grid">
        <div className="metric-card">
          <div className="metric-title">
            <span>Luminosity Distance</span>
            <div className="tooltip-container">
              <HelpCircle size={13} className="tooltip-icon" />
              <div className="tooltip-box">{tooltips.luminosity}</div>
            </div>
          </div>
          <div className="metric-value">
            {cosmology.luminosity_distance_mpc.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            <span className="metric-unit">Mpc</span>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400, marginTop: '2px' }}>
              ≈ {formatLightYears(cosmology.luminosity_distance_mpc)}
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-title">
            <span>Comoving Distance</span>
            <div className="tooltip-container">
              <HelpCircle size={13} className="tooltip-icon" />
              <div className="tooltip-box">{tooltips.comoving}</div>
            </div>
          </div>
          <div className="metric-value">
            {cosmology.comoving_distance_mpc.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            <span className="metric-unit">Mpc</span>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400, marginTop: '2px' }}>
              ≈ {formatLightYears(cosmology.comoving_distance_mpc)}
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-title">
            <span>Lookback Time</span>
            <div className="tooltip-container">
              <HelpCircle size={13} className="tooltip-icon" />
              <div className="tooltip-box">{tooltips.lookback}</div>
            </div>
          </div>
          <div className="metric-value">
            {cosmology.lookback_time_gyr.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            <span className="metric-unit">Gyr</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-title">
            <span>Recession Speed</span>
            <div className="tooltip-container">
              <HelpCircle size={13} className="tooltip-icon" />
              <div className="tooltip-box tooltip-box-left">{tooltips.recession}</div>
            </div>
          </div>
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
