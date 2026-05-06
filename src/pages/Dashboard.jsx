import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import useStore from '../store/useStore';
import './Dashboard.css';

const Dashboard = () => {
  const { sales, inventoryLedger, activeBranchId, branches, items, rawMaterials } = useStore();

  // Filter logic
  const filteredSales = activeBranchId === 'all' 
    ? sales 
    : sales.filter(s => s.branchId === activeBranchId);
    
  const filteredLedger = activeBranchId === 'all'
    ? inventoryLedger
    : inventoryLedger.filter(l => l.branchId === activeBranchId);

  // Calculations
  const totalSales = filteredSales.reduce((acc, s) => acc + s.total, 0);
  const totalExpenses = 0; // Simplified for demo
  const profit = totalSales - totalExpenses;

  // Stock counts
  const inventory = {};
  filteredLedger.forEach(entry => {
    if (!inventory[entry.itemId]) inventory[entry.itemId] = 0;
    inventory[entry.itemId] += entry.qty;
  });

  const lowStockItems = rawMaterials.filter(rm => (inventory[rm.id] || 0) <= rm.minStock);

  const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
    <div className="premium-card stat-card">
      <div className={`icon-wrapper ${color}`}>
        <Icon size={24} />
      </div>
      <div className="stat-content">
        <span className="stat-title">{title}</span>
        <h3 className="stat-value">{value}</h3>
        {trend && (
          <div className={`stat-trend ${trend}`}>
            {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">
            {activeBranchId === 'all' 
              ? 'Summarized data for all branches' 
              : `Viewing data for ${branches.find(b => b.id === activeBranchId)?.name}`}
          </p>
        </div>
        <button className="primary-btn">
          <TrendingUp size={18} />
          Generate Report
        </button>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="Total Sales" 
          value={`₱${totalSales.toLocaleString()}`} 
          icon={DollarSign} 
          color="blue"
          trend="up"
          trendValue="12.5%"
        />
        <StatCard 
          title="Total Profit" 
          value={`₱${profit.toLocaleString()}`} 
          icon={TrendingUp} 
          color="green"
          trend="up"
          trendValue="8.2%"
        />
        <StatCard 
          title="Low Stock Items" 
          value={lowStockItems.length} 
          icon={AlertTriangle} 
          color="orange"
        />
        <StatCard 
          title="Active Orders" 
          value={filteredSales.length} 
          icon={Package} 
          color="purple"
        />
      </div>

      <div className="dashboard-grid">
        <div className="premium-card main-chart-card">
          <div className="card-header">
            <h3>Sales Performance</h3>
            <select className="small-select">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="chart-placeholder">
            {/* Real chart would go here */}
            <div className="mock-chart">
              {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                <div key={i} className="bar" style={{ height: `${h}%` }}></div>
              ))}
            </div>
            <div className="chart-labels">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(l => <span key={l}>{l}</span>)}
            </div>
          </div>
        </div>

        <div className="premium-card secondary-card">
          <div className="card-header">
            <h3>Recent Transactions</h3>
            <button className="text-btn">View All</button>
          </div>
          <div className="transaction-list">
            {filteredSales.length > 0 ? (
              filteredSales.slice(-5).reverse().map(sale => (
                <div key={sale.id} className="transaction-item">
                  <div className="transaction-info">
                    <span className="transaction-id">{sale.id}</span>
                    <span className="transaction-time">{new Date(sale.date).toLocaleTimeString()}</span>
                  </div>
                  <span className="transaction-amount">₱{sale.total}</span>
                </div>
              ))
            ) : (
              <div className="empty-state">No recent sales</div>
            )}
          </div>
        </div>
      </div>

      <div className="inventory-summary premium-card">
        <div className="card-header">
          <h3>Stock Alerts</h3>
        </div>
        <table className="premium-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Current Stock</th>
              <th>Min Stock</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {lowStockItems.length > 0 ? (
              lowStockItems.map(rm => (
                <tr key={rm.id}>
                  <td>{rm.name}</td>
                  <td>{inventory[rm.id] || 0} {rm.unit}</td>
                  <td>{rm.minStock} {rm.unit}</td>
                  <td><span className="badge error">Low Stock</span></td>
                  <td><button className="small-btn">Order More</button></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">All items are sufficiently stocked</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
