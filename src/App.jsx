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
import Discounts from './pages/Management/Discounts';
import Sales from './pages/Reports/Sales';
import AuditLogs from './pages/Reports/AuditLogs';
import GlobalDialog from './components/GlobalDialog';
import useStore from './store/useStore';
import { useFirestoreSync } from './store/sync';

function App() {
  const { currentUser, activeBranchId, setActiveBranchId } = useStore();
  
  // Real-time Cloud Synchronization
  useFirestoreSync();

  // Set default branch if user is branch-specific
  useEffect(() => {
    if (currentUser.branchId !== 'all' && activeBranchId === 'all') {
      setActiveBranchId(currentUser.branchId);
    }
  }, [currentUser, activeBranchId, setActiveBranchId]);

  return (
    <Router>
      <GlobalDialog />
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
          <Route path="management/discounts" element={<Discounts />} />
          <Route path="reports/sales" element={<Sales />} />
          <Route path="reports/audit" element={<AuditLogs />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
