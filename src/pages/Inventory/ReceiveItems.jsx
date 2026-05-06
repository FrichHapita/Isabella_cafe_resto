import React, { useState } from 'react';
import { PackagePlus, Search, ArrowRight } from 'lucide-react';
import useStore from '../../store/useStore';
import './Inventory.css';

const ReceiveItems = () => {
  const { rawMaterials, branches, suppliers, addStock, activeBranchId, currentUser } = useStore();
  const [formData, setFormData] = useState({
    itemId: '',
    branchId: currentUser.role === 'Admin' ? (activeBranchId === 'all' ? branches[0].id : activeBranchId) : currentUser.branchId,
    qty: 0,
    note: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.itemId || formData.qty <= 0) return;
    
    addStock(formData);
    alert('Stock received successfully!');
    setFormData({ ...formData, qty: 0, note: '' });
  };

  const selectedItem = rawMaterials.find(rm => rm.id === formData.itemId);

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Receive Stock</h1>
          <p className="page-subtitle">Add incoming inventory to branches</p>
        </div>
      </div>

      <div className="receive-grid">
        <div className="premium-card form-card">
          <div className="card-header">
            <h3>Entry Form</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-24">
            <div className="form-group">
              <label>Select Branch</label>
              <select 
                value={formData.branchId}
                onChange={(e) => setFormData({...formData, branchId: e.target.value})}
                disabled={currentUser.role !== 'Admin'}
              >
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Select Material</label>
              <select 
                required
                value={formData.itemId}
                onChange={(e) => setFormData({...formData, itemId: e.target.value})}
              >
                <option value="">-- Select Item --</option>
                {rawMaterials.map(rm => <option key={rm.id} value={rm.id}>{rm.name} ({rm.unit})</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Quantity to Receive</label>
              <div className="input-with-unit">
                <input 
                  type="number" required min="1"
                  value={formData.qty}
                  onChange={(e) => setFormData({...formData, qty: Number(e.target.value)})}
                />
                <span className="unit-label">{selectedItem?.unit || '-'}</span>
              </div>
            </div>

            <div className="form-group">
              <label>Reference / Note</label>
              <textarea 
                placeholder="PO number or supplier invoice..."
                value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
              />
            </div>

            <button type="submit" className="primary-btn w-full">
              <PackagePlus size={18} /> Process Stock In
            </button>
          </form>
        </div>

        <div className="premium-card summary-card">
          <div className="card-header">
            <h3>Summary Preview</h3>
          </div>
          <div className="p-24">
            {selectedItem ? (
              <div className="preview-content">
                <div className="preview-row">
                  <span>Item:</span>
                  <strong>{selectedItem.name}</strong>
                </div>
                <div className="preview-row">
                  <span>Unit Cost:</span>
                  <strong>₱{selectedItem.costPerUnit}</strong>
                </div>
                <div className="preview-row">
                  <span>Total Value:</span>
                  <strong className="text-primary">₱{(selectedItem.costPerUnit * formData.qty).toLocaleString()}</strong>
                </div>
                <div className="preview-row">
                  <span>Destination:</span>
                  <strong>{branches.find(b => b.id === formData.branchId)?.name}</strong>
                </div>
                <div className="preview-divider"></div>
                <p className="hint-text">Stock will be added to the ledger and reflected in the inventory balance for the selected branch.</p>
              </div>
            ) : (
              <div className="empty-state">
                <Search size={40} />
                <p>Select an item to see summary</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiveItems;
