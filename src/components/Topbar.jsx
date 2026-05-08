import React from 'react';
import { Menu, Bell, Search, Globe, ChevronDown } from 'lucide-react';
import useStore from '../store/useStore';
import SyncManager from './SyncManager';
import './Topbar.css';

const Topbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { branches, activeBranchId, setActiveBranchId, currentUser } = useStore();

  const activeBranch = branches.find(b => b.id === activeBranchId) || { name: 'All Branches' };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu size={20} />
        </button>
        
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search anything..." />
        </div>
      </div>

      <div className="topbar-right">
        <SyncManager />
        {currentUser.role === 'Admin' && (
          <div className="branch-selector">
            <Globe size={18} className="branch-icon" />
            <select 
              value={activeBranchId} 
              onChange={(e) => setActiveBranchId(e.target.value)}
              className="branch-select"
            >
              <option value="all">Summarized (All Branches)</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="select-arrow" />
          </div>
        )}

        <div className="topbar-actions">
          <button className="icon-btn">
            <Bell size={20} />
            <span className="badge">3</span>
          </button>
          
          <div className="divider"></div>
          
          <div className="profile-trigger">
            <div className="profile-text">
              <span className="name">{currentUser.name}</span>
              <span className="role">{currentUser.role}</span>
            </div>
            <div className="avatar">{currentUser.name.charAt(0)}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
