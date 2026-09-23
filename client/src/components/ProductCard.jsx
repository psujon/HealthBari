import React from 'react';
import { Star, Zap } from 'lucide-react';

export default function ProductCard({ product, onSelectProduct, onQuickBuy }) {
  const defaultVariant = product.variants?.find(v => v.isDefault) || product.variants?.[0] || {};

  return (
    <div 
      className="card product-card-container" 
      style={{ 
        height: '100%', 
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem',
        background: '#ffffff'
      }}
    >
      {/* Product Card Inner Grid: 2-Grid Desktop, 1-Grid Mobile */}
      <div className="product-card-inner-grid">
        
        {/* GRID 1 (LEFT SIDE): Image + Badges + Buttons directly below Image */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
          
          {/* Top badges on Image (Save badge on Left, Star Rating on Right) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', zIndex: 5 }}>
            {defaultVariant.saveAmount > 0 ? (
              <span className="badge badge-warning font-numeric" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                সাশ্রয় {defaultVariant.saveAmount}৳
              </span>
            ) : <div />}

            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.78rem', color: '#d97706', fontWeight: 700, background: '#fffbebfb', padding: '2px 7px', borderRadius: '50px', border: '1px solid #fef3c7' }}>
              <Star size={13} fill="#f59e0b" color="#f59e0b" />
              <span className="font-numeric">{product.rating}</span>
              <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>({product.reviewsCount})</span>
            </div>
          </div>

          {/* Image Container */}
          <div 
            onClick={() => onSelectProduct(product)}
            className="product-image-box"
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              textAlign: 'center',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              height: '210px',
              flex: 1
            }}
          >
            <img 
              src={product.images[0]} 
              alt={product.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.35s ease',
                display: 'block'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </div>

          {/* Action Button Below Image */}
          <div style={{ marginTop: '0.65rem' }}>
            <button 
              onClick={() => onQuickBuy(product, defaultVariant)}
              className="btn btn-buy-now"
              style={{ width: '100%', padding: '0.55rem 0.5rem', fontSize: '0.85rem', fontWeight: 800, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
            >
              <Zap size={14} />
              <span>Order Now</span>
            </button>
          </div>
        </div>

        {/* GRID 2 (RIGHT SIDE): Product Information */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {/* Category Header */}
            <div style={{ marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#0d9488', fontWeight: 700, background: '#f0fdfa', padding: '2px 6px', borderRadius: '4px', border: '1px solid #ccfbf1' }}>
                {product.category}
              </span>
            </div>

            {/* Product Title */}
            <h3 
              onClick={() => onSelectProduct(product)}
              style={{
                fontSize: '0.98rem',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.35,
                marginBottom: '0.5rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                textDecorationColor: '#0d9488',
                textUnderlineOffset: '4px'
              }}
            >
              {product.title}
            </h3>

            {/* Key Bullet Preview */}
            {product.highlights && product.highlights.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 0.5rem 0', fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
                {product.highlights.slice(0, 2).map((h, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', marginBottom: '3px' }}>
                    <span style={{ color: '#10b981', fontWeight: 800, flexShrink: 0 }}>✔</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Details Button moved to Right Side */}
            <div>
              <button 
                onClick={() => onSelectProduct(product)}
                className="btn btn-outline"
                style={{ padding: '0.38rem 0.75rem', fontSize: '0.78rem', fontWeight: 700, borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <span>বিস্তারিত দেখুন →</span>
              </button>
            </div>
          </div>

          {/* Pricing Row */}
          <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '0.5rem', marginTop: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f766e' }} className="font-numeric">
                {defaultVariant.price}৳
              </span>
              {defaultVariant.originalPrice && (
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'line-through' }} className="font-numeric">
                  {defaultVariant.originalPrice}৳
                </span>
              )}
              <span style={{ fontSize: '0.68rem', color: '#059669', background: '#d1fae5', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                ক্যাশ অন ডেলিভারি
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

