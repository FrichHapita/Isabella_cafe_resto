import React, { useState } from 'react';
import { MapPin, Plus, Globe } from 'lucide-react';
import useStore from '../../store/useStore';

const Branches = () => {
  const { branches, addBranch } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    addBranch(formData);
    setShowAdd(false);
    setFormData({ name: '', location: '' });
  };

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Branch Management</h1>
          <p className="page-subtitle">Configure and monitor cafe locations</p>
        </div>
        <button className="primary-btn" onClick={() => setShowAdd(true)}>
          <Plus size={18} /> Add Branch
        </button>
      </div>

      <div className="ledger-container">
        {branches.map(b => (
          <div key={b.id} className="premium-card p-24">
            <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
              <div className="icon-wrapper purple">
                <Globe size={24} />
              </div>
              <div>
                <h3 style={{margin: 0}}>{b.name}</h3>
                <div style={{display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.9rem'}}>
                  <MapPin size={14} /> {b.location}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="modal-overlay">
          <div className="modal-content premium-card">
            <div className="modal-header">
              <h3>Register New Branch</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body p-24">
                <div className="form-group">
                  <label>Branch Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Location / Address</label>
                  <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="confirm-btn">Create Branch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
