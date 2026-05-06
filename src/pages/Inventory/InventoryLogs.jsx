import React from 'react';
import { History, ArrowUpRight, ArrowDownRight, Package, ShoppingCart, Trash2, Database } from 'lucide-react';
import useStore from '../../store/useStore';

const InventoryLogs = () => {
  const { inventoryLedger, rawMaterials, branches, activeBranchId } = useStore();

  const filteredLogs = activeBranchId === 'all' 
    ? inventoryLedger 
    : inventoryLedger.filter(l => l.branchId === activeBranchId);

  const getIcon = (type) => {
    switch (type) {
      case 'RECEIVE': return <ArrowUpRight className="text-success" />;
      case 'SALE': return <ArrowDownRight className="text-error" />;
      case 'WASTE': return <Trash2 className="text-error" />;
      case 'INITIAL': return <Database className="text-info" />;
      default: return <Package />;
    }
  };

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Movement Logs</h1>
          <p className="page-subtitle">Historical log of all stock ins and outs</p>
        </div>
      </div>

      <div className="premium-card table-card">
        <table className="premium-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Date & Time</th>
              <th>Branch</th>
              <th>Material</th>
              <th>Qty Change</th>
              <th>Note / Ref</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.slice().reverse().map(log => {
              const item = rawMaterials.find(rm => rm.id === log.itemId);
              return (
                <tr key={log.id}>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      {getIcon(log.type)}
                      <span className="font-bold" style={{fontSize: '0.8rem'}}>{log.type}</span>
                    </div>
                  </td>
                  <td style={{fontSize: '0.85rem'}}>{new Date(log.date).toLocaleString()}</td>
                  <td>{branches.find(b => b.id === log.branchId)?.name}</td>
                  <td><strong>{item?.name}</strong></td>
                  <td className={log.qty > 0 ? 'text-success font-bold' : 'text-error font-bold'}>
                    {log.qty > 0 ? '+' : ''}{log.qty} {item?.unit}
                  </td>
                  <td style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>{log.note}</td>
                </tr>
              );
            })}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center">No movement logs found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryLogs;
