import React, { useState } from 'react';
import { Rocket } from 'lucide-react';

const InputForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    u: 22.5,
    g: 21.2,
    r: 20.1,
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
      <h2 style={{ marginBottom: '24px', fontSize: '1.25rem' }}>Photometric Bands</h2>
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
