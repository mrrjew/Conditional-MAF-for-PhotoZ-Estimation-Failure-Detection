import React, { useState } from 'react';
import InputForm from './components/InputForm';
import ResultsDashboard from './components/ResultsDashboard';
import BatchUploader from './components/BatchUploader';
import BatchDashboard from './components/BatchDashboard';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('single'); // 'single' or 'batch'
  
  // Single processing state
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Batch processing state
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResults, setBatchResults] = useState(null);
  const [batchError, setBatchError] = useState(null);
  const [originalBatchData, setOriginalBatchData] = useState(null);

  const handleSubmitSingle = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.MODEL_API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) throw new Error('Failed to fetch prediction');
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message || 'An error occurred connecting to the backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchParsed = async (data) => {
    setBatchLoading(true);
    setBatchError(null);
    setOriginalBatchData(data);
    try {
      // Send max 500 at a time for demo purposes to avoid timeout, or just send all
      const response = await fetch(`${import.meta.env.VITE_API_URL}/predict/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: data }),
      });
      
      if (!response.ok) throw new Error('Failed to process batch dataset');
      
      const resData = await response.json();
      setBatchResults(resData.results);
    } catch (err) {
      setBatchError(err.message || 'An error occurred connecting to the backend.');
    } finally {
      setBatchLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="header-title">Cosmic Redshift Explorer</h1>
        <p className="header-subtitle">Advanced Photometric Failure Detection Pipeline</p>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
        <button 
          className={`tab-btn ${activeTab === 'single' ? 'active' : ''}`}
          onClick={() => setActiveTab('single')}
        >
          Single Galaxy
        </button>
        <button 
          className={`tab-btn ${activeTab === 'batch' ? 'active' : ''}`}
          onClick={() => setActiveTab('batch')}
        >
          Batch Analytics
        </button>
      </div>

      <main className="main-content" style={activeTab === 'batch' ? { display: 'block' } : {}}>
        
        {activeTab === 'single' && (
          <>
            <section className="input-section">
              <InputForm onSubmit={handleSubmitSingle} loading={loading} />
            </section>

            <section className="results-section">
              {error && (
                <div className="glass-panel" style={{ borderColor: 'var(--failure)' }}>
                  <h3 style={{ color: 'var(--failure)', marginTop: 0 }}>Connection Error</h3>
                  <p>{error}</p>
                </div>
              )}
              
              {results && !error && (
                <ResultsDashboard results={results} />
              )}

              {!results && !error && !loading && (
                <div className="glass-panel" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '60px 24px' }}>
                  <p>Enter photometric bands to compute redshift and cosmology metrics.</p>
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'batch' && (
          <section className="batch-section">
            {!batchResults && !batchError && (
              <BatchUploader onBatchParsed={handleBatchParsed} loading={batchLoading} />
            )}

            {batchError && (
              <div className="glass-panel" style={{ borderColor: 'var(--failure)', textAlign: 'center' }}>
                <h3 style={{ color: 'var(--failure)', marginTop: 0 }}>Connection Error</h3>
                <p>{batchError}</p>
                <button onClick={() => setBatchError(null)} className="btn-primary" style={{ maxWidth: '200px', margin: '16px auto 0' }}>Try Again</button>
              </div>
            )}

            {batchResults && !batchError && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => { setBatchResults(null); setOriginalBatchData(null); }} className="btn-primary" style={{ width: 'auto' }}>
                    Upload New Dataset
                  </button>
                </div>
                <BatchDashboard results={batchResults} originalData={originalBatchData} />
              </div>
            )}
          </section>
        )}

      </main>

      <footer style={{ textAlign: 'center', marginTop: '64px', color: 'var(--text-secondary)', fontSize: '0.875rem', opacity: 0.7 }}>
        <p>Created by Jew Kofi Larbi Danquah</p>
      </footer>
    </div>
  );
}

export default App;
