import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { UploadCloud, Loader2 } from 'lucide-react';

const BatchUploader = ({ onBatchParsed, loading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    if (!file) return;
    setError(null);
    setIsParsing(true);
    setProgress(0);

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("Please upload a valid CSV file.");
      setIsParsing(false);
      return;
    }

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: header => header.replace(/\uFEFF/g, '').trim().toLowerCase(),
      step: function () {
        setProgress(prev => Math.min(prev + 5, 95));
      },
      complete: function(results) {
        // Guard against missing meta fields (e.g., empty file or parse error)
        const fields = results?.meta?.fields?.map(header => header.replace(/\uFEFF/g, '').trim().toLowerCase()) ?? [];
        const requiredCols = ['u', 'g', 'r', 'i', 'z'];
        const missingCols = requiredCols.filter(col => !fields.includes(col));
        if (missingCols.length > 0) {
          console.warn('Missing required columns detected:', missingCols);
          setError(`Missing required columns: ${missingCols.join(', ')}. The CSV header must include u, g, r, i, z.`);
          setIsParsing(false);
          return;
        }
        // If fields array is empty, fall back to checking first data row keys
        const dataRows = results.data || [];
        if (fields.length === 0 && dataRows.length > 0) {
          const firstRow = dataRows[0];
          const missing = requiredCols.filter(col => !(col in firstRow));
          if (missing.length > 0) {
            console.warn('Missing columns based on first row:', missing);
            setError(`Missing required columns: ${missing.join(', ')}. The CSV header must include u, g, r, i, z.`);
            setIsParsing(false);
            return;
          }
        }
        onBatchParsed(dataRows);
        setProgress(100);
        setIsParsing(false);
      },
      error: function(error) {
        setError("Error parsing CSV file: " + error.message);
        setIsParsing(false);
      }
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 24px' }}>
      <h2 style={{ marginBottom: '16px', fontSize: '1.5rem' }}>Upload Galaxy Catalog</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Upload a CSV file containing <strong>u, g, r, i, z</strong> columns to process thousands of galaxies at once.
      </p>
      
      <div 
        className={`upload-zone ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragActive ? 'var(--accent-purple)' : 'var(--border-glass)'}`,
          borderRadius: '16px',
          padding: '60px 24px',
          cursor: loading ? 'not-allowed' : 'pointer',
          background: dragActive ? 'rgba(139, 92, 246, 0.1)' : 'rgba(0,0,0,0.2)',
          transition: 'all 0.2s ease',
          opacity: loading ? 0.7 : 1
        }}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".csv"
          onChange={handleChange}
          style={{ display: 'none' }}
          disabled={loading}
        />
        
        {loading || isParsing ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: 'var(--accent-purple)' }}>
            <Loader2 className="spinner" size={48} />
            <div style={{ fontWeight: '600' }}>Processing Massive Dataset...</div>
            <div style={{ width: '80%', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, background: 'var(--accent-purple)', height: '8px', transition: 'width 0.2s' }} />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)' }}>
            <UploadCloud size={48} style={{ color: dragActive ? 'var(--accent-purple)' : 'inherit' }} />
            <div>
              <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Click to upload</span> or drag and drop
            </div>
            <div style={{ fontSize: '0.875rem' }}>CSV format only</div>
          </div>
        )}
      </div>

      {error && (
        <div style={{ color: 'var(--failure)', marginTop: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default BatchUploader;
