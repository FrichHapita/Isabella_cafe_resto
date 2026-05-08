import React, { useState } from 'react';
import { Truck, Plus, Phone, MapPin, Edit2, Trash2, X } from 'lucide-react';
import useStore from '../../store/useStore';

const Suppliers = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', contact: '', address: '' });

  const handleEdit = (supplier) => {
    setEditingId(supplier.id);
    setFormData({ name: supplier.name, contact: supplier.contact, address: supplier.address });
    setShowAdd(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ name: '', contact: '', address: '' });
    setShowAdd(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateSupplier({ ...formData, id: editingId });
    } else {
      addSupplier(formData);
    }
    setShowAdd(false);
    setEditingId(null);
    setFormData({ name: '', contact: '', address: '' });
  };

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-subtitle">Manage your vendor relationships</p>
        </div>
        <button className="primary-btn" onClick={handleAddNew}>
          <Plus size={18} /> Add Supplier
        </button>
      </div>

      <div className="ledger-container">
        {suppliers.map(s => (
          <div key={s.id} className="premium-card p-24">
            <div className="supplier-header" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                <div className="icon-wrapper blue" style={{width: '48px', height: '48px'}}>
                  <Truck size={24} />
                </div>
                <div>
                  <h3 style={{margin: 0}}>{s.name}</h3>
                  <span className="badge info">Verified</span>
                </div>
              </div>
              <div style={{display: 'flex', gap: '8px'}}>
                <button className="icon-btn text-blue-500 hover:bg-blue-50" onClick={() => handleEdit(s)}>
                  <Edit2 size={18} />
                </button>
                <button className="icon-btn text-red-500 hover:bg-red-50" onClick={() => deleteSupplier(s.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="supplier-details" style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)'}}>
                <Phone size={16} /> <span>{s.contact}</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)'}}>
                <MapPin size={16} /> <span>{s.address}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="modal-overlay">
          <div className="modal-content premium-card">
            <div className="modal-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3 style={{margin: 0}}>{editingId ? 'Edit Supplier' : 'New Supplier'}</h3>
              <button className="icon-btn" onClick={() => setShowAdd(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body p-24">
                <div className="form-group">
                  <label>Supplier Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input required value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="confirm-btn">{editingId ? 'Save Changes' : 'Save Supplier'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
