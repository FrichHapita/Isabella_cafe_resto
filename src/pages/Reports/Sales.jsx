import React from 'react';
import { FileText, Download, TrendingUp } from 'lucide-react';
import useStore from '../../store/useStore';

const Sales = () => {
  const { sales, branches, activeBranchId } = useStore();

  const filteredSales = activeBranchId === 'all'
    ? sales
    : sales.filter(s => s.branchId === activeBranchId);

  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.subtotal, 0);
  const totalTax = filteredSales.reduce((acc, s) => acc + s.tax, 0);

  // Calculate COGS (Cost of Goods Sold)
  const totalCost = filteredSales.reduce((acc, sale) => {
    const saleCost = sale.items.reduce((sum, item) => sum + ((item.costPrice || 0) * item.quantity), 0);
    return acc + saleCost;
  }, 0);

  const netProfit = totalRevenue - totalCost;

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Report</h1>
          <p className="page-subtitle">Historical transaction data and analytics</p>
        </div>
        <button className="primary-btn">
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="premium-card p-24">
          <span className="stat-title">Total Revenue <small>(Subtotal)</small></span>
          <h2 className="stat-value">₱{totalRevenue.toLocaleString()}</h2>
        </div>
        <div className="premium-card p-24">
          <span className="stat-title">Total Expenses <small>(COGS)</small></span>
          <h2 className="stat-value" style={{ color: 'var(--error)' }}>₱{totalCost.toLocaleString()}</h2>
        </div>
        <div className="premium-card p-24" style={{ borderLeft: '4px solid var(--success)' }}>
          <span className="stat-title">Net Profit</span>
          <h2 className="stat-value" style={{ color: 'var(--success)' }}>₱{netProfit.toLocaleString()}</h2>
        </div>
        {/* <div className="premium-card p-24">
          <span className="stat-title">Total Tax Collected</span>
          <h2 className="stat-value" style={{color: 'var(--info)'}}>₱{totalTax.toLocaleString()}</h2>
        </div> */}
      </div>

      <div className="premium-card table-card">
        <table className="premium-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date & Time</th>
              <th>Branch</th>
              <th>Payment</th>
              <th>Items</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length > 0 ? (
              filteredSales.slice().reverse().map(sale => (
                <tr key={sale.id}>
                  <td><strong>{sale.id}</strong></td>
                  <td>{new Date(sale.date).toLocaleString()}</td>
                  <td>{branches.find(b => b.id === sale.branchId)?.name}</td>
                  <td><span className="badge info">{sale.paymentMethod}</span></td>
                  <td>{sale.items.length} items</td>
                  <td className="font-bold">₱{sale.total.toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">No sales data found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sales;
