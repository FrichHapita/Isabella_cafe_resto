import { useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import useStore from './useStore';

const COLLECTIONS = [
  'branches',
  'suppliers',
  'rawMaterials',
  'inventoryLedger',
  'items',
  'wasteLogs',
  'sales',
  'expenses',
  'users',
  'discounts',
  'auditLogs'
];

// Helper to sync local actions to Firestore
export const syncToFirestore = async (collectionName, data) => {
  try {
    const docRef = doc(db, collectionName, data.id);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error(`Error syncing to Firestore (${collectionName}):`, error);
  }
};

export const removeFromFirestore = async (collectionName, id) => {
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (error) {
    console.error(`Error deleting from Firestore (${collectionName}):`, error);
  }
};

export const useFirestoreSync = () => {
  useEffect(() => {
    const unsubscribes = COLLECTIONS.map((collectionName) => {
      return onSnapshot(collection(db, collectionName), (snapshot) => {
        if (snapshot.empty) {
          // Optional: Seed Firestore with local state if remote is empty
          const localData = useStore.getState()[collectionName];
          if (localData && localData.length > 0) {
            console.log(`Seeding ${collectionName} to cloud...`);
            localData.forEach(item => syncToFirestore(collectionName, item));
          }
          return;
        }

        const data = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id
        }));
        
        // Use a simple set to avoid infinite loops if possible, 
        // though onSnapshot usually handles this.
        useStore.setState({ [collectionName]: data });
      });
    });

    return () => unsubscribes.forEach((unsub) => unsub());
  }, []);
};
