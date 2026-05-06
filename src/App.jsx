import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Ledger from './pages/Inventory/Ledger';
import ReceiveItems from './pages/Inventory/ReceiveItems';
import RawMaterials from './pages/Inventory/RawMaterials';
import WasteLogs from './pages/Inventory/WasteLogs';
import Items from './pages/Inventory/Items';
import InventoryLogs from './pages/Inventory/InventoryLogs';
import Suppliers from './pages/Management/Suppliers';
import Branches from './pages/Management/Branches';
import Users from './pages/Management/Users';
import Sales from './pages/Reports/Sales';
import useStore from './store/useStore';

function App() {
  const { currentUser, activeBranchId, setActiveBranchId } = useStore();

  // Set default branch if user is branch-specific
  useEffect(() => {
    if (currentUser.branchId !== 'all' && activeBranchId === 'all') {
      setActiveBranchId(currentUser.branchId);
    }
  }, [currentUser, activeBranchId, setActiveBranchId]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="pos" element={<POS />} />
          <Route path="inventory/ledger" element={<Ledger />} />
          <Route path="inventory/receive" element={<ReceiveItems />} />
          <Route path="inventory/materials" element={<RawMaterials />} />
          <Route path="inventory/items" element={<Items />} />
          <Route path="inventory/waste" element={<WasteLogs />} />
          <Route path="inventory/logs" element={<InventoryLogs />} />
          <Route path="management/suppliers" element={<Suppliers />} />
          <Route path="management/branches" element={<Branches />} />
          <Route path="management/users" element={<Users />} />
          <Route path="reports/sales" element={<Sales />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
