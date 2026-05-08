import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Percent, DollarSign } from 'lucide-react';
import useStore from '../../store/useStore';

const Discounts = () => {
  const { discounts, addDiscount, updateDiscount, deleteDiscount } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'percentage', // percentage or fixed
    value: '',
    isWholeOrder: true // true: apply to whole order, false: apply to specific items
  });

  const handleOpenModal = (discount = null) => {
    if (discount) {
      setEditingId(discount.id);
      setFormData({
        name: discount.name,
        type: discount.type,
        value: discount.value,
        isWholeOrder: discount.isWholeOrder
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', type: 'percentage', value: '', isWholeOrder: true });
    }
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      value: parseFloat(formData.value)
    };
    if (editingId) {
      updateDiscount({ ...data, id: editingId });
    } else {
      addDiscount(data);
    }
    setShowModal(false);
  };

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Discounts</h1>
          <p className="page-subtitle">Manage system discounts for POS</p>
        </div>
        <button className="primary-btn" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Add Discount
        </button>
      </div>

      <div className="premium-card table-card">
        <table className="premium-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Value</th>
              <th>Applies To</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {discounts.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-muted">No discounts added yet.</td>
              </tr>
            ) : (
              discounts.map(discount => (
                <tr key={discount.id}>
                  <td className="font-medium">{discount.name}</td>
                  <td>
                    <span className={`status-badge ${discount.type === 'percentage' ? 'status-active' : 'status-pending'}`}>
                      {discount.type === 'percentage' ? <Percent size={14} /> : <DollarSign size={14} />}
                      {discount.type}
                    </span>
                  </td>
                  <td className="font-bold">
                    {discount.type === 'percentage' ? `${discount.value}%` : `₱${discount.value}`}
                  </td>
                  <td>{discount.isWholeOrder ? 'Whole Order' : 'Specific Items'}</td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn-sm" onClick={() => handleOpenModal(discount)}><Edit2 size={18} /></button>
                      <button className="icon-btn-sm delete" onClick={() => deleteDiscount(discount.id)}><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content premium-card">
            <div className="modal-header">
              <h2>{editingId ? 'Edit Discount' : 'Add Discount'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Discount Name (e.g. Senior Citizen)</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select
                    className="input-field"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₱)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Value</label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.value}
                    onChange={e => setFormData({ ...formData, value: e.target.value })}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Applies To</label>
                <select
                  className="input-field"
                  value={formData.isWholeOrder.toString()}
                  onChange={e => setFormData({ ...formData, isWholeOrder: e.target.value === 'true' })}
                >
                  <option value="true">Whole Order</option>
                  <option value="false">Specific Items Only</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="confirm-btn">{editingId ? 'Save Changes' : 'Add Discount'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discounts;
