import React, { useState } from 'react';
import { Cloud, DownloadCloud, UploadCloud, X, Loader2 } from 'lucide-react';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';
import useStore from '../store/useStore';
import { syncToFirestore } from '../store/sync';

const COLLECTIONS = [
  'branches', 'suppliers', 'rawMaterials', 'inventoryLedger',
  'items', 'wasteLogs', 'sales', 'expenses', 'users', 'discounts', 'auditLogs'
];

const SyncManager = () => {
  const store = useStore();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  const handlePullFromCloud = async () => {
    try {
      setLoading(true);
      setSyncStatus('Pulling data from cloud...');
      
      const newState = {};
      for (const collName of COLLECTIONS) {
        const querySnapshot = await getDocs(collection(db, collName));
        const data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        newState[collName] = data;
      }
      
      store.importData(newState);
      store.showDialog({ 
        type: 'success', 
        title: 'Pull Successful', 
        message: 'Successfully fetched all data from Firebase. Your local data has been updated.' 
      });
      setShowModal(false);
    } catch (err) {
      console.error(err);
      store.showDialog({ 
        type: 'error', 
        title: 'Pull Failed', 
        message: 'Failed to pull data from cloud. Please check your connection.' 
      });
    } finally {
      setLoading(false);
      setSyncStatus('');
    }
  };

  const handlePushToCloud = async () => {
    try {
      setLoading(true);
      setSyncStatus('Preparing data push...');
      
      let batch = writeBatch(db);
      let operationCount = 0;
      let totalPushed = 0;

      // We will loop through local state and push everything to firestore using batches
      for (const collName of COLLECTIONS) {
        const localData = store[collName];
        if (localData && localData.length > 0) {
          for (const item of localData) {
            const docRef = doc(db, collName, item.id);
            batch.set(docRef, item, { merge: true });
            operationCount++;
            
            // Firestore batches can handle up to 500 operations. We chunk at 450.
            if (operationCount >= 450) {
              setSyncStatus(`Pushing local data... (${totalPushed + operationCount} items)`);
              await batch.commit();
              totalPushed += operationCount;
              batch = writeBatch(db);
              operationCount = 0;
            }
          }
        }
      }
      
      if (operationCount > 0) {
        setSyncStatus(`Finalizing push...`);
        await batch.commit();
      }
      
      store.showDialog({ 
        type: 'success', 
        title: 'Push Successful', 
        message: 'Successfully uploaded all local data to Firebase.' 
      });
      setShowModal(false);
    } catch (err) {
      console.error(err);
      store.showDialog({ 
        type: 'error', 
        title: 'Push Failed', 
        message: 'Failed to push data to cloud. Please check your connection.' 
      });
    } finally {
      setLoading(false);
      setSyncStatus('');
    }
  };

  return (
    <>
      <button 
        className="icon-btn" 
        onClick={() => setShowModal(true)}
        title="Manual Cloud Sync"
      >
        <Cloud size={20} className="text-primary" />
      </button>

      {showModal && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content premium-card" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cloud size={24} className="text-primary" /> 
                Cloud Data Synchronization
              </h2>
              <button className="btn-icon" onClick={() => !loading && setShowModal(false)} disabled={loading}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <p className="text-muted" style={{ marginBottom: '24px', lineHeight: '1.5' }}>
                The system automatically syncs changes in real-time when online. 
                However, you can use these manual options to override data completely.
              </p>

              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--primary)' }}>
                  <Loader2 size={48} className="spin" style={{ margin: '0 auto 16px' }} />
                  <p style={{ fontWeight: '600' }}>{syncStatus}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div 
                    className="premium-card hover-lift" 
                    style={{ padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '16px', cursor: 'pointer', border: '1px solid var(--border)' }}
                    onClick={handlePullFromCloud}
                  >
                    <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}>
                      <DownloadCloud size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', color: 'var(--text-main)' }}>Pull Data from Cloud</h3>
                      <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                        Fetches the latest data from Firebase and overwrites your current local data. 
                        Best used when logging into a new device.
                      </p>
                    </div>
                  </div>

                  <div 
                    className="premium-card hover-lift" 
                    style={{ padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '16px', cursor: 'pointer', border: '1px solid var(--border)' }}
                    onClick={handlePushToCloud}
                  >
                    <div style={{ background: '#dcfce7', padding: '12px', borderRadius: '12px', color: 'var(--success)' }}>
                      <UploadCloud size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', color: 'var(--text-main)' }}>Push Local Data to Cloud</h3>
                      <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                        Uploads all your local offline data to Firebase, overriding the cloud storage. 
                        Best used to restore lost cloud data using an old device.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer" style={{ marginTop: '0' }}>
              <button 
                className="cancel-btn w-full" 
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SyncManager;
