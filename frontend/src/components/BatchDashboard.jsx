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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', minHeight: 0 }}>
      
      {/* Aggregate Charts */}
      <div className="results-grid" style={{ flexShrink: 0 }}>
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px' }}>
          <h3 style={{ marginBottom: '8px', fontSize: '0.95rem' }}>Prediction Status</h3>
          <div style={{ height: '140px', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Doughnut data={donutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#e2e8f0', boxWidth: 12, font: { size: 11 } } } } }} />
          </div>
        </div>
        
        <div className="glass-panel" style={{ padding: '12px' }}>
          <h3 style={{ marginBottom: '8px', fontSize: '0.95rem' }}>Redshift Distribution</h3>
          <div style={{ height: '140px', width: '100%' }}>
            <Bar 
              data={histogramData} 
              options={{ 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } },
                scales: { 
                  x: { title: { display: true, text: 'Redshift (z)', color: '#94a3b8', font: { size: 10 } }, ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } },
                  y: { title: { display: true, text: 'Count', color: '#94a3b8', font: { size: 10 } }, ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: '14px', overflow: 'hidden' }}>
        <h3 style={{ marginBottom: '10px', fontSize: '0.95rem', flexShrink: 0 }}>Galaxy Catalog ({total} objects)</h3>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '8px 8px', position: 'sticky', top: 0, background: 'var(--bg-card)', backdropFilter: 'blur(12px)', fontSize: '0.8rem' }}>Index</th>
                <th style={{ padding: '8px 8px', position: 'sticky', top: 0, background: 'var(--bg-card)', backdropFilter: 'blur(12px)', fontSize: '0.8rem' }}>Magnitudes (u,g,r,i,z)</th>
                <th style={{ padding: '8px 8px', position: 'sticky', top: 0, background: 'var(--bg-card)', backdropFilter: 'blur(12px)', fontSize: '0.8rem' }}>Predicted z</th>
                <th style={{ padding: '8px 8px', position: 'sticky', top: 0, background: 'var(--bg-card)', backdropFilter: 'blur(12px)', fontSize: '0.8rem' }}>Status</th>
                <th style={{ padding: '8px 8px', position: 'sticky', top: 0, background: 'var(--bg-card)', backdropFilter: 'blur(12px)', fontSize: '0.8rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '8px 8px', fontSize: '0.85rem' }}>#{i+1}</td>
                  <td style={{ padding: '8px 8px', fontSize: '0.8rem' }}>
                    {['u','g','r','i','z'].map(k => originalData[i][k]?.toFixed(1)).join(', ')}
                  </td>
                  <td style={{ padding: '8px 8px', fontWeight: '600', fontSize: '0.85rem' }}>{r.redshift.z_mode.toFixed(3)}</td>
                  <td style={{ padding: '8px 8px' }}>
                    <span className={`status-badge ${r.status === 'success' ? 'status-success' : 'status-failure'}`} style={{ padding: '2px 6px', fontSize: '0.7rem' }}>
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '8px 8px' }}>
                    <button onClick={() => setSelectedRowIndex(i)} className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.78rem', width: 'auto' }}>
                      Deep Dive
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Dive Modal */}
      {selectedRowIndex !== null && (
        <div className="modal-overlay" onClick={() => setSelectedRowIndex(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Galaxy #{selectedRowIndex + 1} Deep Dive</h2>
              <button onClick={() => setSelectedRowIndex(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <X size={20} />
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
