import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './Layout.css';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={`layout-container ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <Sidebar isOpen={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="main-content">
        <Topbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="page-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
