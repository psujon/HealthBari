import React from 'react';
import { Printer, X, ShieldCheck, PhoneCall, MapPin, Truck, CheckCircle2, Download, Package } from 'lucide-react';

export default function OrderChalanModal({ order, settings, onClose }) {
  if (!order) return null;

  const brandName = settings?.brandName || 'হেলথ বাড়ি';
  const brandLogo = settings?.brandLogo || '/images/healthbari_logo.png';
  const phone = settings?.phone || '01540-696573';
  const whatsappNumber = settings?.whatsappNumber || '8801540696573';
  const address = settings?.address || 'কাশিমপুর, গাজীপুর';

  // Safe Order Data Extraction
  const orderId = order.orderId || order.order_id || 'HB-1048';
  const customerName = order.customer?.name || order.customerName || order.name || 'সম্মানিত গ্রাহক';
  const customerPhone = order.customer?.phone || order.customerPhone || order.phone || 'N/A';
  const customerAddress = order.customer?.address || order.customerAddress || order.address || 'ঢাকা, বাংলাদেশ';
  const customerNote = order.customer?.note || order.customerNote || order.note || '';
  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = (order.subtotal !== undefined && order.subtotal !== null && !isNaN(Number(order.subtotal)))
    ? Number(order.subtotal)
    : items.reduce((sum, it) => sum + ((Number(it.price) || 0) * (Number(it.quantity) || 1)), 0);

  const deliveryArea = order.deliveryArea || order.delivery_area || 'inside_dhaka';
  const isInside = deliveryArea === 'inside_dhaka';

  const insideDhakaRate = (settings?.shippingInsideDhaka !== undefined && settings?.shippingInsideDhaka !== null && !isNaN(Number(settings.shippingInsideDhaka)))
    ? Number(settings.shippingInsideDhaka)
    : 0;
  const outsideDhakaRate = (settings?.shippingOutsideDhaka !== undefined && settings?.shippingOutsideDhaka !== null && !isNaN(Number(settings.shippingOutsideDhaka)))
    ? Number(settings.shippingOutsideDhaka)
    : 0;

  let shippingCharge = 0;
  if (order.shippingCharge !== undefined && order.shippingCharge !== null && !isNaN(Number(order.shippingCharge))) {
    shippingCharge = Number(order.shippingCharge);
  } else if (order.shipping_charge !== undefined && order.shipping_charge !== null && !isNaN(Number(order.shipping_charge))) {
    shippingCharge = Number(order.shipping_charge);
  } else {
    shippingCharge = isInside ? insideDhakaRate : outsideDhakaRate;
  }

  const discountAmount = Number(order.discountAmount || order.discount_amount || 0);
  const grandTotal = (order.grandTotal !== undefined && order.grandTotal !== null && !isNaN(Number(order.grandTotal)))
    ? Number(order.grandTotal)
    : Math.max(0, subtotal + shippingCharge - discountAmount);
  const deliveryAreaText = isInside ? 'কাশিমপুর (গাজীপুর) এরিয়ার ভেতরে' : 'কাশিমপুর (গাজীপুর) এরিয়ার বাহিরে';
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });

  const courierName = order.courierInfo?.courierName || order.courier_name || 'Steadfast Courier';
  const trackingCode = order.courierInfo?.trackingCode || order.tracking_code || 'ST-' + Math.floor(100000 + Math.random() * 900000);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 110 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '800px', maxHeight: '92vh', overflowY: 'auto', padding: '0', background: '#f8fafc', borderRadius: '16px' }}
      >
        {/* Top Floating Actions (Hidden in Print) */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: '#0f766e', color: '#ffffff', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Printer size={20} />
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>অর্ডার ডেলিভারি চালান কপি (Chalan Invoice)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handlePrint}
              style={{
                background: '#10b981',
                color: '#ffffff',
                border: 'none',
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              <Printer size={16} />
              <span>প্রিন্ট করুন</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#ffffff',
                border: 'none',
                width: 32,
                height: 32,
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Chalan Document Body */}
        <div className="printable-chalan" style={{ padding: '2rem', background: '#ffffff', margin: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          
          {/* 1. Header with Logo & Brand Info */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '2px solid #0f766e', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 54, height: 54, borderRadius: '12px', background: '#f0fdfa', border: '2px solid #99f6e4', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src={brandLogo} alt={brandName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.src = '/images/healthbari_logo.png'; }} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f766e', lineHeight: 1.1, margin: 0 }}>
                  {brandName}
                </h1>
                <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                  আপনার পরিবারের বিশ্বস্ত ডিজিটাল স্বাস্থ্য সঙ্গী
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span>📍 {address}</span>
                  <span>📞 {phone}</span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-block', background: '#0f766e', color: '#ffffff', padding: '4px 12px', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 800, marginBottom: '6px' }}>
                ডেলিভারি চালান
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                চালান নং: <span className="font-numeric" style={{ color: '#0d9488' }}>#{orderId}</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                তারিখ: {orderDate}
              </div>
            </div>
          </div>

          {/* 2. Customer & Courier Meta Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            
            {/* Left: Customer Info */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f766e', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.35rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>👤 প্রাপকের তথ্য (Consignee / Customer):</span>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#1e293b', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div><strong>নাম:</strong> {customerName}</div>
                <div><strong>মোবাইল:</strong> <span className="font-numeric" style={{ fontWeight: 700 }}>{customerPhone}</span></div>
                <div><strong>ঠিকানা:</strong> {customerAddress}</div>
                {customerNote && (
                  <div style={{ background: '#fef3c7', padding: '3px 8px', borderRadius: '4px', fontSize: '0.78rem', color: '#92400e', marginTop: '4px' }}>
                    <strong>নোট:</strong> {customerNote}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Shipping & Payment Details */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f766e', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.35rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={15} />
                <span>ডেলিভারি ও পেমেন্ট বিবরণ:</span>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#1e293b', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div><strong>কুরিয়ার পার্টনার:</strong> {courierName}</div>
                <div><strong>ট্র্যাকিং কোড:</strong> <span className="font-numeric" style={{ color: '#059669', fontWeight: 700 }}>{trackingCode}</span></div>
                <div><strong>এরিয়া:</strong> {deliveryAreaText}</div>
                <div><strong>পেমেন্ট মেথড:</strong> <span style={{ color: '#b91c1c', fontWeight: 800 }}>ক্যাশ অন ডেলিভারি (COD)</span></div>
              </div>
            </div>

          </div>

          {/* 3. Product Items Table */}
          <div style={{ marginBottom: '1.25rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#0f766e', color: '#ffffff' }}>
                  <th style={{ padding: '8px 10px', border: '1px solid #0f766e', width: '40px', textAlign: 'center' }}>নং</th>
                  <th style={{ padding: '8px 10px', border: '1px solid #0f766e' }}>পণ্যের নাম ও স্পেসিফিকেশন</th>
                  <th style={{ padding: '8px 10px', border: '1px solid #0f766e', width: '100px', textAlign: 'right' }}>একক মূল্য</th>
                  <th style={{ padding: '8px 10px', border: '1px solid #0f766e', width: '60px', textAlign: 'center' }}>পরিমাণ</th>
                  <th style={{ padding: '8px 10px', border: '1px solid #0f766e', width: '100px', textAlign: 'right' }}>মোট টাকা</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((it, idx) => (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '8px 10px', border: '1px solid #e2e8f0', textAlign: 'center' }} className="font-numeric">{idx + 1}</td>
                      <td style={{ padding: '8px 10px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{it.title || it.name || 'মেডিকেল ডিভাইস'}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>ভ্যারিয়েন্ট: {it.variantName || it.variant || 'স্ট্যান্ডার্ড প্যাকেজ'}</div>
                      </td>
                      <td style={{ padding: '8px 10px', border: '1px solid #e2e8f0', textAlign: 'right' }} className="font-numeric">{it.price || 0}৳</td>
                      <td style={{ padding: '8px 10px', border: '1px solid #e2e8f0', textAlign: 'center' }} className="font-numeric">{it.quantity || 1}</td>
                      <td style={{ padding: '8px 10px', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 700 }} className="font-numeric">{(it.price || 0) * (it.quantity || 1)}৳</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td style={{ padding: '8px 10px', border: '1px solid #e2e8f0', textAlign: 'center' }} className="font-numeric">1</td>
                    <td style={{ padding: '8px 10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>স্মার্ট ডিজিটাল ব্লাড প্রেশার মনিটর</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>ভ্যারিয়েন্ট: ফুল ফ্যামিলি কম্বো</div>
                    </td>
                    <td style={{ padding: '8px 10px', border: '1px solid #e2e8f0', textAlign: 'right' }} className="font-numeric">1850৳</td>
                    <td style={{ padding: '8px 10px', border: '1px solid #e2e8f0', textAlign: 'center' }} className="font-numeric">1</td>
                    <td style={{ padding: '8px 10px', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 700 }} className="font-numeric">1850৳</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 4. Financial Calculations Summary */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <div style={{ width: '320px', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>পণ্যসমূহের মোট মূল্য (Subtotal):</span>
                <span className="font-numeric" style={{ fontWeight: 700 }}>{subtotal}৳</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>ডেলিভারি চার্জ:</span>
                <span className="font-numeric" style={{ fontWeight: 700 }}>{shippingCharge === 0 ? '০৳ (ফ্রি)' : `${shippingCharge}৳`}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9', color: '#059669' }}>
                  <span>কুপন ডিসকাউন্ট:</span>
                  <span className="font-numeric" style={{ fontWeight: 700 }}>−{discountAmount}৳</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #0f766e', borderBottom: '2px solid #0f766e', marginTop: '6px', fontSize: '1.15rem', fontWeight: 900, color: '#0f766e' }}>
                <span>মোট প্রদেয় টাকা (COD):</span>
                <span className="font-numeric">{grandTotal}৳</span>
              </div>
            </div>
          </div>

          {/* 5. Terms, Policy & Warranty Strip */}
          <div style={{ background: '#f0fdfa', border: '1px dashed #99f6e4', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '2.5rem', fontSize: '0.78rem', color: '#134e4a' }}>
            <div style={{ fontWeight: 800, marginBottom: '2px', color: '#0f766e' }}>
              🛡️ {brandName}র বিশেষ নির্দেশিকা ও ওয়ারেন্টি পলিসি:
            </div>
            <div>• ডেলিভারিম্যানের সামনে পার্সেলটি চেক করে পণ্য বুঝে নিন এবং ক্যাশ টাকা পরিশোধ করুন।</div>
            <div>• যেকোনো ডিভাইসে ২ বছরের অফিশিয়াল রিপ্লেসমেন্ট ওয়ারেন্টি সুবিধা রয়েছে। সমস্যার ক্ষেত্রে সরাসরি কল করুন: {phone}</div>
          </div>

          {/* 6. Signatures Block */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ textAlign: 'center', width: '180px' }}>
              <div style={{ borderTop: '1px dotted #64748b', paddingTop: '6px', fontSize: '0.8rem', color: '#475569', fontWeight: 700 }}>
                গ্রাহকের স্বাক্ষর
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
                ✔ {brandName} দ্বারা যাচাইকৃত ও অনুমোদিত
              </div>
            </div>

            <div style={{ textAlign: 'center', width: '180px' }}>
              <div style={{ borderTop: '1px dotted #0f766e', paddingTop: '6px', fontSize: '0.8rem', color: '#0f766e', fontWeight: 800 }}>
                কর্তৃপক্ষের স্বাক্ষর
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
