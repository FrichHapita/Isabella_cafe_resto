import React, { useState } from 'react';
import useStore from '../../store/useStore';
import { Search, Filter, Clock } from 'lucide-react';
import { format } from 'date-fns';

const AuditLogs = () => {
  const { auditLogs } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEntity, setFilterEntity] = useState('All');

  // Add more entities if needed
  const entities = ['All', 'Sale', 'Inventory', 'Item', 'Branch', 'Supplier', 'Discount', 'System', 'User'];

  const sortedLogs = [...auditLogs].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredLogs = sortedLogs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntity = filterEntity === 'All' || log.entity === filterEntity;
    return matchesSearch && matchesEntity;
  });

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">Track system activities and changes</p>
        </div>
      </div>

      <div className="premium-card table-card">
        <div className="table-actions">
          <div className="search-box">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* <div className="filter-select flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              className="py-2 px-4 rounded-lg border focus:outline-none focus:border-primary"
            >
              {entities.map(entity => (
                <option key={entity} value={entity}>{entity}</option>
              ))}
            </select>
          </div> */}
        </div>

        <div className="overflow-x-auto">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-muted">No logs found.</td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap flex items-center gap-2">
                      {/* <Clock size={16} className="text-muted" /> */}
                      {format(new Date(log.date), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="font-medium">{log.userName}</td>
                    <td>
                      <span className={`status-badge ${log.action === 'CREATE' ? 'status-active' :
                        log.action === 'UPDATE' ? 'status-pending' :
                          log.action === 'DELETE' ? 'status-error' :
                            'status-active'
                        }`}>
                        {log.action}
                      </span>
                    </td>
                    <td>{log.entity}</td>
                    <td>{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
