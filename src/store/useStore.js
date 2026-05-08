import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncToFirestore, removeFromFirestore } from './sync';

const useStore = create(
  persist(
    (set, get) => ({
      // --- Auth & Profile ---
      currentUser: { id: '1', name: 'Admin User', role: 'Admin', branchId: 'all' },
      users: [
        { id: '1', name: 'Admin User', role: 'Admin', branchId: 'all', email: 'admin@isabella.com' },
        { id: '2', name: 'Branch 1 Manager', role: 'Manager', branchId: 'b1', email: 'b1@isabella.com' },
      ],
      roles: ['Admin', 'Manager', 'Cashier', 'Staff'],

      // --- Branches ---
      branches: [
        { id: 'b1', name: 'Isabella Cafe - Main', location: 'City Center' },
        { id: 'b2', name: 'Isabella Cafe - Mall', location: 'South Mall' },
      ],
      activeBranchId: 'all',

      // --- Suppliers ---
      suppliers: [
        { id: 's1', name: 'Coffee Roasters Co.', contact: '09123456789', address: 'Manila' },
        { id: 's2', name: 'Dairy Fresh', contact: '09876543210', address: 'Laguna' },
      ],

      // --- Raw Materials & Inventory ---
      rawMaterials: [
        { id: 'rm1', name: 'Arabica Beans', unit: 'kg', costPerUnit: 800, minStock: 5, supplierId: 's1' },
        { id: 'rm2', name: 'Full Cream Milk', unit: 'L', costPerUnit: 95, minStock: 20, supplierId: 's2' },
      ],
      
      inventoryLedger: [
        { id: 'l1', itemId: 'rm1', branchId: 'b1', qty: 10, type: 'INITIAL', date: new Date().toISOString(), note: 'Initial stock' },
        { id: 'l2', itemId: 'rm2', branchId: 'b1', qty: 50, type: 'INITIAL', date: new Date().toISOString(), note: 'Initial stock' },
      ],

      // --- Items (Finished Goods) ---
      items: [
        { id: 'i1', name: 'Signature Latte', category: 'Coffee', sellingPrice: 150, costPrice: 45, image: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=400&q=80', rawMaterials: [{ rmId: 'rm1', qty: 0.02 }, { rmId: 'rm2', qty: 0.25 }] },
        { id: 'i2', name: 'Americano', category: 'Coffee', sellingPrice: 120, costPrice: 20, image: 'https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=400&q=80', rawMaterials: [{ rmId: 'rm1', qty: 0.02 }] },
        { id: 'i3', name: 'Cappuccino', category: 'Coffee', sellingPrice: 140, costPrice: 40, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80', rawMaterials: [{ rmId: 'rm1', qty: 0.02 }, { rmId: 'rm2', qty: 0.2 }] },
        { id: 'i4', name: 'Caramel Macchiato', category: 'Coffee', sellingPrice: 170, costPrice: 60, image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&q=80', rawMaterials: [{ rmId: 'rm1', qty: 0.02 }, { rmId: 'rm2', qty: 0.25 }] },
        { id: 'i5', name: 'Blueberry Muffin', category: 'Pastries', sellingPrice: 95, costPrice: 35, image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80', rawMaterials: [] },
        { id: 'i6', name: 'Croissant', category: 'Pastries', sellingPrice: 85, costPrice: 25, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80', rawMaterials: [] },
      ],

      wasteLogs: [
        { id: 'w1', itemId: 'rm2', branchId: 'b1', qty: 2, reason: 'Expired', date: new Date().toISOString() }
      ],

      sales: [
        { id: 'S1001', branchId: 'b1', items: [{ id: 'i1', quantity: 2, sellingPrice: 150 }], subtotal: 300, tax: 36, total: 336, paymentMethod: 'Cash', date: new Date(Date.now() - 86400000).toISOString() },
        { id: 'S1002', branchId: 'b2', items: [{ id: 'i2', quantity: 1, sellingPrice: 120 }], subtotal: 120, tax: 14.4, total: 134.4, paymentMethod: 'Card', date: new Date().toISOString() },
      ],
      
      expenses: [],

      // --- Discounts ---
      discounts: [
        { id: 'd1', name: 'Senior Citizen', type: 'percentage', value: 20, isWholeOrder: true },
        { id: 'd2', name: 'PWD', type: 'percentage', value: 20, isWholeOrder: true }
      ],

      // --- Audit Logs ---
      auditLogs: [],

      // --- Global Dialog ---
      dialog: {
        isOpen: false,
        type: 'alert',
        title: '',
        message: '',
        onConfirm: null,
        onCancel: null,
        confirmText: 'OK',
        cancelText: 'Cancel'
      },

      // --- Actions ---
      showDialog: (options) => set((state) => ({ dialog: { ...state.dialog, ...options, isOpen: true } })),
      hideDialog: () => set((state) => ({ dialog: { ...state.dialog, isOpen: false } })),

      setActiveBranchId: (id) => set({ activeBranchId: id }),
      setCurrentUser: (user) => set({ currentUser: user }),
      
      addStock: (data) => {
        const newEntry = { 
          id: 'L' + Date.now(), 
          ...data, 
          type: 'RECEIVE', 
          date: new Date().toISOString() 
        };
        syncToFirestore('inventoryLedger', newEntry);
        get().logAudit('CREATE', 'Inventory', `Received stock for item ${data.itemId}`);
        // Local state will be updated by onSnapshot listener
      },

      addWaste: (data) => {
        const wasteEntry = { 
          id: 'W' + Date.now(), 
          ...data, 
          date: new Date().toISOString() 
        };
        const ledgerEntry = {
          id: 'L' + Date.now() + 'W',
          itemId: data.itemId,
          branchId: data.branchId,
          qty: -data.qty,
          type: 'WASTE',
          date: new Date().toISOString(),
          note: `Waste: ${data.reason}`
        };
        syncToFirestore('wasteLogs', wasteEntry);
        syncToFirestore('inventoryLedger', ledgerEntry);
        get().logAudit('CREATE', 'Inventory', `Added waste log for item ${data.itemId}`);
      },

      addSale: (saleData) => {
        const state = get();
        const enrichedItems = saleData.items.map(item => {
          const currentItem = state.items.find(i => i.id === item.id);
          return { ...item, costPrice: currentItem?.costPrice || 0 };
        });

        const newSale = {
          id: 'S' + Date.now(),
          ...saleData,
          items: enrichedItems,
          date: new Date().toISOString(),
          status: 'COMPLETED'
        };
        
        syncToFirestore('sales', newSale);
        get().logAudit('CREATE', 'Sale', `Completed sale ${newSale.id}`);

        saleData.items.forEach(saleItem => {
          const item = state.items.find(i => i.id === saleItem.id);
          if (item && item.rawMaterials) {
            item.rawMaterials.forEach(rm => {
              const ledgerEntry = {
                id: 'L' + Date.now() + Math.random().toString(36).substr(2, 5),
                itemId: rm.rmId,
                branchId: saleData.branchId,
                qty: -(rm.qty * saleItem.quantity),
                type: 'SALE',
                date: new Date().toISOString(),
                note: `Sale ${newSale.id}`
              };
              syncToFirestore('inventoryLedger', ledgerEntry);
            });
          }
        });
      },

      voidSale: (saleId) => {
        const state = get();
        const sale = state.sales.find(s => s.id === saleId);
        if (!sale || sale.status === 'VOIDED') return;

        const updatedSale = { ...sale, status: 'VOIDED' };
        syncToFirestore('sales', updatedSale);
        get().logAudit('UPDATE', 'Sale', `Voided sale ${saleId}`);

        // Revert inventory
        sale.items.forEach(saleItem => {
          const item = state.items.find(i => i.id === saleItem.id);
          if (item && item.rawMaterials) {
            item.rawMaterials.forEach(rm => {
              const ledgerEntry = {
                id: 'L' + Date.now() + Math.random().toString(36).substr(2, 5),
                itemId: rm.rmId,
                branchId: sale.branchId,
                qty: rm.qty * saleItem.quantity,
                type: 'VOID',
                date: new Date().toISOString(),
                note: `Void Sale ${saleId}`
              };
              syncToFirestore('inventoryLedger', ledgerEntry);
            });
          }
        });
      },

      addBranch: (branch) => {
        const data = { ...branch, id: 'b' + Date.now() };
        syncToFirestore('branches', data);
        get().logAudit('CREATE', 'Branch', `Added branch ${data.name}`);
      },

      updateBranch: (updatedBranch) => {
        syncToFirestore('branches', updatedBranch);
        get().logAudit('UPDATE', 'Branch', `Updated branch ${updatedBranch.name}`);
      },

      deleteBranch: (id) => {
        const state = get();
        const hasLinkedSales = state.sales.some(s => s.branchId === id);
        const hasLinkedInventory = state.inventoryLedger.some(l => l.branchId === id);
        if (hasLinkedSales || hasLinkedInventory) {
          get().showDialog({
            type: 'alert',
            title: 'Action Blocked',
            message: 'Cannot delete branch: It has linked transactions or inventory records.'
          });
          return;
        }
        const branch = state.branches.find(b => b.id === id);
        removeFromFirestore('branches', id);
        get().logAudit('DELETE', 'Branch', `Deleted branch ${branch?.name || id}`);
      },

      addUser: (user) => {
        const data = { ...user, id: 'u' + Date.now() };
        syncToFirestore('users', data);
        get().logAudit('CREATE', 'User', `Added user ${data.name}`);
      },

      updateUser: (updatedUser) => {
        syncToFirestore('users', updatedUser);
        get().logAudit('UPDATE', 'User', `Updated user ${updatedUser.name}`);
      },

      deleteUser: (id) => {
        const state = get();
        if (state.currentUser.id === id) {
          get().showDialog({
            type: 'error',
            title: 'Action Blocked',
            message: 'You cannot delete your own active account.'
          });
          return;
        }
        const user = state.users.find(u => u.id === id);
        removeFromFirestore('users', id);
        get().logAudit('DELETE', 'User', `Deleted user ${user?.name || id}`);
      },

      addSupplier: (supplier) => {
        const data = { ...supplier, id: 's' + Date.now() };
        syncToFirestore('suppliers', data);
        get().logAudit('CREATE', 'Supplier', `Added supplier ${data.name}`);
      },

      updateSupplier: (updatedSupplier) => {
        syncToFirestore('suppliers', updatedSupplier);
        get().logAudit('UPDATE', 'Supplier', `Updated supplier ${updatedSupplier.name}`);
      },

      deleteSupplier: (id) => {
        const state = get();
        const hasLinkedRM = state.rawMaterials.some(rm => rm.supplierId === id);
        if (hasLinkedRM) {
          get().showDialog({
            type: 'alert',
            title: 'Action Blocked',
            message: 'Cannot delete supplier: It is linked to existing raw materials.'
          });
          return;
        }
        const supplier = state.suppliers.find(s => s.id === id);
        removeFromFirestore('suppliers', id);
        get().logAudit('DELETE', 'Supplier', `Deleted supplier ${supplier?.name || id}`);
      },

      addRawMaterial: (rm) => {
        const data = { ...rm, id: 'rm' + Date.now() };
        syncToFirestore('rawMaterials', data);
        get().logAudit('CREATE', 'Raw Material', `Added raw material ${data.name}`);
      },

      addItem: (item) => {
        const data = { ...item, id: 'i' + Date.now() };
        syncToFirestore('items', data);
        get().logAudit('CREATE', 'Item', `Added item ${data.name}`);
      },

      updateItem: (updatedItem) => {
        syncToFirestore('items', updatedItem);
        get().logAudit('UPDATE', 'Item', `Updated item ${updatedItem.name}`);
      },

      deleteItem: (id) => {
        const state = get();
        const hasLinkedSales = state.sales.some(s => s.items.some(i => i.id === id));
        if (hasLinkedSales) {
          get().showDialog({
            type: 'alert',
            title: 'Action Blocked',
            message: 'Cannot delete item: It has been sold in existing transactions.'
          });
          return;
        }
        const item = state.items.find(i => i.id === id);
        removeFromFirestore('items', id);
        get().logAudit('DELETE', 'Item', `Deleted item ${item?.name || id}`);
      },

      addDiscount: (discount) => {
        const data = { ...discount, id: 'd' + Date.now() };
        set(state => ({ discounts: [...state.discounts, data] }));
        syncToFirestore('discounts', data);
        get().logAudit('CREATE', 'Discount', `Added discount ${data.name}`);
      },

      updateDiscount: (updatedDiscount) => {
        set(state => ({
          discounts: state.discounts.map(d => d.id === updatedDiscount.id ? updatedDiscount : d)
        }));
        syncToFirestore('discounts', updatedDiscount);
        get().logAudit('UPDATE', 'Discount', `Updated discount ${updatedDiscount.name}`);
      },

      deleteDiscount: (id) => {
        const state = get();
        const discount = state.discounts.find(d => d.id === id);
        set(state => ({ discounts: state.discounts.filter(d => d.id !== id) }));
        removeFromFirestore('discounts', id);
        get().logAudit('DELETE', 'Discount', `Deleted discount ${discount?.name || id}`);
      },

      addExpense: (expense) => {
        const data = { ...expense, id: 'e' + Date.now(), date: new Date().toISOString() };
        syncToFirestore('expenses', data);
        get().logAudit('CREATE', 'Expense', `Added expense for ${data.category}`);
      },

      logAudit: (action, entity, details) => {
        const state = get();
        const user = state.currentUser;
        if (!user) return; // Prevent crash if no user

        const newLog = {
          id: 'A' + Date.now() + Math.random().toString(36).substr(2, 5),
          userId: user.id,
          userName: user.name,
          action,
          entity,
          details,
          date: new Date().toISOString()
        };
        syncToFirestore('auditLogs', newLog);
      },

      importData: (importedState) => {
        set((state) => ({ ...state, ...importedState }));
        // Log import action
        get().logAudit('IMPORT', 'System', 'Imported full system data manually.');
      },

      // Helper Selectors
      getBranchInventory: (branchId) => {
        const state = get();
        const ledger = state.inventoryLedger;
        const branchLedger = branchId === 'all' ? ledger : ledger.filter(l => l.branchId === branchId);
        
        const totals = {};
        branchLedger.forEach(entry => {
          if (!totals[entry.itemId]) totals[entry.itemId] = 0;
          totals[entry.itemId] += entry.qty;
        });
        return totals;
      }
    }),
    {
      name: 'isabella-cafe-storage',
    }
  )
);

export default useStore;
