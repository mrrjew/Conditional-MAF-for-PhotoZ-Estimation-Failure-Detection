import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const StatusCard = ({ status, score, warning }) => {
  const isSuccess = status === 'success';

  return (
    <div className="glass-panel metric-card">
      <div className="metric-title">
        Prediction Status
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
        <div className={`status-badge ${isSuccess ? 'status-success' : 'status-failure'}`}>
          {isSuccess ? <CheckCircle size={15} /> : <XCircle size={15} />}
          {status.toUpperCase()}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Failure Score</div>
          <div style={{ fontWeight: '600', fontSize: '1.1rem', color: isSuccess ? 'var(--text-primary)' : 'var(--failure)' }}>
            {(score * 100).toFixed(1)}%
          </div>
        </div>
      </div>
      {warning && (
        <div style={{ 
          marginTop: '8px', 
          padding: '6px 8px', 
          background: 'rgba(245, 158, 11, 0.1)', 
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '6px',
          color: 'var(--warning)',
          fontSize: '0.78rem'
        }}>
          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{warning}</span>
        </div>
      )}
    </div>
  );
};

export default StatusCard;
