import React, { useState } from 'react';
import InputForm from './components/InputForm';
import ResultsDashboard from './components/ResultsDashboard';
import './index.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch prediction');
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message || 'An error occurred connecting to the backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="header-title">Cosmic Redshift Explorer</h1>
        <p className="header-subtitle">Advanced Photometric Failure Detection Pipeline</p>
      </header>

      <main className="main-content">
        <section className="input-section">
          <InputForm onSubmit={handleSubmit} loading={loading} />
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
      </main>

      <footer style={{ textAlign: 'center', marginTop: '64px', color: 'var(--text-secondary)', fontSize: '0.875rem', opacity: 0.7 }}>
        <p>Created by Jew Kofi Larbi Danquah</p>
      </footer>
    </div>
  );
}

export default App;
