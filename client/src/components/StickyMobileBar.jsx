import React from 'react';
import { Zap, PhoneCall } from 'lucide-react';

export default function StickyMobileBar({ product, onQuickBuy }) {
  if (!product) return null;
  const defaultVariant = product.variants.find(v => v.isDefault) || product.variants[0];

  return (
    <div className="mobile-sticky-bar">
      <div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>মূল্য (ক্যাশ অন ডেলিভারি):</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f766e' }} className="font-numeric">
          {defaultVariant.price}৳
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <a 
          href="tel:01404499751" 
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#f0fdfa',
            border: '1px solid #99f6e4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0d9488',
            textDecoration: 'none'
          }}
        >
          <PhoneCall size={18} />
        </a>

        <button 
          onClick={() => onQuickBuy(product, defaultVariant)}
          className="btn btn-buy-now"
          style={{ padding: '0.65rem 1rem', fontSize: '0.9rem' }}
        >
          <Zap size={16} />
          <span>অর্ডার করুন</span>
        </button>
      </div>
    </div>
  );
}
