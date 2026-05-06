import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
      activeBranchId: 'all', // 'all' for admin summary, or specific branch ID

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
      
      // Inventory levels per branch
      // { itemId: 'rm1', branchId: 'b1', qty: 10 }
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

      // --- Waste Logs ---
      wasteLogs: [
        { id: 'w1', itemId: 'rm2', branchId: 'b1', qty: 2, reason: 'Expired', date: new Date().toISOString() }
      ],

      // --- Sales & POS ---
      sales: [
        { id: 'S1001', branchId: 'b1', items: [{ id: 'i1', quantity: 2, sellingPrice: 150 }], subtotal: 300, tax: 36, total: 336, paymentMethod: 'Cash', date: new Date(Date.now() - 86400000).toISOString() },
        { id: 'S1002', branchId: 'b2', items: [{ id: 'i2', quantity: 1, sellingPrice: 120 }], subtotal: 120, tax: 14.4, total: 134.4, paymentMethod: 'Card', date: new Date().toISOString() },
      ],
      
      // --- Expenses ---
      expenses: [],

      // --- Actions ---
      setActiveBranchId: (id) => set({ activeBranchId: id }),
      setCurrentUser: (user) => set({ currentUser: user }),
      
      // Inventory Actions
      addStock: (data) => set((state) => ({
        inventoryLedger: [...state.inventoryLedger, { 
          id: Date.now().toString(), 
          ...data, 
          type: 'RECEIVE', 
          date: new Date().toISOString() 
        }]
      })),

      addWaste: (data) => set((state) => ({
        wasteLogs: [...state.wasteLogs, { 
          id: Date.now().toString(), 
          ...data, 
          date: new Date().toISOString() 
        }],
        inventoryLedger: [...state.inventoryLedger, {
          id: Date.now().toString(),
          itemId: data.itemId,
          branchId: data.branchId,
          qty: -data.qty,
          type: 'WASTE',
          date: new Date().toISOString(),
          note: `Waste: ${data.reason}`
        }]
      })),

      addSale: (saleData) => set((state) => {
        // Enriched sale items with current cost prices
        const enrichedItems = saleData.items.map(item => {
          const currentItem = state.items.find(i => i.id === item.id);
          return {
            ...item,
            costPrice: currentItem?.costPrice || 0
          };
        });

        const newSale = {
          id: 'S' + Date.now(),
          ...saleData,
          items: enrichedItems,
          date: new Date().toISOString(),
        };
        
        // Update inventory for each item in sale (if tracking raw materials)
        const ledgerEntries = [];
        saleData.items.forEach(saleItem => {
          const item = state.items.find(i => i.id === saleItem.id);
          if (item && item.rawMaterials) {
            item.rawMaterials.forEach(rm => {
              ledgerEntries.push({
                id: 'L' + Date.now() + Math.random(),
                itemId: rm.rmId,
                branchId: saleData.branchId,
                qty: -(rm.qty * saleItem.quantity),
                type: 'SALE',
                date: new Date().toISOString(),
                note: `Sale ${newSale.id}`
              });
            });
          }
        });

        return {
          sales: [...state.sales, newSale],
          inventoryLedger: [...state.inventoryLedger, ...ledgerEntries]
        };
      }),

      // Branch/User/Supplier Actions
      addBranch: (branch) => set((state) => ({ branches: [...state.branches, { ...branch, id: 'b' + Date.now() }] })),
      addUser: (user) => set((state) => ({ users: [...state.users, { ...user, id: 'u' + Date.now() }] })),
      addSupplier: (supplier) => set((state) => ({ suppliers: [...state.suppliers, { ...supplier, id: 's' + Date.now() }] })),
      addRawMaterial: (rm) => set((state) => ({ rawMaterials: [...state.rawMaterials, { ...rm, id: 'rm' + Date.now() }] })),
      addItem: (item) => set((state) => ({ items: [...state.items, { ...item, id: 'i' + Date.now() }] })),
      updateItem: (updatedItem) => set((state) => ({
        items: state.items.map(item => item.id === updatedItem.id ? updatedItem : item)
      })),
      deleteItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      addExpense: (expense) => set((state) => ({ expenses: [...state.expenses, { ...expense, id: 'e' + Date.now(), date: new Date().toISOString() }] })),

      // Helper Selectors (logic can be used in components)
      getBranchInventory: (branchId) => {
        const state = get();
        const ledger = state.inventoryLedger;
        const branchLedger = branchId === 'all' ? ledger : ledger.filter(l => l.branchId === branchId);
        
        // Sum up by item
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
