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

    if (file.size === 0) {
      setError("The uploaded CSV file is empty (0 bytes). Please upload a file containing galaxy entries.");
      setIsParsing(false);
      return;
    }

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("Please upload a valid CSV file (.csv).");
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
        const validRows = (results.data || []).filter(row => 
          row && Object.values(row).some(v => v !== null && v !== undefined && String(v).trim() !== '')
        );

        if (validRows.length === 0) {
          setError("The uploaded CSV file contains no data entries below the header row.");
          setIsParsing(false);
          return;
        }

        const dataRows = validRows;
        const fields = results?.meta?.fields?.map(h => h.replace(/\uFEFF/g, '').trim().toLowerCase()) ?? [];
        const requiredCols = ['u', 'g', 'r', 'i', 'z'];
        
        // Helper to find column matching band name (e.g. 'u', 'mag_u', 'u_band', 'dered_u', 'modelmag_u')
        const findColumn = (band, availableFields) => {
          if (availableFields.includes(band)) return band;
          const match = availableFields.find(f => 
            f === `mag_${band}` || 
            f === `band_${band}` || 
            f === `dered_${band}` ||
            f.endsWith(`_${band}`) || 
            f.startsWith(`${band}_`)
          );
          return match || null;
        };

        const colMapping = {};
        const missingCols = [];

        requiredCols.forEach(band => {
          const matchedField = findColumn(band, fields);
          if (matchedField) {
            colMapping[band] = matchedField;
          } else {
            missingCols.push(band);
          }
        });

        // If direct/fuzzy matching failed, check if file is headerless with numeric values in header line
        if (missingCols.length > 0) {
          const headerIsNumeric = fields.length >= 5 && fields.slice(0, 5).every(f => !isNaN(parseFloat(f)));
          
          if (headerIsNumeric) {
            Papa.parse(file, {
              header: false,
              dynamicTyping: true,
              skipEmptyLines: true,
              complete: function(rawResults) {
                const rows = (rawResults.data || []).filter(r => Array.isArray(r) && r.length >= 5);
                if (rows.length === 0) {
                  setError("CSV format unrecognized. Required columns: u, g, r, i, z.");
                  setIsParsing(false);
                  return;
                }
                const formattedData = rows.map(r => ({
                  u: parseFloat(r[0]) || 0,
                  g: parseFloat(r[1]) || 0,
                  r: parseFloat(r[2]) || 0,
                  i: parseFloat(r[3]) || 0,
                  z: parseFloat(r[4]) || 0
                }));
                onBatchParsed(formattedData);
                setProgress(100);
                setIsParsing(false);
              }
            });
            return;
          }

          setError(`Missing required columns: ${missingCols.join(', ')}. The CSV header must include u, g, r, i, z (e.g. u,g,r,i,z or mag_u,mag_g...).`);
          setIsParsing(false);
          return;
        }

        // Map column names to standard u, g, r, i, z
        const normalizedRows = dataRows.map(row => ({
          u: parseFloat(row[colMapping.u]) || 0,
          g: parseFloat(row[colMapping.g]) || 0,
          r: parseFloat(row[colMapping.r]) || 0,
          i: parseFloat(row[colMapping.i]) || 0,
          z: parseFloat(row[colMapping.z]) || 0
        }));

        onBatchParsed(normalizedRows);
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
    <div className="glass-panel" style={{ textAlign: 'center', padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h2 style={{ marginBottom: '10px', fontSize: '1.3rem' }}>Upload Galaxy Catalog</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
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
          padding: '40px 24px',
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
