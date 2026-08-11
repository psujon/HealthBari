import React, { useState } from 'react';
import { ShoppingCart, ShieldCheck, MapPin, Phone, User, FileText, Zap } from 'lucide-react';

export default function OneClickOrderForm({ product, variant, quantity, onSuccessOrder, settings }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryArea, setDeliveryArea] = useState('inside_dhaka'); // inside_dhaka or outside_dhaka
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const insideDhakaRate = (settings?.shippingInsideDhaka !== undefined && settings?.shippingInsideDhaka !== null && !isNaN(Number(settings.shippingInsideDhaka)))
    ? Number(settings.shippingInsideDhaka)
    : 0;
  const outsideDhakaRate = (settings?.shippingOutsideDhaka !== undefined && settings?.shippingOutsideDhaka !== null && !isNaN(Number(settings.shippingOutsideDhaka)))
    ? Number(settings.shippingOutsideDhaka)
    : 0;

  const shippingCharge = deliveryArea === 'inside_dhaka' ? insideDhakaRate : outsideDhakaRate;
  const productSubtotal = variant.price * quantity;
  const grandTotal = productSubtotal + shippingCharge;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('অনুগ্রহ করে আপনার নাম লিখুন।');
      return;
    }
    if (!phone.trim() || phone.length < 11) {
      setError('অনুগ্রহ করে একটি সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।');
      return;
    }
    if (!address.trim()) {
      setError('অনুগ্রহ করে আপনার সম্পূর্ণ ঠিকানা (জেলা/থানা/বাসা নম্বর) লিখুন।');
      return;
    }

    setError('');
    setLoading(true);

    const orderData = {
      orderId: 'HB-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString(),
      customer: {
        name,
        phone,
        address,
        note
      },
      items: [
        {
          productId: product.id,
          title: product.title,
          variantName: variant.name,
          price: variant.price,
          quantity
        }
      ],
      deliveryArea,
      shippingCharge,
      subtotal: productSubtotal,
      grandTotal,
      paymentMethod: 'Cash on Delivery (ক্যাশ অন ডেলিভারি)',
      status: 'Pending'
    };

    setTimeout(() => {
      setLoading(false);
      onSuccessOrder(orderData);
    }, 600);
  };

  return (
    <div style={{
      background: 'linear-gradient(180deg, #f0fdfa 0%, #ecfdf5 100%)',
      border: '2px solid #0d9488',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 10px 25px rgba(13, 148, 136, 0.15)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <span className="badge badge-success" style={{ marginBottom: '0.4rem' }}>
          ⚡ দ্রুত ১-ক্লিক অর্ডার ফর্ম
        </span>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f766e', margin: 0 }}>
          অর্ডার করতে নিচের তথ্যগুলো পূরণ করুন
        </h3>
        <p style={{ fontSize: '0.825rem', color: '#475569', margin: '4px 0 0 0' }}>
          ক্যাশ অন ডেলিভারি - কোনো অগ্রিম টাকা দেওয়ার প্রয়োজন নেই
        </p>
      </div>

      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          color: '#991b1b',
          padding: '0.65rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-4" style={{ marginBottom: '1rem' }}>

          {/* Customer Name */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label flex items-center gap-1">
              <User size={14} color="#0d9488" />
              <span>আপনার নাম *</span>
            </label>
            <input
              type="text"
              placeholder="আপনার পুরো নাম লিখুন"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {/* Customer Phone */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label flex items-center gap-1">
              <Phone size={14} color="#0d9488" />
              <span>মোবাইল নম্বর *</span>
            </label>
            <input
              type="tel"
              placeholder="যেমন: 017XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="form-input"
              required
            />
          </div>

        </div>

        {/* Delivery Address */}
        <div className="form-group">
          <label className="form-label flex items-center gap-1">
            <MapPin size={14} color="#0d9488" />
            <span>সম্পূর্ণ ঠিকানা লিখুন (বাসা নং, রোড, থানা, জেলা) *</span>
          </label>
          <input
            type="text"
            placeholder="আপনার সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="form-input"
            required
          />
        </div>

        {/* Shipping Selection (Inside / Outside Dhaka) */}
        <div className="form-group">
          <label className="form-label">ডেলিভারি এলাকা নির্বাচন করুন:</label>
          <div className="grid grid-cols-2 gap-3">

            <label
              className={`radio-card ${deliveryArea === 'inside_dhaka' ? 'active' : ''}`}
              style={{ margin: 0, cursor: 'pointer' }}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="deliveryArea"
                  checked={deliveryArea === 'inside_dhaka'}
                  onChange={() => setDeliveryArea('inside_dhaka')}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>কাশিমপুর (গাজীপুর) এরিয়ার ভেতরে</span>
              </div>
              <span className="font-numeric" style={{ fontWeight: 700, color: '#0d9488' }}>
                {insideDhakaRate === 0 ? '০৳' : `${insideDhakaRate}৳`}
              </span>
            </label>

            <label
              className={`radio-card ${deliveryArea === 'outside_dhaka' ? 'active' : ''}`}
              style={{ margin: 0, cursor: 'pointer' }}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="deliveryArea"
                  checked={deliveryArea === 'outside_dhaka'}
                  onChange={() => setDeliveryArea('outside_dhaka')}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>কাশিমপুর (গাজীপুর) এরিয়ার বাহিরে</span>
              </div>
              <span className="font-numeric" style={{ fontWeight: 700, color: '#0d9488' }}>
                {outsideDhakaRate === 0 ? '০৳' : `${outsideDhakaRate}৳`}
              </span>
            </label>

          </div>
        </div>

        {/* Order Summary Strip */}
        <div style={{
          background: '#ffffff',
          borderRadius: '10px',
          padding: '0.85rem 1rem',
          border: '1px solid #ccfbf1',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{product.title}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{variant.name} × {quantity} টি</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>সর্বমোট (ডেলিভারি সহ):</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669' }} className="font-numeric">
              {grandTotal}৳
            </div>
          </div>
        </div>

        {/* Place Order CTA */}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-buy-now btn-large btn-full"
          style={{ fontSize: '1.15rem', padding: '0.95rem' }}
        >
          <Zap size={20} />
          <span>{loading ? 'অর্ডার প্রসেস হচ্ছে...' : `অর্ডার কনফার্ম করুন - ${grandTotal}৳ (ক্যাশ অন ডেলিভারি)`}</span>
        </button>

      </form>
    </div>
  );
}
