import React, { useState, useEffect } from 'react';
import { ShoppingBag, Tag, Check, Truck, ShieldCheck, ArrowLeft, Zap, X } from 'lucide-react';
import { api } from '../services/api';

export default function CheckoutView({ cartItems, onUpdateQty, onRemoveItem, onPlaceOrder, onBackToShop, settings }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [deliveryArea, setDeliveryArea] = useState('inside_dhaka');
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState('');
  const [couponError, setCouponError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const insideDhakaRate = (settings?.shippingInsideDhaka !== undefined && settings?.shippingInsideDhaka !== null && !isNaN(Number(settings.shippingInsideDhaka)))
    ? Number(settings.shippingInsideDhaka)
    : 0;
  const outsideDhakaRate = (settings?.shippingOutsideDhaka !== undefined && settings?.shippingOutsideDhaka !== null && !isNaN(Number(settings.shippingOutsideDhaka)))
    ? Number(settings.shippingOutsideDhaka)
    : 0;

  const shippingCharge = deliveryArea === 'inside_dhaka' ? insideDhakaRate : outsideDhakaRate;

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.variant.price * item.quantity);
  }, 0);

  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCharge);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('অনুগ্রহ করে একটি কুপন কোড লিখুন!');
      return;
    }
    setIsValidatingCoupon(true);
    setCouponError('');
    setCouponSuccessMsg('');
    try {
      const res = await api.validateCoupon(couponCode, subtotal);
      setIsValidatingCoupon(false);
      if (res.success) {
        setDiscountAmount(res.discountAmount);
        setCouponApplied(true);
        setAppliedCoupon(res.coupon);
        setCouponSuccessMsg(res.message);
        setCouponError('');
      } else {
        setDiscountAmount(0);
        setCouponApplied(false);
        setAppliedCoupon(null);
        setCouponError(res.message || 'অবৈধ কুপন কোড!');
      }
    } catch (err) {
      setIsValidatingCoupon(false);
      setCouponError('কুপন যাচাইয়ে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setDiscountAmount(0);
    setCouponApplied(false);
    setAppliedCoupon(null);
    setCouponSuccessMsg('');
    setCouponError('');
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('অনুগ্রহ করে আপনার পুরো নাম লিখুন।');
      return;
    }
    if (!phone.trim() || phone.length < 11) {
      setFormError('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।');
      return;
    }
    if (!address.trim()) {
      setFormError('অনুগ্রহ করে সম্পূর্ণ ঠিকানা লিখুন।');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    const fullOrder = {
      orderId: 'HB-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString(),
      customer: {
        name,
        phone,
        address,
        email,
        note
      },
      items: cartItems.map(item => ({
        productId: item.product.id,
        title: item.product.title,
        variantName: item.variant.name,
        price: item.variant.price,
        quantity: item.quantity
      })),
      deliveryArea,
      shippingCharge,
      subtotal,
      discountAmount,
      couponCode: couponApplied ? couponCode.trim().toUpperCase() : null,
      grandTotal,
      paymentMethod: 'Cash on Delivery',
      status: 'Pending'
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onPlaceOrder(fullOrder);
    }, 700);
  };

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: '#f0fdfa',
          color: '#0d9488',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}>
          <ShoppingBag size={40} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
          আপনার কার্ট বর্তমানে খালি!
        </h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          পরিবারের সুরক্ষায় প্রয়োজনীয় মেডিকেল ডিভাইস যুক্ত করুন।
        </p>
        <button onClick={onBackToShop} className="btn btn-primary btn-large">
          <ArrowLeft size={18} />
          <span>পণ্য দেখুন</span>
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem 4rem 1rem' }}>

      {/* Breadcrumbs matching user's screenshot */}
      <div style={{
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '12px',
        padding: '0.75rem 1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontSize: '1rem',
        fontWeight: 700
      }}>
        <span style={{ color: '#059669' }}>Checkout Details</span>
        <span style={{ color: '#94a3b8' }}>›</span>
        <span style={{ color: '#94a3b8' }}>Order Complete</span>
      </div>

      {formError && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #f87171',
          color: '#991b1b',
          padding: '0.75rem 1.25rem',
          borderRadius: '10px',
          marginBottom: '1.5rem',
          fontWeight: 600
        }}>
          {formError}
        </div>
      )}

      {/* 2-Column Checkout Layout (Matching User's Screenshot) */}
      <form onSubmit={handleCheckoutSubmit}>
        <div className="grid md:grid-cols-2 gap-8 items-start">

          {/* Left Column: Billing Details */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              Billing Details (অর্ডারের তথ্য)
            </h2>

            {/* Customer Name */}
            <div className="form-group">
              <label className="form-label">আপনার নাম <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="text"
                placeholder="আপনার সম্পূর্ণ নাম লিখুন"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                required
              />
            </div>

            {/* Customer Phone */}
            <div className="form-group">
              <label className="form-label">আপনার ফোন নাম্বার <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="tel"
                placeholder="যেমন: 017XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input"
                required
              />
            </div>

            {/* Full Address */}
            <div className="form-group">
              <label className="form-label">সম্পূর্ণ ঠিকানা লিখুন <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="text"
                placeholder="বাসা নম্বর, রোড, এরিয়া, থানা ও জেলা"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="form-input"
                required
              />
            </div>

            {/* Email (Optional) */}
            <div className="form-group">
              <label className="form-label">ইমেইল (অপশনাল)</label>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Customer Note */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">কাস্টমার নোট</label>
              <textarea
                placeholder="ডেলিভারির জন্য কোনো বিশেষ নির্দেশনা থাকলে লিখুন..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="form-textarea"
                rows={3}
              />
            </div>
          </div>

          {/* Right Column: Cart Totals */}
          <div className="card" style={{ padding: '1.75rem', background: '#ffffff' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              Cart Totals
            </h2>

            {/* Product Summary Row */}
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div className="flex items-center justify-between" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>
                <span>Product</span>
                <span>Qty</span>
                <span>Subtotal</span>
              </div>

              {cartItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2" style={{ marginBottom: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{item.product.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.variant.name}</div>
                  </div>

                  {/* Quantity adjustment */}
                  <div className="qty-controller" style={{ height: '32px' }}>
                    <button type="button" onClick={() => onUpdateQty(idx, -1)} className="qty-btn" style={{ width: '28px', height: '32px' }}>−</button>
                    <span className="qty-value" style={{ width: '30px', fontSize: '0.85rem' }}>{item.quantity}</span>
                    <button type="button" onClick={() => onUpdateQty(idx, 1)} className="qty-btn" style={{ width: '28px', height: '32px' }}>+</button>
                  </div>

                  <div style={{ fontWeight: 700, color: '#0f172a', textAlign: 'right', minWidth: '70px' }} className="font-numeric">
                    {item.variant.price * item.quantity}৳
                  </div>
                </div>
              ))}
            </div>

            {/* Shipping Radio Selection (Matching Screenshot) */}
            <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.6rem' }}>
                Shipping
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex items-center justify-between" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="shipping"
                      checked={deliveryArea === 'inside_dhaka'}
                      onChange={() => setDeliveryArea('inside_dhaka')}
                    />
                    <span>কাশিমপুর (গাজীপুর) এরিয়ার ভেতরে ডেলিভারি চার্জ</span>
                  </div>
                  <span className="font-numeric" style={{ fontWeight: 700 }}>{insideDhakaRate}৳</span>
                </label>

                <label className="flex items-center justify-between" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="shipping"
                      checked={deliveryArea === 'outside_dhaka'}
                      onChange={() => setDeliveryArea('outside_dhaka')}
                    />
                    <span>কাশিমপুর (গাজীপুর) এরিয়ার বাহিরে ডেলিভারি চার্জ</span>
                  </div>
                  <span className="font-numeric" style={{ fontWeight: 700 }}>{outsideDhakaRate}৳</span>
                </label>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Tag size={14} color="#0d9488" />
                <span>কুপন কোড (Coupon Discount)</span>
              </div>

              {!couponApplied ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code (e.g. HEALTH100)"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      if (couponError) setCouponError('');
                    }}
                    className="form-input"
                    style={{ padding: '0.55rem 0.85rem', fontSize: '0.85rem', textTransform: 'uppercase' }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon}
                    className="btn btn-outline"
                    style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap', borderColor: '#0d9488', color: '#0d9488', fontWeight: 700 }}
                  >
                    {isValidatingCoupon ? 'যাচাই হচ্ছে...' : 'Apply'}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ecfdf5', border: '1.5px dashed #10b981', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.78rem', fontWeight: 800 }}>
                      🏷️ {appliedCoupon?.code || couponCode.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#047857', fontWeight: 700 }}>
                      (−{discountAmount}৳ ছাড়)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    style={{ background: '#fee2e2', border: 'none', color: '#dc2626', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="কুপন বাতিল করুন"
                  >
                    <X size={12} />
                    <span>রিমুভ</span>
                  </button>
                </div>
              )}

              {couponSuccessMsg && couponApplied && (
                <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600, marginTop: '6px' }}>
                  {couponSuccessMsg}
                </div>
              )}
              {couponError && (
                <div style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '6px', fontWeight: 600 }}>
                  ⚠️ {couponError}
                </div>
              )}
            </div>

            {/* Discount Row if applied */}
            {discountAmount > 0 && (
              <div className="flex items-center justify-between" style={{ fontSize: '0.9rem', color: '#059669', fontWeight: 700, marginBottom: '0.65rem' }}>
                <span>কুপন ডিসকাউন্ট:</span>
                <span className="font-numeric">−{discountAmount}৳</span>
              </div>
            )}

            {/* Grand Total Row */}
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Total</span>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }} className="font-numeric">
                {grandTotal} ৳
              </span>
            </div>

            {/* Payment Method Option */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>
                Payment
              </div>
              <div style={{
                background: '#0284c7',
                color: '#ffffff',
                padding: '0.75rem 1.25rem',
                borderRadius: '50px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem'
              }}>
                <span>Cash on Delivery</span>
              </div>
            </div>

            {/* Submit Order Button (Exact Green Style in Screenshot) */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-large btn-full"
              style={{
                background: '#047857',
                color: '#ffffff',
                fontSize: '1.1rem',
                padding: '0.95rem',
                boxShadow: '0 4px 14px rgba(4, 120, 87, 0.35)'
              }}
            >
              <ShoppingBag size={20} />
              <span>{isSubmitting ? 'অর্ডার জমা হচ্ছে...' : `Place Order BDT ${grandTotal} ৳`}</span>
            </button>

          </div>

        </div>
      </form>
    </div>
  );
}
