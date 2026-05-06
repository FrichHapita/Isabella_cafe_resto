import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import useStore from '../../store/useStore';
import './Inventory.css';

const RawMaterials = () => {
  const { rawMaterials, suppliers, addRawMaterial } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    unit: 'kg',
    costPerUnit: 0,
    minStock: 0,
    supplierId: suppliers[0]?.id || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addRawMaterial(formData);
    setShowAdd(false);
    setFormData({ name: '', unit: 'kg', costPerUnit: 0, minStock: 0, supplierId: suppliers[0]?.id || '' });
  };

  const filtered = rawMaterials.filter(rm => 
    rm.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Raw Materials</h1>
          <p className="page-subtitle">Manage ingredients and base supplies with costing</p>
        </div>
        <button className="primary-btn" onClick={() => setShowAdd(true)}>
          <Plus size={18} /> Add Material
        </button>
      </div>

      <div className="premium-card table-card">
        <div className="table-actions">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search materials..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <table className="premium-table">
          <thead>
            <tr>
              <th>Material Name</th>
              <th>Unit</th>
              <th>Cost per Unit</th>
              <th>Min. Stock Level</th>
              <th>Primary Supplier</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(rm => (
              <tr key={rm.id}>
                <td><strong>{rm.name}</strong></td>
                <td>{rm.unit}</td>
                <td>₱{rm.costPerUnit.toLocaleString()}</td>
                <td>{rm.minStock} {rm.unit}</td>
                <td>{suppliers.find(s => s.id === rm.supplierId)?.name || 'N/A'}</td>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn-sm"><Edit2 size={16} /></button>
                    <button className="icon-btn-sm delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="modal-overlay">
          <div className="modal-content premium-card">
            <div className="modal-header">
              <h3>Add New Raw Material</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body grid-form">
                <div className="form-group full">
                  <label>Material Name</label>
                  <input 
                    type="text" required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Unit (e.g. kg, L, pcs)</label>
                  <input 
                    type="text" required
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Cost per Unit (₱)</label>
                  <input 
                    type="number" required
                    value={formData.costPerUnit}
                    onChange={(e) => setFormData({...formData, costPerUnit: Number(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Minimum Stock Level</label>
                  <input 
                    type="number" required
                    value={formData.minStock}
                    onChange={(e) => setFormData({...formData, minStock: Number(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Primary Supplier</label>
                  <select 
                    value={formData.supplierId}
                    onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
                  >
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="confirm-btn">Save Material</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RawMaterials;
