import React from 'react';
import { Crosshair } from 'lucide-react';

const RedshiftCard = ({ redshift }) => {
  return (
    <div className="glass-panel metric-card">
      <div className="metric-title">
        <Crosshair size={16} />
        Photometric Redshift
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
        <div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Mode (Peak)</div>
          <div className="metric-value">{redshift.z_mode.toFixed(3)}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Mean</div>
          <div className="metric-value">{redshift.z_mean.toFixed(3)}</div>
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Standard Deviation</div>
          <div style={{ fontWeight: '600' }}>±{redshift.z_std.toFixed(3)}</div>
        </div>
      </div>
    </div>
  );
};

export default RedshiftCard;
