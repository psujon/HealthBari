import React, { useState } from 'react';
import {
  X, Star, ShoppingCart, Zap, ShieldCheck, Truck, RotateCcw,
  HelpCircle, CheckCircle2, ChevronRight, PhoneCall, Sparkles, HeartPulse
} from 'lucide-react';
import OneClickOrderForm from './OneClickOrderForm';

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onDirectOrder,
  onQuickBuy,
  allProducts,
  onSelectProduct
}) {
  if (!product) return null;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants.find(v => v.isDefault) || product.variants[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const totalCalculatedPrice = selectedVariant.price * quantity;
  const totalOriginalPrice = (selectedVariant.originalPrice || selectedVariant.price) * quantity;
  const totalSavings = (selectedVariant.saveAmount || 0) * quantity;

  const handleQtyChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= 10) {
      setQuantity(newQty);
    }
  };

  const relatedProducts = allProducts.filter(p => p.id !== product.id).slice(0, 2);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '1000px', position: 'relative', padding: '1.5rem 1.75rem' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#f1f5f9',
            border: 'none',
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 20
          }}
        >
          <X size={20} color="#334155" />
        </button>

        {/* 2-Column Product Showcase (Matching User's Screenshot) */}
        <div className="grid md:grid-cols-2 gap-8" style={{ marginBottom: '2rem' }}>

          {/* Left Column: Image Gallery & Thumbnails */}
          <div>
            <div style={{
              position: 'relative',
              background: '#f8fafc',
              borderRadius: '16px',
              padding: '1.5rem',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              marginBottom: '1rem'
            }}>
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '340px',
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto'
                }}
              />

              {/* Pagination 1/2 Indicator */}
              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(15, 23, 42, 0.7)',
                color: '#ffffff',
                padding: '2px 10px',
                borderRadius: '50px',
                fontSize: '0.75rem',
                fontWeight: 600
              }} className="font-numeric">
                {selectedImageIndex + 1} / {product.images.length}
              </div>
            </div>

            {/* Thumbnails Row */}
            <div className="flex items-center gap-3">
              {product.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: '10px',
                    border: selectedImageIndex === idx ? '2px solid #0d9488' : '1px solid #e2e8f0',
                    background: '#ffffff',
                    padding: '4px',
                    cursor: 'pointer',
                    overflow: 'hidden'
                  }}
                >
                  <img src={img} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Title, Variant Pills, Pricing & Action CTAs */}
          <div>
            {/* Category tag */}
            <div className="flex items-center gap-2" style={{ marginBottom: '0.4rem' }}>
              <span className="badge badge-teal">{product.category}</span>
              <span className="badge badge-success">● In Stock ({product.stockCount} Available)</span>
            </div>

            {/* Product Title */}
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3, marginBottom: '0.75rem' }}>
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
              <div className="flex items-center" style={{ color: '#f59e0b' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }} className="font-numeric">{product.rating}</span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({product.reviewsCount} টি ভেরিফাইড রিভিউ)</span>
            </div>

            {/* Price section matching user's screenshot */}
            <div className="flex items-baseline gap-3" style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }} className="font-numeric">
                {selectedVariant.price}৳
              </span>
              {selectedVariant.originalPrice && (
                <span style={{ fontSize: '1.2rem', color: '#94a3b8', textDecoration: 'line-through' }} className="font-numeric">
                  {selectedVariant.originalPrice}৳
                </span>
              )}
            </div>

            {/* Size / Package Variants Pills (as seen in screenshot) */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                প্যাকেজ / সাইজ নির্বাচন করুন:
              </div>
              <div className="flex flex-col gap-2">
                {product.variants.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    style={{
                      padding: '0.65rem 0.9rem',
                      borderRadius: '10px',
                      border: selectedVariant.id === v.id ? '2px solid #059669' : '1.5px solid #e2e8f0',
                      background: selectedVariant.id === v.id ? '#ecfdf5' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: selectedVariant.id === v.id ? '#065f46' : '#1e293b' }}>
                      {v.name}
                    </div>
                    <div style={{ fontWeight: 700, color: '#059669' }} className="font-numeric">
                      {v.price}৳
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity Controller & Savings Badge */}
            <div className="flex items-center gap-4 flex-wrap" style={{ marginBottom: '1.25rem' }}>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Qty:</span>
                <div className="qty-controller">
                  <button onClick={() => handleQtyChange(-1)} className="qty-btn">−</button>
                  <span className="qty-value">{quantity}</span>
                  <button onClick={() => handleQtyChange(1)} className="qty-btn">+</button>
                </div>
              </div>

              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Total: <span style={{ color: '#0f766e', fontSize: '1.25rem' }} className="font-numeric">{totalCalculatedPrice}৳</span>
              </div>

              {totalSavings > 0 && (
                <div className="badge badge-success font-numeric">
                  ✔ You save {totalSavings}৳
                </div>
              )}
            </div>

            {/* Main Action CTAs (Matching Exact Colors in Screenshot) */}
            <div className="flex flex-col gap-2" style={{ marginBottom: '1.25rem' }}>
              <button
                onClick={() => onAddToCart(product, selectedVariant, quantity)}
                className="btn btn-large"
                style={{
                  background: '#047857',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(4, 120, 87, 0.35)',
                  fontSize: '1rem'
                }}
              >
                <ShoppingCart size={18} />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onQuickBuy(product, selectedVariant, quantity);
                }}
                className="btn btn-large"
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)',
                  fontSize: '1rem'
                }}
              >
                <Zap size={18} />
                <span>Buy Now</span>
              </button>
            </div>

            {/* Security Guarantee */}
            <div style={{
              background: '#f8fafc',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: '1px dashed #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.8rem',
              color: '#475569'
            }}>
              <ShieldCheck size={20} color="#059669" />
              <span>পণ্য হাতে পেয়ে চেক করে সম্পূর্ণ ক্যাশ অন ডেলিভারিতে টাকা পরিশোধ করবেন।</span>
            </div>

          </div>

        </div>

        {/* Description & Health Instructions Section (Matching Screenshot) */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginBottom: '2rem' }}>

          <div className="flex items-center gap-4" style={{ marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('description')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: activeTab === 'description' ? '#0f766e' : '#64748b',
                cursor: 'pointer',
                borderBottom: activeTab === 'description' ? '2px solid #0f766e' : 'none',
                paddingBottom: '6px'
              }}
            >
              📋 Description (বিস্তারিত বিবরণ)
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: activeTab === 'guide' ? '#0f766e' : '#64748b',
                cursor: 'pointer',
                borderBottom: activeTab === 'guide' ? '2px solid #0f766e' : 'none',
                paddingBottom: '6px'
              }}
            >
              🩺 ব্যবহারের নিয়মাবলি ও স্বাস্থ্য টিপস
            </button>
          </div>

          {activeTab === 'description' ? (
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem 0' }}>
                {product.highlights.map((h, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px', fontSize: '0.875rem', color: '#334155' }}>
                    <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>

              {/* Disclaimer / Caution note as seen in screenshot */}
              {product.healthNote && (
                <div style={{
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  color: '#92400e',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 500
                }}>
                  {product.healthNote}
                </div>
              )}
            </div>
          ) : (
            <div style={{ background: '#f0fdfa', padding: '1.25rem', borderRadius: '12px', border: '1px solid #ccfbf1' }}>
              <h4 style={{ color: '#0f766e', marginBottom: '0.5rem', fontSize: '0.95rem', fontWeight: 700 }}>
                ঘরে বসে সঠিক ফলাফল পাওয়ার ৩টি নিয়ম:
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {product.usageGuide.map((step, idx) => (
                  <li key={idx} style={{ marginBottom: '6px', fontSize: '0.875rem', color: '#134e4a', fontWeight: 500 }}>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Embedded One-Click Order Form directly on the product modal for instant conversion! */}
        <div style={{ marginBottom: '2.5rem' }}>
          <OneClickOrderForm
            product={product}
            variant={selectedVariant}
            quantity={quantity}
            onSuccessOrder={onDirectOrder}
          />
        </div>

        {/* Related Products Grid (Matching Screenshot) */}
        {relatedProducts.length > 0 && (
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
              <HeartPulse size={18} color="#0d9488" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Related Products (অন্যান্য স্বাস্থ্য ডিভাইস)
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {relatedProducts.map((rel) => {
                const relVar = rel.variants[0];
                return (
                  <div
                    key={rel.id}
                    className="card"
                    style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
                  >
                    <img
                      src={rel.images[0]}
                      alt={rel.title}
                      style={{ width: 80, height: 80, objectFit: 'contain', background: '#f8fafc', borderRadius: '8px', padding: '4px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                        {rel.title}
                      </h4>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f766e', marginBottom: '0.5rem' }} className="font-numeric">
                        {relVar.price}৳
                      </div>
                      <button
                        onClick={() => onSelectProduct(rel)}
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: '#0284c7', color: '#ffffff', borderColor: '#0284c7' }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
