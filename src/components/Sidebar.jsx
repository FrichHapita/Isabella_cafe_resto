import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  PlusCircle, 
  Truck, 
  Trash2, 
  Users, 
  MapPin, 
  UserCircle,
  FileBarChart,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Coffee,
  History
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, setOpen }) => {
  const location = useLocation();

  const menuGroups = [
    {
      title: 'Main',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'POS System', path: '/pos', icon: ShoppingCart },
      ]
    },
    {
      title: 'Inventory',
      items: [
        { name: 'Stock Ledger', path: '/inventory/ledger', icon: Package },
        { name: 'Receive Items', path: '/inventory/receive', icon: PlusCircle },
        { name: 'Raw Materials', path: '/inventory/materials', icon: ClipboardList },
        { name: 'Menu Items', path: '/inventory/items', icon: Coffee },
        { name: 'Waste Logs', path: '/inventory/waste', icon: Trash2 },
        { name: 'Movement Logs', path: '/inventory/logs', icon: History },
      ]
    },
    {
      title: 'Management',
      items: [
        { name: 'Suppliers', path: '/management/suppliers', icon: Truck },
        { name: 'Branches', path: '/management/branches', icon: MapPin },
        { name: 'User Management', path: '/management/users', icon: UserCircle },
      ]
    },
    {
      title: 'Reports',
      items: [
        { name: 'Sales Report', path: '/reports/sales', icon: FileBarChart },
      ]
    }
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">I</div>
          {isOpen && <span className="logo-text">Isabella</span>}
        </div>
        <button className="toggle-btn" onClick={() => setOpen(!isOpen)}>
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <div className="sidebar-content">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="menu-group">
            {isOpen && <div className="group-title">{group.title}</div>}
            <div className="group-items">
              {group.items.map((item, i) => (
                <Link
                  key={i}
                  to={item.path}
                  className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
                  title={!isOpen ? item.name : ''}
                >
                  <item.icon size={20} className="item-icon" />
                  {isOpen && <span className="item-name">{item.name}</span>}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        {isOpen ? (
          <div className="user-info">
            <div className="user-avatar">AD</div>
            <div className="user-details">
              <span className="user-name">Admin Dev</span>
              <span className="user-role">Administrator</span>
            </div>
          </div>
        ) : (
          <div className="user-avatar mini">AD</div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
