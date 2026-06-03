import React from 'react';
import StatusCard from './StatusCard';
import RedshiftCard from './RedshiftCard';
import CosmologyCard from './CosmologyCard';
import ProbabilityChart from './ProbabilityChart';

const ResultsDashboard = ({ results }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="results-grid">
        <StatusCard 
          status={results.status} 
          score={results.failure_score} 
          warning={results.warning} 
        />
        <RedshiftCard redshift={results.redshift} />
      </div>

      {results.status === 'success' && results.cosmology && (
        <CosmologyCard cosmology={results.cosmology} />
      )}

      <div className="glass-panel">
        <h3 style={{ marginBottom: '16px' }}>Redshift Probability Distribution</h3>
        <ProbabilityChart pdf={results.pdf} />
      </div>
    </div>
  );
};

export default ResultsDashboard;
