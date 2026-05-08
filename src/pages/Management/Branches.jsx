import React, { useState } from 'react';
import { MapPin, Plus, Globe, Edit2, Trash2, X } from 'lucide-react';
import useStore from '../../store/useStore';

const Branches = () => {
  const { branches, addBranch, updateBranch, deleteBranch } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', location: '' });

  const handleEdit = (branch) => {
    setEditingId(branch.id);
    setFormData({ name: branch.name, location: branch.location });
    setShowAdd(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ name: '', location: '' });
    setShowAdd(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateBranch({ ...formData, id: editingId });
    } else {
      addBranch(formData);
    }
    setShowAdd(false);
    setEditingId(null);
    setFormData({ name: '', location: '' });
  };

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Branch Management</h1>
          <p className="page-subtitle">Configure and monitor cafe locations</p>
        </div>
        <button className="primary-btn" onClick={handleAddNew}>
          <Plus size={18} /> Add Branch
        </button>
      </div>

      <div className="ledger-container">
        {branches.map(b => (
          <div key={b.id} className="premium-card p-24" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
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
            <div style={{display: 'flex', gap: '8px'}}>
              <button className="icon-btn text-blue-500 hover:bg-blue-50" onClick={() => handleEdit(b)}>
                <Edit2 size={18} />
              </button>
              <button className="icon-btn text-red-500 hover:bg-red-50" onClick={() => deleteBranch(b.id)}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="modal-overlay">
          <div className="modal-content premium-card">
            <div className="modal-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3 style={{margin: 0}}>{editingId ? 'Edit Branch' : 'Register New Branch'}</h3>
              <button className="icon-btn" onClick={() => setShowAdd(false)}><X size={20}/></button>
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
                <button type="submit" className="confirm-btn">{editingId ? 'Save Changes' : 'Create Branch'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
