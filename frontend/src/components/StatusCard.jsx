import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const StatusCard = ({ status, score, warning }) => {
  const isSuccess = status === 'success';

  return (
    <div className="glass-panel metric-card">
      <div className="metric-title">
        Prediction Status
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
        <div className={`status-badge ${isSuccess ? 'status-success' : 'status-failure'}`}>
          {isSuccess ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {status.toUpperCase()}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Failure Score</div>
          <div style={{ fontWeight: '600', color: isSuccess ? 'var(--text-primary)' : 'var(--failure)' }}>
            {(score * 100).toFixed(1)}%
          </div>
        </div>
      </div>
      {warning && (
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          background: 'rgba(245, 158, 11, 0.1)', 
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          color: 'var(--warning)',
          fontSize: '0.875rem'
        }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{warning}</span>
        </div>
      )}
    </div>
  );
};

export default StatusCard;
