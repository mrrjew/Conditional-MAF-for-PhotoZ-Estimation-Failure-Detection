import React from 'react';
import { Crosshair } from 'lucide-react';

const RedshiftCard = ({ redshift }) => {
  return (
    <div className="glass-panel metric-card">
      <div className="metric-title">
        <Crosshair size={14} />
        Photometric Redshift
      </div>
      <div className="redshift-grid">
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mode (Peak)</div>
          <div className="metric-value">{redshift.z_mode.toFixed(3)}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mean</div>
          <div className="metric-value">{redshift.z_mean.toFixed(3)}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Std Dev</div>
          <div className="metric-value">±{redshift.z_std.toFixed(3)}</div>
        </div>
      </div>
    </div>
  );
};

export default RedshiftCard;
