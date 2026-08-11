import React from 'react';
import { Star, ShoppingCart, Zap, ShieldCheck } from 'lucide-react';

export default function ProductCard({ product, onSelectProduct, onQuickBuy }) {
  const defaultVariant = product.variants.find(v => v.isDefault) || product.variants[0];

  return (
    <div className="card flex flex-col justify-between" style={{ height: '100%', position: 'relative' }}>
      
      {/* Top badges */}
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <span className="badge badge-success hide-mobile">
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }}></span>
          In Stock ({product.stockCount} টি বাকি)
        </span>
        {defaultVariant.saveAmount > 0 && (
          <span className="badge badge-warning font-numeric" style={{ boxShadow: '0 2px 5px rgba(245, 158, 11, 0.2)' }}>
            সাশ্রয় {defaultVariant.saveAmount}৳
          </span>
        )}
      </div>

      {/* Product Image Area */}
      <div 
        onClick={() => onSelectProduct(product)}
        className="product-card-img-container"
        style={{
          background: '#ffffff',
          textAlign: 'center',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img 
          src={product.images[0]} 
          alt={product.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transition: 'transform 0.35s ease',
            margin: '0 auto',
            padding: '4px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
      </div>

      {/* Product Details Area */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          {/* Category & Star Rating */}
          <div className="flex items-center justify-between" style={{ marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#0d9488', fontWeight: 600, background: '#f0fdfa', padding: '2px 8px', borderRadius: '4px' }}>
              {product.category}
            </span>
            <div className="flex items-center gap-1" style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 700 }}>
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <span className="font-numeric">{product.rating}</span>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 
            onClick={() => onSelectProduct(product)}
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#0f172a',
              lineHeight: 1.4,
              marginBottom: '0.75rem',
              cursor: 'pointer'
            }}
          >
            {product.title}
          </h3>

          {/* Key Bullet Preview */}
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem 0', fontSize: '0.825rem', color: '#475569' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ color: '#10b981' }}>✔</span> {product.highlights[0]}
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#10b981' }}>✔</span> {product.highlights[1]}
            </li>
          </ul>
        </div>

        {/* Pricing & CTA Buttons */}
        <div>
          <div className="flex items-baseline gap-2" style={{ marginBottom: '1rem', borderTop: '1px dashed #e2e8f0', paddingTop: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f766e' }} className="font-numeric">
              {defaultVariant.price}৳
            </span>
            {defaultVariant.originalPrice && (
              <span style={{ fontSize: '0.95rem', color: '#94a3b8', textDecoration: 'line-through' }} className="font-numeric">
                {defaultVariant.originalPrice}৳
              </span>
            )}
            <span style={{ fontSize: '0.75rem', color: '#059669', background: '#d1fae5', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
              ক্যাশ অন ডেলিভারি
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => onSelectProduct(product)}
              className="btn btn-outline"
              style={{ padding: '0.65rem 0.5rem', fontSize: '0.85rem' }}
            >
              বিস্তারিত দেখুন
            </button>
            <button 
              onClick={() => onQuickBuy(product, defaultVariant)}
              className="btn btn-buy-now"
              style={{ padding: '0.65rem 0.5rem', fontSize: '0.85rem' }}
            >
              <Zap size={15} />
              সরাসরি অর্ডার
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
