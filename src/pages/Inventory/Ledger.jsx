import React from 'react';
import useStore from '../../store/useStore';
import './Inventory.css';

const Ledger = () => {
  const { rawMaterials, branches, activeBranchId, inventoryLedger } = useStore();

  const inventoryByBranch = {};

  // Group materials by branch and calculate totals
  rawMaterials.forEach(rm => {
    branches.forEach(branch => {
      const branchId = branch.id;
      if (!inventoryByBranch[branchId]) inventoryByBranch[branchId] = {};
      
      const balance = inventoryLedger
        .filter(l => l.itemId === rm.id && l.branchId === branchId)
        .reduce((acc, l) => acc + l.qty, 0);
        
      inventoryByBranch[branchId][rm.id] = balance;
    });
  });

  const displayedBranches = activeBranchId === 'all' ? branches : branches.filter(b => b.id === activeBranchId);

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Ledger</h1>
          <p className="page-subtitle">Current stock levels across branches</p>
        </div>
      </div>

      <div className="ledger-container">
        {displayedBranches.map(branch => (
          <div key={branch.id} className="premium-card branch-ledger">
            <div className="card-header">
              <h3>{branch.name}</h3>
              <span className="location-tag">{branch.location}</span>
            </div>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Current Qty</th>
                  <th>Unit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rawMaterials.map(rm => {
                  const qty = inventoryByBranch[branch.id][rm.id] || 0;
                  const isLow = qty <= rm.minStock;
                  return (
                    <tr key={rm.id}>
                      <td>{rm.name}</td>
                      <td className={isLow ? 'text-error font-bold' : ''}>{qty.toLocaleString()}</td>
                      <td>{rm.unit}</td>
                      <td>
                        <span className={`badge ${isLow ? 'error' : 'success'}`}>
                          {isLow ? 'Low Stock' : 'Good'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ledger;
