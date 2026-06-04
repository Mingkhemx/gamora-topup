import React from 'react';
import { X, Trash2, ShoppingCart } from 'lucide-react';

const CartDrawer = ({ isOpen, onClose, items, onRemoveItem, onCheckout }) => {
  const totalAmount = items.reduce((sum, item) => {
    return sum + (parseInt(item.price.replace(/\D/g, '')) * item.qty);
  }, 0);

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <div className={`cart-drawer ${isOpen ? 'active' : ''}`}>
        <div className="cart-header">
          <div className="cart-title">
            <ShoppingCart size={20} />
            <h3>Keranjang Saya ({items.length})</h3>
          </div>
          <button className="cart-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="cart-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <ShoppingCart size={48} color="#cbd5e1" />
              <p>Keranjang kamu masih kosong</p>
              <button className="cart-empty-btn" onClick={onClose}>Mulai Belanja</button>
            </div>
          ) : (
            <div className="cart-items-list">
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    <img src={item.image || 'https://placehold.co/100x100/1e293b/fff?text=GAME'} alt="Game" />
                  </div>
                  <div className="cart-item-details">
                    <h4>{item.game || 'Mobile Legends'}</h4>
                    <p className="cart-item-package">{item.package} Diamonds</p>
                    <p className="cart-item-price">
                      {item.price} <span className="cart-item-qty">x{item.qty}</span>
                    </p>
                  </div>
                  <button className="cart-item-remove" onClick={() => onRemoveItem(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total-row">
              <span>Total Pembayaran</span>
              <span className="cart-total-amount">Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
            <button className="cart-checkout-btn" onClick={onCheckout}>
              Lanjut Pembayaran
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
