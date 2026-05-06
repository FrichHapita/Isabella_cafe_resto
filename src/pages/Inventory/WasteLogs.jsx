import React, { useState } from 'react';
import { Trash2, Plus, AlertCircle } from 'lucide-react';
import useStore from '../../store/useStore';

const WasteLogs = () => {
  const { wasteLogs, rawMaterials, branches, addWaste, activeBranchId, currentUser } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    itemId: '',
    branchId: currentUser.role === 'Admin' ? (activeBranchId === 'all' ? branches[0].id : activeBranchId) : currentUser.branchId,
    qty: 0,
    reason: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.itemId || formData.qty <= 0) return;
    addWaste(formData);
    setShowAdd(false);
    setFormData({ ...formData, qty: 0, reason: '' });
  };

  const filteredLogs = activeBranchId === 'all' 
    ? wasteLogs 
    : wasteLogs.filter(l => l.branchId === activeBranchId);

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Waste Inventory Logs</h1>
          <p className="page-subtitle">Track and analyze inventory losses</p>
        </div>
        <button className="primary-btn" style={{background: 'var(--error)'}} onClick={() => setShowAdd(true)}>
          <Trash2 size={18} /> Record Waste
        </button>
      </div>

      <div className="premium-card table-card">
        <table className="premium-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Branch</th>
              <th>Material</th>
              <th>Qty Lost</th>
              <th>Reason</th>
              <th>Value Loss</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map(log => {
                const item = rawMaterials.find(rm => rm.id === log.itemId);
                return (
                  <tr key={log.id}>
                    <td>{new Date(log.date).toLocaleDateString()}</td>
                    <td>{branches.find(b => b.id === log.branchId)?.name}</td>
                    <td>{item?.name}</td>
                    <td className="text-error">-{log.qty} {item?.unit}</td>
                    <td>{log.reason}</td>
                    <td>₱{(log.qty * (item?.costPerUnit || 0)).toLocaleString()}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center">No waste logs recorded</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="modal-overlay">
          <div className="modal-content premium-card">
            <div className="modal-header">
              <h3>Record Loss / Waste</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body p-24">
                <div className="form-group">
                  <label>Branch</label>
                  <select value={formData.branchId} onChange={e => setFormData({...formData, branchId: e.target.value})}>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Material</label>
                  <select required value={formData.itemId} onChange={e => setFormData({...formData, itemId: e.target.value})}>
                    <option value="">-- Select Material --</option>
                    {rawMaterials.map(rm => <option key={rm.id} value={rm.id}>{rm.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" required min="1" value={formData.qty} onChange={e => setFormData({...formData, qty: Number(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Reason for Waste</label>
                  <select required value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}>
                    <option value="">-- Select Reason --</option>
                    <option value="Expired">Expired</option>
                    <option value="Spilled">Spilled / Damaged</option>
                    <option value="Incorrect Preparation">Incorrect Preparation</option>
                    <option value="Theft">Theft / Missing</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="confirm-btn" style={{background: 'var(--error)'}}>Log Waste</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteLogs;
