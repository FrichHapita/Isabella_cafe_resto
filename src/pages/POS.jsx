import React, { useState, useEffect } from 'react';
import { 
  Search, ShoppingCart, Trash2, CreditCard, Banknote,
  Minus, Plus, X, Image as ImageIcon, Percent, CheckCircle
} from 'lucide-react';
import useStore from '../store/useStore';
import './POS.css';

const POS = () => {
  const { items, addSale, activeBranchId, currentUser, branches, discounts } = useStore();
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountReceived, setAmountReceived] = useState('');
  
  const [selectedDiscountId, setSelectedDiscountId] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  
  const [showMobileCart, setShowMobileCart] = useState(false);

  const categories = ['All', ...new Set(items.map(item => item.category))];
  
  const posBranchId = currentUser.role === 'Admin' 
    ? (activeBranchId === 'all' ? branches[0].id : activeBranchId)
    : currentUser.branchId;

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'All' || item.category === category;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, appliedDiscountId: null }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.sellingPrice * item.quantity), 0);
  
  // Calculate discount
  let discountAmount = 0;
  const activeDiscount = discounts.find(d => d.id === selectedDiscountId);
  
  if (activeDiscount) {
    if (activeDiscount.isWholeOrder) {
      discountAmount = activeDiscount.type === 'percentage' 
        ? subtotal * (activeDiscount.value / 100) 
        : activeDiscount.value;
    }
  }

  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const tax = subtotalAfterDiscount * 0.12;
  const total = subtotalAfterDiscount + tax;

  const change = paymentMethod === 'Cash' && amountReceived 
    ? Math.max(0, parseFloat(amountReceived) - total) 
    : 0;

  const isValidCheckout = cart.length > 0 && 
    (paymentMethod !== 'Cash' || (amountReceived && parseFloat(amountReceived) >= total));

  const handleCheckout = () => {
    if (!isValidCheckout) return;
    
    const saleData = {
      branchId: posBranchId,
      items: cart,
      subtotal,
      discountId: selectedDiscountId,
      discountAmount,
      tax,
      total,
      paymentMethod,
      amountReceived: parseFloat(amountReceived) || total,
      change,
      userId: currentUser.id
    };

    addSale(saleData);
    setLastTransaction({ ...saleData, date: new Date().toISOString() });
    
    setCart([]);
    setAmountReceived('');
    setSelectedDiscountId('');
    setShowCheckout(false);
    setShowReceipt(true);
  };

  return (
    <div className="pos-container">
      <div className="pos-main">
        <div className="pos-header">
          <div className="search-bar">
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Search items..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="category-tabs">
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`category-tab ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="items-grid">
          {filteredItems.map(item => (
            <div key={item.id} className="item-card premium-card" onClick={() => addToCart(item)}>
              <div className="item-image-wrapper">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="item-img" />
                ) : (
                  <div className="item-img-placeholder"><ImageIcon size={32} /></div>
                )}
                <div className="item-price">₱{item.sellingPrice}</div>
              </div>
              <div className="item-details">
                <span className="item-name">{item.name}</span>
                <span className="item-cat">{item.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Cart Toggle Button */}
      <button 
        className="mobile-cart-toggle" 
        onClick={() => setShowMobileCart(true)}
      >
        <ShoppingCart size={24} />
        <span className="mobile-cart-badge">{cart.length}</span>
        <span className="mobile-cart-total">₱{total.toFixed(2)}</span>
      </button>

      {/* POS Sidebar (Cart) */}
      <div className={`pos-sidebar premium-card ${showMobileCart ? 'mobile-open' : ''}`}>
        <div className="cart-header">
          <ShoppingCart size={20} />
          <h2>Current Order</h2>
          <span className="cart-count">{cart.length}</span>
          <button className="close-mobile-cart" onClick={() => setShowMobileCart(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="cart-items">
          {cart.length > 0 ? (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <span className="cart-item-name">{item.name}</span>
                  <span className="cart-item-price">₱{item.sellingPrice}</span>
                </div>
                <div className="cart-item-controls">
                  <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}><Minus size={14}/></button>
                  <span className="qty-val">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}><Plus size={14}/></button>
                  <button className="delete-btn" title="Remove Item" onClick={() => removeFromCart(item.id)}><Trash2 size={16}/></button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-cart">
              <ShoppingCart size={48} />
              <p>Your cart is empty</p>
            </div>
          )}
        </div>

        <div className="cart-footer">
          <div className="summary-row" style={{ alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Percent size={16}/> Discount
            </span>
            <select 
              className="discount-select"
              value={selectedDiscountId}
              onChange={(e) => setSelectedDiscountId(e.target.value)}
            >
              <option value="">None</option>
              {discounts.filter(d => d.isWholeOrder).map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₱{subtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="summary-row text-error">
              <span>Discount</span>
              <span>-₱{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Tax (12%)</span>
            <span>₱{tax.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₱{total.toFixed(2)}</span>
          </div>
          <button 
            className="checkout-btn" 
            disabled={cart.length === 0}
            onClick={() => {
              setShowCheckout(true);
              setShowMobileCart(false);
            }}
          >
            Proceed to Payment
          </button>
        </div>
      </div>

      {showCheckout && (
        <div className="modal-overlay">
          <div className="modal-content premium-card">
            <div className="modal-header">
              <h3>Complete Payment</h3>
              <button className="btn-icon" onClick={() => setShowCheckout(false)}><X /></button>
            </div>
            <div className="modal-body">
              <div className="payment-summary">
                <div className="pay-total">
                  <span>Amount Due</span>
                  <h1>₱{total.toFixed(2)}</h1>
                </div>
              </div>
              
              <div className="payment-methods">
                <button 
                  className={`pay-method ${paymentMethod === 'Cash' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('Cash')}
                >
                  <Banknote size={24} />
                  <span>Cash</span>
                </button>
                <button 
                  className={`pay-method ${paymentMethod === 'Card' ? 'active' : ''}`}
                  onClick={() => { setPaymentMethod('Card'); setAmountReceived(''); }}
                >
                  <CreditCard size={24} />
                  <span>Card</span>
                </button>
              </div>

              {paymentMethod === 'Cash' && (
                <div className="input-group">
                  <label>Amount Received (₱)</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    className="large-input" 
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    autoFocus
                  />
                  {amountReceived && parseFloat(amountReceived) >= total && (
                    <div className="change-display">
                      <span>Change (Sukli): </span>
                      <strong style={{ color: change > 0 ? 'var(--success)' : 'inherit' }}>
                        ₱{change.toFixed(2)}
                      </strong>
                    </div>
                  )}
                  {amountReceived && parseFloat(amountReceived) < total && (
                    <div className="change-display" style={{ color: 'var(--error)' }}>
                      Insufficient Amount
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowCheckout(false)}>Cancel</button>
              <button className="confirm-btn" disabled={!isValidCheckout} onClick={handleCheckout}>
                Finalize Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {showReceipt && lastTransaction && (
        <div className="modal-overlay">
          <div className="modal-content premium-card receipt-modal" style={{ width: '380px' }}>
            <div className="receipt-content">
              <div className="text-center" style={{ marginBottom: '24px' }}>
                <div className="success-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--success)' }}>
                  <CheckCircle size={48} />
                </div>
                <h2>Payment Successful!</h2>
                <p className="text-muted">{new Date(lastTransaction.date).toLocaleString()}</p>
              </div>
              
              <div className="receipt-details">
                {lastTransaction.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>{item.quantity}x {item.name}</span>
                    <span>₱{(item.sellingPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                
                <hr style={{ margin: '16px 0', borderColor: 'var(--border)' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Subtotal</span>
                  <span>₱{lastTransaction.subtotal.toFixed(2)}</span>
                </div>
                {lastTransaction.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--error)' }}>
                    <span>Discount</span>
                    <span>-₱{lastTransaction.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Tax (12%)</span>
                  <span>₱{lastTransaction.tax.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', margin: '16px 0' }}>
                  <span>Total Due</span>
                  <span>₱{lastTransaction.total.toFixed(2)}</span>
                </div>
                
                <hr style={{ margin: '16px 0', borderColor: 'var(--border)' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Payment ({lastTransaction.paymentMethod})</span>
                  <span>₱{lastTransaction.amountReceived.toFixed(2)}</span>
                </div>
                {lastTransaction.paymentMethod === 'Cash' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 'bold' }}>
                    <span>Change</span>
                    <span>₱{lastTransaction.change.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer" style={{ marginTop: '24px' }}>
              <button className="confirm-btn" style={{ flex: 1 }} onClick={() => setShowReceipt(false)}>
                New Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
