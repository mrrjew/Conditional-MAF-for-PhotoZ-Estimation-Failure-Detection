import React, { useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import ResultsDashboard from './ResultsDashboard';
import { X } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const BatchDashboard = ({ results, originalData }) => {
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  
  // Aggregate stats
  const total = results.length;
  const successes = results.filter(r => r.status === 'success').length;
  const failures = total - successes;
  
  // Donut chart data
  const donutData = {
    labels: ['Success', 'Failure'],
    datasets: [{
      data: [successes, failures],
      backgroundColor: ['rgba(16, 185, 129, 0.6)', 'rgba(239, 68, 68, 0.6)'],
      borderColor: ['#10b981', '#ef4444'],
      borderWidth: 1,
    }]
  };

  // Histogram data (Redshift distribution)
  const zModes = results.map(r => r.redshift.z_mode);
  const zMax = Math.max(...zModes, 1);
  const bins = 20;
  const binWidth = zMax / bins;
  const histogramCounts = new Array(bins).fill(0);
  const histogramLabels = [];

  for (let i = 0; i < bins; i++) {
    histogramLabels.push((i * binWidth).toFixed(2));
  }

  zModes.forEach(z => {
    const binIndex = Math.min(Math.floor(z / binWidth), bins - 1);
    histogramCounts[binIndex]++;
  });

  const histogramData = {
    labels: histogramLabels,
    datasets: [{
      label: 'Number of Galaxies',
      data: histogramCounts,
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: '#3b82f6',
      borderWidth: 1,
    }]
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Aggregate Charts */}
      <div className="results-grid">
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ marginBottom: '16px' }}>Prediction Status</h3>
          <div style={{ height: '200px', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Doughnut data={donutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#e2e8f0' } } } }} />
          </div>
        </div>
        
        <div className="glass-panel">
          <h3 style={{ marginBottom: '16px' }}>Redshift Distribution</h3>
          <div style={{ height: '200px', width: '100%' }}>
            <Bar 
              data={histogramData} 
              options={{ 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } },
                scales: { 
                  x: { title: { display: true, text: 'Redshift (z)', color: '#94a3b8' }, ticks: { color: '#94a3b8' }, grid: { display: false } },
                  y: { title: { display: true, text: 'Count', color: '#94a3b8' }, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel" style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
        <h3 style={{ marginBottom: '16px' }}>Galaxy Catalog ({total} objects)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px 8px', position: 'sticky', top: 0, background: 'var(--bg-card)', backdropFilter: 'blur(12px)' }}>Index</th>
              <th style={{ padding: '12px 8px', position: 'sticky', top: 0, background: 'var(--bg-card)', backdropFilter: 'blur(12px)' }}>Magnitudes (u,g,r,i,z)</th>
              <th style={{ padding: '12px 8px', position: 'sticky', top: 0, background: 'var(--bg-card)', backdropFilter: 'blur(12px)' }}>Predicted z</th>
              <th style={{ padding: '12px 8px', position: 'sticky', top: 0, background: 'var(--bg-card)', backdropFilter: 'blur(12px)' }}>Status</th>
              <th style={{ padding: '12px 8px', position: 'sticky', top: 0, background: 'var(--bg-card)', backdropFilter: 'blur(12px)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 8px' }}>#{i+1}</td>
                <td style={{ padding: '12px 8px', fontSize: '0.875rem' }}>
                  {['u','g','r','i','z'].map(k => originalData[i][k]?.toFixed(1)).join(', ')}
                </td>
                <td style={{ padding: '12px 8px', fontWeight: '600' }}>{r.redshift.z_mode.toFixed(3)}</td>
                <td style={{ padding: '12px 8px' }}>
                  <span className={`status-badge ${r.status === 'success' ? 'status-success' : 'status-failure'}`} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                    {r.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '12px 8px' }}>
                  <button onClick={() => setSelectedRowIndex(i)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.875rem', width: 'auto' }}>
                    Deep Dive
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Deep Dive Modal */}
      {selectedRowIndex !== null && (
        <div className="modal-overlay" onClick={() => setSelectedRowIndex(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2>Galaxy #{selectedRowIndex + 1} Deep Dive</h2>
              <button onClick={() => setSelectedRowIndex(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <ResultsDashboard results={results[selectedRowIndex]} />
          </div>
        </div>
      )}
      
    </div>
  );
};

export default BatchDashboard;
