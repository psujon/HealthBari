import React, { useState, useEffect } from 'react';
import {
  Truck, Search, Package, CheckCircle2, Clock, MapPin,
  PhoneCall, ShieldCheck, FileText, ArrowRight, ExternalLink,
  Copy, Check, AlertCircle, RefreshCw, MessageSquare, XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import CustomerInvoiceModal from './CustomerInvoiceModal';

export default function TrackParcelView({ onBackToStore, onSelectProduct, settings, initialQuery = '' }) {
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [loading, setLoading] = useState(false);
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const phone = settings?.phone || '01540-696573';
  const whatsappNumber = settings?.whatsappNumber || '8801540696573';

  // Perform search on mount if initialQuery is provided
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSearch(null, initialQuery.trim());
    }
  }, [initialQuery]);

  const handleSearch = async (e, directQuery = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const query = (directQuery !== null ? directQuery : searchQuery).trim();
    if (!query) {
      setErrorMessage('অনুগ্রহ করে আপনার অর্ডার আইডি (যেমন: #HB-4825) বা মোবাইল নম্বরটি লিখুন।');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setHasSearched(true);
    setSearchedOrder(null);

    try {
      const res = await api.trackOrder(query);
      setLoading(false);
      if (res && res.success && res.order) {
        setSearchedOrder(res.order);
      } else {
        setErrorMessage(res?.message || `"${query}" দিয়ে কোনো পার্সেল বা অর্ডার খুঁজে পাওয়া যায়নি।`);
      }
    } catch (err) {
      setLoading(false);
      setErrorMessage('সার্ভারের সাথে যোগাযোগ করতে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।');
    }
  };

  const handleCopy = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success('ট্র্যাকিং কোড কপি হয়েছে!');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Determine Timeline Step Index (1: Pending, 2: Processing, 3: In Courier, 4: Delivered/Returned)
  const getStepIndex = (status, courierInfo) => {
    if (status === 'Delivered' || status === 'Returned') return 4;
    if (status === 'In Courier' || courierInfo?.trackingCode) return 3;
    if (status === 'Processing') return 2;
    return 1; // Pending / Confirmed
  };

  const activeStep = searchedOrder ? getStepIndex(searchedOrder.status, searchedOrder.courierInfo) : 1;

  return (
    <div style={{ padding: '2.5rem 0 4rem 0', minHeight: '80vh', background: '#f8fafc' }}>
      <div className="container" style={{ maxWidth: '900px' }}>

        {/* 1. Header Banner */}
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <div className="badge badge-teal" style={{ marginBottom: '0.6rem', padding: '0.35rem 0.85rem' }}>
            <Truck size={15} />
            <span>লাইভ পার্সেল ট্র্যাকিং পোর্টাল</span>
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            আপনার পার্সেল ও অর্ডারের লাইভ অবস্থা জানুন
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '620px', margin: '0 auto' }}>
            আপনার অর্ডার আইডি (যেমন: <strong>#HB-4825</strong>) অথবা চেকআউটের সময় দেওয়া <strong>১১ ডিজিটের মোবাইল নম্বর</strong> দিয়ে ট্র্যাক করুন।
          </p>
        </div>

        {/* 2. Main Search Input Card */}
        <div className="card" style={{ padding: '1.75rem 2rem', background: '#ffffff', border: '1.5px solid #ccfbf1', borderRadius: '20px', boxShadow: '0 10px 30px rgba(13, 148, 136, 0.08)', marginBottom: '2rem' }}>
          <form onSubmit={(e) => handleSearch(e)}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
                <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#0d9488' }} />
                <input
                  type="text"
                  placeholder="অর্ডার আইডি (যেমন: HB-4825) বা ফোন নম্বর লিখুন..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="form-input"
                  style={{
                    paddingLeft: '46px',
                    paddingRight: '16px',
                    height: '52px',
                    fontSize: '1.05rem',
                    borderRadius: '12px',
                    border: '2px solid #99f6e4',
                    background: '#f0fdfa',
                    fontWeight: 600
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-buy-now"
                style={{
                  padding: '0 2rem',
                  height: '52px',
                  fontSize: '1.05rem',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap'
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="spin" />
                    <span>খোঁজা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Truck size={18} />
                    <span>পার্সেল ট্র্যাক করুন</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Suggestion Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#64748b' }}>
            <span>💡 দ্রুত উদাহরণ ট্র্যাকিং:</span>
            <button
              type="button"
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '3px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: '#0f766e' }}
            >
              #HB-5**9
            </button>
            <button
              type="button"
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '3px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: '#0f766e' }}
            >
              019******46
            </button>
          </div>
        </div>

        {/* 3. Error Alert (If not found) */}
        {errorMessage && (
          <div style={{
            background: '#fff1f2',
            border: '1.5px solid #fecdd3',
            color: '#be123c',
            padding: '1.25rem',
            borderRadius: '16px',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <AlertCircle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px' }}>পার্সেল খুঁজে পাওয়া যায়নি</div>
              <div style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                {errorMessage}
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.825rem', color: '#475569' }}>
                প্রয়োজনে সরাসরি আমাদের হেল্পলাইনে কল করুন: <strong style={{ color: '#0f766e' }}>{phone}</strong>
              </div>
            </div>
          </div>
        )}

        {/* 4. Search Results & Tracking Details */}
        {searchedOrder && (() => {
          const isReturned = searchedOrder.status === 'Returned';
          const isDelivered = searchedOrder.status === 'Delivered';
          const isInCourier = searchedOrder.status === 'In Courier';
          const isProcessing = searchedOrder.status === 'Processing';

          const modalDeliveryArea = searchedOrder.deliveryArea || searchedOrder.delivery_area || 'inside_dhaka';
          const isInside = (modalDeliveryArea === 'inside_dhaka' || modalDeliveryArea === 'inside' || String(modalDeliveryArea || '').includes('ভেতরে')) && modalDeliveryArea !== 'outside_dhaka';
          const deliveryAreaText = isInside ? 'কাশিমপুর (গাজীপুর) এরিয়ার ভেতরে' : 'কাশিমপুর (গাজীপুর) এরিয়ার বাহিরে';

          let shippingCharge = 0;
          if (searchedOrder.shippingCharge !== undefined && searchedOrder.shippingCharge !== null && !isNaN(Number(searchedOrder.shippingCharge))) {
            shippingCharge = Number(searchedOrder.shippingCharge);
          } else if (searchedOrder.shipping_charge !== undefined && searchedOrder.shipping_charge !== null && !isNaN(Number(searchedOrder.shipping_charge))) {
            shippingCharge = Number(searchedOrder.shipping_charge);
          } else {
            shippingCharge = isInside ? (Number(settings?.shippingInsideDhaka) || 0) : (Number(settings?.shippingOutsideDhaka) || 0);
          }

          const itemsSubtotal = (searchedOrder.items || []).reduce((sum, it) => sum + (Number(it.price) * (Number(it.quantity) || 1)), 0);
          const discountAmount = Number(searchedOrder.discountAmount || searchedOrder.discount_amount || 0);
          const grandTotal = (searchedOrder.grandTotal !== undefined && searchedOrder.grandTotal !== null && !isNaN(Number(searchedOrder.grandTotal)))
            ? Number(searchedOrder.grandTotal)
            : Math.max(0, itemsSubtotal + shippingCharge - discountAmount);

          return (
            <div className="card" style={{ padding: '2rem', background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.04)', marginBottom: '2rem' }}>

              {/* Header with Order Status Badge */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '1.25rem', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span className="badge badge-teal" style={{ marginBottom: '4px' }}>
                    অর্ডার তথ্য
                  </span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 0 0' }} className="font-numeric">
                    #{searchedOrder.orderId}
                  </h2>
                  <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '2px' }}>
                    অর্ডারের তারিখ: <span className="font-numeric">{searchedOrder.createdAt ? new Date(searchedOrder.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'আজ'}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '6px 14px',
                    borderRadius: '50px',
                    fontWeight: 800,
                    fontSize: '0.875rem',
                    background: isReturned ? '#ffe4e6' : isDelivered ? '#dcfce7' : isInCourier ? '#e0f2fe' : isProcessing ? '#fef9c3' : '#fef3c7',
                    color: isReturned ? '#be123c' : isDelivered ? '#15803d' : isInCourier ? '#0369a1' : isProcessing ? '#854d0e' : '#b45309',
                    border: isReturned ? '1.5px solid #fecdd3' : isDelivered ? '1.5px solid #86efac' : isInCourier ? '1.5px solid #7dd3fc' : isProcessing ? '1.5px solid #fde047' : '1.5px solid #fde68a'
                  }}>
                    {isReturned && '● পার্সেল রিটার্ন (Returned)'}
                    {isDelivered && '✓ সফল ডেলিভার্ড (Delivered)'}
                    {isInCourier && '● কুরিয়ারে আছে (In Transit)'}
                    {isProcessing && '● প্রসেসিং / প্যাকেজিং হচ্ছে'}
                    {!isReturned && !isDelivered && !isInCourier && !isProcessing && '● নতুন অর্ডার গৃহীত (Pending)'}
                  </span>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                    পেমেন্ট: <strong>ক্যাশ অন ডেলিভারি</strong>
                  </div>
                </div>
              </div>

              {/* Visual Tracking Progress Stepper */}
              <div style={{ marginBottom: '2.25rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f766e', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} />
                  <span>পার্সেল অগ্রগতি টাইমলাইন (Live Status Stepper):</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.75rem', position: 'relative' }}>

                  {/* Step 1: Order Placed */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: activeStep >= 1 ? '#0d9488' : '#e2e8f0',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px auto',
                      boxShadow: activeStep >= 1 ? '0 4px 10px rgba(13,148,136,0.3)' : 'none'
                    }}>
                      <CheckCircle2 size={22} />
                    </div>
                    <div style={{ fontWeight: activeStep >= 1 ? 800 : 500, fontSize: '0.85rem', color: activeStep >= 1 ? '#0f766e' : '#64748b' }}>
                      অর্ডার গৃহীত হয়েছে
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>কনফার্মড</div>
                  </div>

                  {/* Step 2: Packed */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: activeStep >= 2 ? (isProcessing ? '#ca8a04' : '#0d9488') : '#e2e8f0',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px auto',
                      boxShadow: activeStep >= 2 ? '0 4px 10px rgba(13,148,136,0.3)' : 'none'
                    }}>
                      <Package size={22} />
                    </div>
                    <div style={{ fontWeight: activeStep >= 2 ? 800 : 500, fontSize: '0.85rem', color: activeStep >= 2 ? (isProcessing ? '#ca8a04' : '#0f766e') : '#64748b' }}>
                      প্যাকেজিং সম্পন্ন
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {isProcessing ? 'প্যাকিং চলমান' : 'মান পরীক্ষা সম্পন্ন'}
                    </div>
                  </div>

                  {/* Step 3: In Courier */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: activeStep >= 3 ? '#0284c7' : '#e2e8f0',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px auto',
                      boxShadow: activeStep >= 3 ? '0 4px 10px rgba(2,132,199,0.3)' : 'none'
                    }}>
                      <Truck size={22} />
                    </div>
                    <div style={{ fontWeight: activeStep >= 3 ? 800 : 500, fontSize: '0.85rem', color: activeStep >= 3 ? '#0284c7' : '#64748b' }}>
                      কুরিয়ারে হস্তান্তর
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {searchedOrder.courierInfo?.courierName || (isInCourier ? 'ইন ট্রানজিট' : 'কুরিয়ার বুকিং')}
                    </div>
                  </div>

                  {/* Step 4: Delivered vs Returned */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: isReturned ? '#be123c' : (isDelivered ? '#16a34a' : '#e2e8f0'),
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px auto',
                      boxShadow: isReturned ? '0 4px 10px rgba(190,18,60,0.3)' : (isDelivered ? '0 4px 10px rgba(22,163,74,0.3)' : 'none')
                    }}>
                      {isReturned ? <XCircle size={22} /> : <ShieldCheck size={22} />}
                    </div>
                    <div style={{ fontWeight: (isReturned || isDelivered) ? 800 : 500, fontSize: '0.85rem', color: isReturned ? '#be123c' : (isDelivered ? '#16a34a' : '#64748b') }}>
                      {isReturned ? 'পার্সেল রিটার্ন' : 'সফল ডেলিভারি'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {isReturned ? 'রিটার্ন সম্পন্ন' : isDelivered ? 'পণ্য হস্তান্তর সম্পন্ন' : 'পণ্য হস্তান্তর'}
                    </div>
                  </div>

                </div>
              </div>

              {/* Customer & Status Info Details (2 Rows on Mobile, 2 Cols on Desktop) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginBottom: '1.75rem' }}>

                {/* Left: Customer & Delivery Info */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', marginBottom: '8px' }}>
                    👤 গ্রাহক ও ডেলিভারি তথ্য:
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.6 }}>
                    <div><strong>নাম:</strong> {searchedOrder.customer?.name}</div>
                    <div><strong>ফোন:</strong> <span className="font-numeric">{searchedOrder.customer?.phone}</span></div>
                    <div><strong>ঠিকানা:</strong> {searchedOrder.customer?.address}</div>
                    {searchedOrder.customer?.note && (
                      <div style={{ color: '#b45309', marginTop: '4px' }}><strong>কাস্টমার নোট:</strong> "{searchedOrder.customer?.note}"</div>
                    )}
                  </div>
                </div>

                {/* Right: Dynamic Courier Tracking Info According to Actual Status */}
                {isReturned ? (
                  /* 🔴 RETURNED STATE CARD */
                  <div style={{ background: '#fff1f2', padding: '1.25rem', borderRadius: '14px', border: '1.5px solid #fecdd3' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#be123c', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertCircle size={17} color="#be123c" />
                      <span>পার্সেল রিটার্ন বিবরণ:</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#9f1239', lineHeight: 1.7 }}>
                      <div><strong>বর্তমান অবস্থা:</strong> <span style={{ color: '#be123c', fontWeight: 800 }}>⚠️ পার্সেলটি রিটার্ন এসেছে (Returned)</span></div>
                      {searchedOrder.courierInfo?.courierName && (
                        <div><strong>কুরিয়ার:</strong> {searchedOrder.courierInfo.courierName}</div>
                      )}
                      {searchedOrder.courierInfo?.trackingCode && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong>ট্র্যাকিং কোড:</strong>
                          <span className="font-numeric" style={{ fontWeight: 800, color: '#be123c', background: '#ffffff', padding: '1px 6px', borderRadius: '4px', border: '1px solid #fecdd3' }}>
                            {searchedOrder.courierInfo.trackingCode}
                          </span>
                        </div>
                      )}
                      <div style={{ fontSize: '0.825rem', color: '#881337', marginTop: '6px', lineHeight: 1.5 }}>
                        পার্সেলটি ডেলিভারি না হওয়ায় কুরিয়ার থেকে রিটার্ন এসেছে। বিস্তারিত জানতে হেল্পলাইনে যোগাযোগ করুন।
                      </div>
                    </div>
                  </div>
                ) : (searchedOrder.courierInfo && searchedOrder.courierInfo.trackingCode) || isInCourier ? (
                  /* 🔵 IN COURIER / IN TRANSIT CARD */
                  <div style={{ background: '#f0fdfa', padding: '1.25rem', borderRadius: '14px', border: '1.5px solid #99f6e4' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Truck size={17} />
                      <span>কুরিয়ার পার্সেল ট্র্যাকিং বিবরণ:</span>
                    </div>

                    <div style={{ fontSize: '0.9rem', color: '#134e4a', lineHeight: 1.7 }}>
                      <div><strong>কুরিয়ার নাম:</strong> {searchedOrder.courierInfo?.courierName || 'Steadfast Courier'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong>ট্র্যাকিং কোড:</strong>
                        <span className="font-numeric" style={{ fontWeight: 800, color: '#0d9488', background: '#ffffff', padding: '1px 6px', borderRadius: '4px', border: '1px solid #99f6e4' }}>
                          {searchedOrder.courierInfo?.trackingCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(searchedOrder.courierInfo?.trackingCode)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0d9488', display: 'flex', alignItems: 'center', padding: '2px' }}
                          title="কোড কপি করুন"
                        >
                          {copiedCode ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                        </button>
                      </div>
                      {searchedOrder.courierInfo?.consignmentId && (
                        <div><strong>কনসাইনমেন্ট আইডি:</strong> <span className="font-numeric">{searchedOrder.courierInfo.consignmentId}</span></div>
                      )}
                      <div style={{ fontSize: '0.825rem', color: '#047857', marginTop: '4px', fontWeight: 700 }}>
                        ✓ {searchedOrder.courierInfo?.courierStatus || 'পার্সেলটি আপনার ঠিকানায় পৌঁছানোর জন্য কুরিয়ারে চলমান আছে'}
                      </div>
                    </div>
                  </div>
                ) : isDelivered ? (
                  /* 🟢 DELIVERED STATE CARD */
                  <div style={{ background: '#ecfdf5', padding: '1.25rem', borderRadius: '14px', border: '1.5px solid #86efac' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={17} color="#16a34a" />
                      <span>ডেলিভারি সম্পন্ন বিবরণ:</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#14532d', lineHeight: 1.7 }}>
                      <div><strong>ডেলিভারি অবস্থা:</strong> <span style={{ color: '#15803d', fontWeight: 800 }}>🎉 সফলভাবে ডেলিভার্ড হয়েছে (Delivered)</span></div>
                      {searchedOrder.courierInfo?.courierName && (
                        <div><strong>ডেলিভারি মাধ্যম:</strong> {searchedOrder.courierInfo.courierName}</div>
                      )}
                      {searchedOrder.courierInfo?.trackingCode && (
                        <div><strong>ট্র্যাকিং কোড:</strong> <span className="font-numeric">{searchedOrder.courierInfo.trackingCode}</span></div>
                      )}
                      <div style={{ fontSize: '0.825rem', color: '#166534', marginTop: '4px' }}>
                        পার্সেলটি সফলভাবে আপনার হাতে পৌঁছে দেওয়া হয়েছে। ধন্যবাদ!
                      </div>
                    </div>
                  </div>
                ) : isProcessing ? (
                  /* 🟡 PROCESSING / PACKAGING CARD */
                  <div style={{ background: '#fefce8', padding: '1.25rem', borderRadius: '14px', border: '1.5px solid #fef08a' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#854d0e', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Package size={17} color="#ca8a04" />
                      <span>প্যাকেজিং ও কোয়ালিটি চেকিং:</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#713f12', lineHeight: 1.6 }}>
                      <div><strong>বর্তমান অবস্থা:</strong> <span style={{ fontWeight: 800, color: '#854d0e' }}>📦 পণ্য প্রস্তুত ও সিকিউরিটি প্যাকিং হচ্ছে</span></div>
                      <div style={{ fontSize: '0.825rem', color: '#a16207', marginTop: '6px', lineHeight: 1.5 }}>
                        আমাদের ওয়্যারহাউসে পণ্যটির মান পরীক্ষা ও প্যাকিং সম্পন্ন হচ্ছে। কুরিয়ারে হ্যান্ডওভার করার সাথে সাথে লাইভ ট্র্যাকিং কোড এখানে দৃশ্যমান হবে।
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 🟡 PENDING CARD */
                  <div style={{ background: '#fffbeb', padding: '1.25rem', borderRadius: '14px', border: '1.5px solid #fde68a' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={17} color="#d97706" />
                      <span>অর্ডার গ্রহণ ও পর্যালোচনা:</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#78350f', lineHeight: 1.6 }}>
                      <div><strong>বর্তমান অবস্থা:</strong> <span style={{ fontWeight: 800, color: '#b45309' }}>📋 অর্ডার সফলভাবে গ্রহণ করা হয়েছে</span></div>
                      <div style={{ fontSize: '0.825rem', color: '#92400e', marginTop: '6px', lineHeight: 1.5 }}>
                        আপনার অর্ডারটি সিস্টেমে নিশ্চিত হয়েছে। শীঘ্রই আমাদের টিম আপনার সাথে যোগাযোগ করে পণ্য প্যাকেজিং শুরু করবে।
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Ordered Items & Complete Financial Breakdown */}
              <div style={{ marginBottom: '1.75rem', border: '1.5px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ background: '#f8fafc', padding: '0.85rem 1.25rem', borderBottom: '1px solid #e2e8f0', fontWeight: 800, fontSize: '0.9rem', color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>অর্ডারকৃত পণ্য তালিকা ({searchedOrder.items?.length || 0} টি):</span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>পেমেন্ট: ক্যাশ অন ডেলিভারি</span>
                </div>

                <div style={{ padding: '0.75rem 1.25rem' }}>
                  {searchedOrder.items?.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: idx < (searchedOrder.items?.length || 1) - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>{it.title}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>প্যাকেজ: {it.variantName || 'স্ট্যান্ডার্ড'} × {it.quantity || 1} টি</div>
                      </div>
                      <div style={{ fontWeight: 800, color: '#0d9488', fontSize: '0.95rem' }} className="font-numeric">
                        {(it.price || 0) * (it.quantity || 1)}৳
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial Summary Lines */}
                <div style={{ background: '#f8fafc', padding: '0.85rem 1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>পণ্য সাবটোটাল:</span>
                    <span className="font-numeric" style={{ fontWeight: 700 }}>{itemsSubtotal}৳</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>হোম ডেলিভারি চার্জ ({deliveryAreaText}):</span>
                    <span className="font-numeric" style={{ fontWeight: 700, color: '#0f766e' }}>
                      {shippingCharge === 0 ? '০৳ (ফ্রি ডেলিভারি)' : `+${shippingCharge}৳`}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#be123c' }}>
                      <span>🎟️ ডিসকাউন্ট / ছাড়:</span>
                      <span className="font-numeric" style={{ fontWeight: 800 }}>-{discountAmount}৳</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '8px', marginTop: '4px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>সর্বমোট প্রদেয় বিল (ক্যাশ অন ডেলিভারি):</span>
                    <span className="font-numeric" style={{ fontSize: '1.35rem', fontWeight: 900, color: '#047857' }}>
                      {grandTotal}৳
                    </span>
                  </div>
                </div>

              </div>

              {/* Action CTAs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(true)}
                  className="btn btn-buy-now"
                  style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FileText size={16} />
                  <span>কাস্টমার ইনভয়েস দেখুন / প্রিন্ট</span>
                </button>

                <a
                  href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`হ্যালো, আমি হেলথ বাড়ি থেকে #${searchedOrder.orderId} অর্ডারের পার্সেল সংক্রান্ত তথ্য জানতে চাই।`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{ background: '#25D366', color: '#ffffff', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <MessageSquare size={16} />
                  <span>হোয়াটসঅ্যাপে যোগাযোগ</span>
                </a>

                <button
                  type="button"
                  onClick={onBackToStore}
                  className="btn btn-outline"
                  style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>হোমে ফিরে যান</span>
                  <ArrowRight size={16} />
                </button>
              </div>

            </div>
          );
        })()}

        {/* 5. Helpful Information Cards (Always Visible) */}
        <div className="grid md:grid-cols-3 gap-5" style={{ marginTop: '2.5rem' }}>

          <div className="card" style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
            <div style={{ width: 42, height: 42, borderRadius: '10px', background: '#f0fdfa', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <Truck size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              দ্রুততম হোম ডেলিভারি
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              কাশিমপুর (গাজীপুর) এরিয়ায় দ্রুততম ডেলিভারি এবং সারাদেশে  কুরিয়ারের মাধ্যমে ৪৮-৭২ ঘণ্টায় পার্সেল পৌঁছে দেওয়া হয়।
            </p>
          </div>

          <div className="card" style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
            <div style={{ width: 42, height: 42, borderRadius: '10px', background: '#f0fdfa', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              অফিশিয়াল ওয়ারেন্টি নিশ্চয়তা
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              সকল মেডিকেল ডিভাইসে থাকছে অথেনটিক রিপ্লেসমেন্ট ওয়ারেন্টি। পার্সেল ডেলিভারি পাওয়ার পর রাইডারের সামনে চেক করে ক্যাশ পরিশোধ করুন।
            </p>
          </div>

          <div className="card" style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
            <div style={{ width: 42, height: 42, borderRadius: '10px', background: '#f0fdfa', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <PhoneCall size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              ২৪/৭ কাস্টমার সাপোর্ট
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              যেকোনো প্রশ্ন বা পার্সেলের খোঁজ জানতে সরাসরি আমাদের ফোন করুন: <strong style={{ color: '#0f766e' }}>{phone}</strong> নম্বরে।
            </p>
          </div>

        </div>

      </div>

      {/* Invoice Modal for Tracked Order */}
      {showInvoiceModal && searchedOrder && (
        <CustomerInvoiceModal
          order={searchedOrder}
          settings={settings}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </div>
  );
}
