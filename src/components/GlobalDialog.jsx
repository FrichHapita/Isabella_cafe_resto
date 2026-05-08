import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import useStore from '../store/useStore';
import './GlobalDialog.css';

const GlobalDialog = () => {
  const { dialog, hideDialog } = useStore();

  if (!dialog.isOpen) return null;

  const handleConfirm = () => {
    if (dialog.onConfirm) {
      dialog.onConfirm();
    }
    hideDialog();
  };

  const handleCancel = () => {
    if (dialog.onCancel) {
      dialog.onCancel();
    }
    hideDialog();
  };

  const getIcon = () => {
    switch (dialog.type) {
      case 'confirm':
        return <AlertCircle size={32} className="text-warning" />;
      case 'success':
        return <CheckCircle size={32} className="text-success" />;
      case 'error':
        return <X size={32} className="text-error" />;
      case 'alert':
      default:
        return <Info size={32} className="text-info" />;
    }
  };

  return (
    <div className="modal-overlay dialog-overlay">
      <div className="modal-content premium-card dialog-content">
        <button className="icon-btn close-dialog-btn" onClick={handleCancel}>
          <X size={20} />
        </button>
        <div className="dialog-body">
          <div className="dialog-icon-wrapper">
            {getIcon()}
          </div>
          <h2 className="dialog-title">{dialog.title}</h2>
          <p className="dialog-message">{dialog.message}</p>
        </div>
        <div className="dialog-footer">
          {dialog.type === 'confirm' && (
            <button className="cancel-btn dialog-btn" onClick={handleCancel}>
              {dialog.cancelText || 'Cancel'}
            </button>
          )}
          <button 
            className={`confirm-btn dialog-btn ${dialog.type === 'error' || dialog.type === 'alert' ? 'w-full' : ''}`} 
            onClick={handleConfirm}
          >
            {dialog.confirmText || 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalDialog;
