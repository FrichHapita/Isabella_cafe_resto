import React, { useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  CreditCard, 
  Banknote,
  Minus,
  Plus,
  X,
  Image as ImageIcon
} from 'lucide-react';
import useStore from '../store/useStore';
import './POS.css';

const POS = () => {
  const { items, addSale, activeBranchId, currentUser, branches } = useStore();
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

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
      return [...prev, { ...item, quantity: 1 }];
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
  const tax = subtotal * 0.12;
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    addSale({
      branchId: posBranchId,
      items: cart,
      subtotal,
      tax,
      total,
      paymentMethod,
      userId: currentUser.id
    });
    
    setCart([]);
    setShowCheckout(false);
    alert('Transaction Successful!');
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

      <div className="pos-sidebar premium-card">
        <div className="cart-header">
          <ShoppingCart size={20} />
          <h2>Current Order</h2>
          <span className="cart-count">{cart.length}</span>
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
                  <button className="delete-btn" onClick={() => removeFromCart(item.id)}><Trash2 size={16}/></button>
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
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₱{subtotal.toFixed(2)}</span>
          </div>
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
            onClick={() => setShowCheckout(true)}
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
              <button className="close-btn" onClick={() => setShowCheckout(false)}><X /></button>
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
                  onClick={() => setPaymentMethod('Card')}
                >
                  <CreditCard size={24} />
                  <span>Card</span>
                </button>
              </div>

              <div className="input-group">
                <label>Amount Received</label>
                <input type="number" placeholder="0.00" className="large-input" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowCheckout(false)}>Cancel</button>
              <button className="confirm-btn" onClick={handleCheckout}>Finalize Sale</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
