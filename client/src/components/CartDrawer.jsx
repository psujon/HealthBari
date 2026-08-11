import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQty, 
  onRemoveItem, 
  onProceedToCheckout 
}) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.variant.price * item.quantity);
  }, 0);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '100vh',
          backgroundColor: '#ffffff',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.25s ease-out'
        }}
      >
        {/* Drawer Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} color="#0f766e" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              শপিং কার্ট ({cartItems.length})
            </h3>
          </div>
          <button 
            onClick={onClose}
            style={{ background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Cart Item List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
              <ShoppingBag size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem auto' }} />
              <p style={{ fontWeight: 600 }}>আপনার কার্টে কোনো পণ্য নেই</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cartItems.map((item, idx) => (
                <div 
                  key={idx} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: '1px solid #f1f5f9',
                    background: '#f8fafc'
                  }}
                >
                  <img 
                    src={item.product.images[0]} 
                    alt={item.product.title} 
                    style={{ width: 64, height: 64, objectFit: 'contain', background: '#ffffff', borderRadius: '8px', padding: '4px' }} 
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', margin: '0 0 2px 0' }}>
                      {item.product.title}
                    </h4>
                    <div style={{ fontSize: '0.725rem', color: '#64748b', marginBottom: '6px' }}>
                      {item.variant.name}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="qty-controller" style={{ height: '28px' }}>
                        <button onClick={() => onUpdateQty(idx, -1)} className="qty-btn" style={{ width: '24px', height: '28px' }}>−</button>
                        <span className="qty-value" style={{ width: '26px', fontSize: '0.75rem' }}>{item.quantity}</span>
                        <button onClick={() => onUpdateQty(idx, 1)} className="qty-btn" style={{ width: '24px', height: '28px' }}>+</button>
                      </div>
                      <div style={{ fontWeight: 800, color: '#0f766e', fontSize: '0.95rem' }} className="font-numeric">
                        {item.variant.price * item.quantity}৳
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => onRemoveItem(idx)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                    title="মুছে ফেলুন"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div style={{ padding: '1.25rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569' }}>সাবটোটাল:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }} className="font-numeric">
                {subtotal} ৳
              </span>
            </div>
            <button 
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="btn btn-primary btn-large btn-full"
              style={{ fontSize: '1rem' }}
            >
              <span>চেকআউট করুন (ক্যাশ অন ডেলিভারি)</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
