import React, { useState } from 'react';
import { Rocket, Shuffle } from 'lucide-react';

const InputForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    u: 12.5,
    g: 11.2,
    r: 22.1,
    i: 19.5,
    z: 19.0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const randomize = () => {
    // Realistic magnitude ranges for each SDSS band
    const ranges = {
      u: [12, 25],
      g: [11, 24],
      r: [11, 23],
      i: [11, 22],
      z: [11, 22],
    };
    const rand = (min, max) => +(min + Math.random() * (max - min)).toFixed(3);
    setFormData({
      u: rand(...ranges.u),
      g: rand(...ranges.g),
      r: rand(...ranges.r),
      i: rand(...ranges.i),
      z: rand(...ranges.z),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedData = {
      u: parseFloat(formData.u) || 0,
      g: parseFloat(formData.g) || 0,
      r: parseFloat(formData.r) || 0,
      i: parseFloat(formData.i) || 0,
      z: parseFloat(formData.z) || 0,
    };
    onSubmit(parsedData);
  };

  const bands = ['u', 'g', 'r', 'i', 'z'];

  return (
    <div className="glass-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Photometric Bands</h2>
        <button
          type="button"
          onClick={randomize}
          className="btn-randomize"
          title="Randomize band values"
        >
          <Shuffle size={16} />
          <span>Randomize</span>
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        {bands.map(band => (
          <div className="input-group" key={band}>
            <label className="input-label" htmlFor={band}>
              Band {band} (mag)
            </label>
            <input
              type="number"
              step="0.001"
              id={band}
              name={band}
              value={formData[band]}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
        ))}
        <button 
          type="submit" 
          className="btn-primary" 
          disabled={loading}
          style={{ marginTop: '24px' }}
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Rocket size={18} />
              <span>Calculate Redshift</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputForm;
