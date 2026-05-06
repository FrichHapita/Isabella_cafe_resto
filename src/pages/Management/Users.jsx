import React, { useState } from 'react';
import { UserPlus, Shield, UserCircle } from 'lucide-react';
import useStore from '../../store/useStore';

const Users = () => {
  const { users, branches, roles, addUser } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Cashier', branchId: branches[0]?.id || '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    addUser(formData);
    setShowAdd(false);
    setFormData({ name: '', email: '', role: 'Cashier', branchId: branches[0]?.id || '' });
  };

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Assign roles and branch access to staff</p>
        </div>
        <button className="primary-btn" onClick={() => setShowAdd(true)}>
          <UserPlus size={18} /> Add User
        </button>
      </div>

      <div className="premium-card table-card">
        <table className="premium-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Assigned Branch</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <div className="avatar" style={{width: '32px', height: '32px', fontSize: '0.8rem'}}>{user.name.charAt(0)}</div>
                    <strong>{user.name}</strong>
                  </div>
                </td>
                <td>{user.email}</td>
                <td><span className={`badge ${user.role === 'Admin' ? 'info' : 'success'}`}>{user.role}</span></td>
                <td>{user.branchId === 'all' ? 'All Branches' : branches.find(b => b.id === user.branchId)?.name}</td>
                <td><span className="badge success">Active</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="modal-overlay">
          <div className="modal-content premium-card">
            <div className="modal-header">
              <h3>Create User Account</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body p-24">
                <div className="form-group">
                  <label>Full Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Branch Access</label>
                  <select value={formData.branchId} onChange={e => setFormData({...formData, branchId: e.target.value})}>
                    <option value="all">Global Access (Admin)</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="confirm-btn">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
