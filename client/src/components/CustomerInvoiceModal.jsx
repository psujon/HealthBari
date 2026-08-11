import React from 'react';
import { Printer, X, ShieldCheck, PhoneCall, MapPin, CheckCircle2, Download, Package, FileText } from 'lucide-react';

export default function CustomerInvoiceModal({ order, settings, onClose }) {
  if (!order) return null;

  const brandName = settings?.brandName || 'হেলথ বাড়ি';
  const brandLogo = settings?.brandLogo || '/images/healthbari_logo.png';
  const phone = settings?.phone || '01540-696573';
  const whatsappNumber = settings?.whatsappNumber || '8801540696573';
  const address = settings?.address || 'কাশিমপুর, গাজীপুর';

  // Safe Order Data Extraction
  const orderId = order.orderId || order.order_id || 'HB-' + Math.floor(1000 + Math.random() * 9000);
  const customerName = order.customer?.name || order.customerName || order.name || 'সম্মানিত গ্রাহক';
  const customerPhone = order.customer?.phone || order.customerPhone || order.phone || 'N/A';
  const customerAddress = order.customer?.address || order.customerAddress || order.address || 'ঢাকা, বাংলাদেশ';
  const customerNote = order.customer?.note || order.customerNote || order.note || '';
  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = order.subtotal || items.reduce((sum, it) => sum + (it.price * (it.quantity || 1)), 0);

  const deliveryArea = order.deliveryArea || order.delivery_area || 'inside_dhaka';
  const isInside = deliveryArea === 'inside_dhaka';

  const insideDhakaRate = (settings?.shippingInsideDhaka !== undefined && settings?.shippingInsideDhaka !== null && !isNaN(Number(settings.shippingInsideDhaka)))
    ? Number(settings.shippingInsideDhaka)
    : 0;
  const outsideDhakaRate = (settings?.shippingOutsideDhaka !== undefined && settings?.shippingOutsideDhaka !== null && !isNaN(Number(settings.shippingOutsideDhaka)))
    ? Number(settings.shippingOutsideDhaka)
    : 0;

  // Exact shipping charge from order or according to selected deliveryArea rate
  let shippingCharge = 0;
  if (order.shippingCharge !== undefined && order.shippingCharge !== null && !isNaN(Number(order.shippingCharge))) {
    shippingCharge = Number(order.shippingCharge);
  } else if (order.shipping_charge !== undefined && order.shipping_charge !== null && !isNaN(Number(order.shipping_charge))) {
    shippingCharge = Number(order.shipping_charge);
  } else {
    shippingCharge = isInside ? insideDhakaRate : outsideDhakaRate;
  }

  const discountAmount = order.discountAmount || 0;
  const couponCode = order.couponCode || null;
  const grandTotal = order.grandTotal || Math.max(0, subtotal + shippingCharge - discountAmount);
  const deliveryAreaText = isInside ? 'কাশিমপুর (গাজীপুর) এরিয়ার ভেতরে' : 'কাশিমপুর (গাজীপুর) এরিয়ার বাহিরে';
  const paymentMethod = order.paymentMethod || 'ক্যাশ অন ডেলিভারি (Cash on Delivery)';

  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 120 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '800px', maxHeight: '92vh', overflowY: 'auto', padding: '0', background: '#f8fafc', borderRadius: '16px' }}
      >
        {/* Top Floating Actions (Hidden in Print) */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: '#0f766e', color: '#ffffff', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} />
            <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>কাস্টমার ক্যাশ ইনভয়েস ও মেমো (Customer Invoice)</span>
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
              <span>ইনভয়েস ডাউনলোড / প্রিন্ট</span>
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

        {/* Printable Customer Invoice Document Body */}
        <div className="printable-invoice" style={{ padding: '2.25rem', background: '#ffffff', margin: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>

          {/* 1. Header with Logo & Brand Info */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '2.5px solid #0f766e', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: '12px', background: '#f0fdfa', border: '2px solid #99f6e4', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img
                  src={brandLogo}
                  alt={brandName}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => { e.target.src = '/images/healthbari_logo.png'; }}
                />
              </div>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f766e', margin: 0, letterSpacing: '-0.5px' }}>
                  {brandName}
                </h1>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  আপনার পরিবারের বিশ্বস্ত ডিজিটাল স্বাস্থ্য সঙ্গী
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>📍 {address}</span>
                  <span>📞 {phone}</span>
                </div>
              </div>
            </div>

            {/* Document Title & Invoice Meta */}
            <div style={{ textAlign: 'right' }}>
              <div style={{
                display: 'inline-block',
                background: '#f0fdfa',
                color: '#0f766e',
                border: '1.5px solid #0d9488',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 800,
                marginBottom: '6px'
              }}>
                ক্যাশ ইনভয়েস / মানি রিসিট
              </div>
              <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                <div><strong>ইনভয়েস নং:</strong> <span className="font-numeric" style={{ color: '#0f766e', fontWeight: 800 }}>#{orderId}</span></div>
                <div><strong>তারিখ:</strong> <span className="font-numeric">{orderDate}</span></div>
                <div><strong>পেমেন্ট মোড:</strong> <span style={{ color: '#059669', fontWeight: 700 }}>ক্যাশ অন ডেলিভারি</span></div>
              </div>
            </div>
          </div>

          {/* 2. Customer & Shipping Info Box */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1.25rem', marginBottom: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem 1.25rem' }}>

            {/* Left: Customer Information */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>
                👤 গ্রাহকের বিবরণ (Bill To):
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
                {customerName}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                <div><strong>ফোন নম্বর:</strong> <span className="font-numeric" style={{ fontWeight: 700 }}>{customerPhone}</span></div>
                <div><strong>ঠিকানা:</strong> {customerAddress}</div>
              </div>
            </div>

            {/* Right: Delivery & Order Notes */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>
                🚚 ডেলিভারি ও অর্ডার তথ্য:
              </div>
              <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.6 }}>
                <div><strong>ডেলিভারি এরিয়া:</strong> {deliveryAreaText}</div>
                <div><strong>ডেলিভারি পদ্ধতি:</strong> হোম ডেলিভারি (কুরিয়ার এক্সপ্রেস)</div>
                {customerNote && (
                  <div style={{ marginTop: '2px', color: '#b45309' }}>
                    <strong>বিশেষ নোট:</strong> "{customerNote}"
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* 3. Itemized Products Table */}
          <div style={{ marginBottom: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
              <thead style={{ background: '#f0fdfa', borderBottom: '1.5px solid #0d9488', color: '#0f766e' }}>
                <tr>
                  <th style={{ padding: '0.65rem 0.85rem', width: '40px', textAlign: 'center' }}>নং</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>পণ্যের নাম ও প্যাকেজ বিবরণ</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center', width: '90px' }}>পরিমাণ</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right', width: '120px' }}>একক মূল্য</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right', width: '130px' }}>মোট মূল্য</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center', color: '#64748b', fontWeight: 600 }} className="font-numeric">
                        {idx + 1}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{it.title || it.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          প্যাকেজ: {it.variantName || 'স্ট্যান্ডার্ড প্যাকেজ'}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center', fontWeight: 700, color: '#0f172a' }} className="font-numeric">
                        {it.quantity} টি
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', color: '#334155' }} className="font-numeric">
                        {it.price}৳
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', fontWeight: 800, color: '#0f172a' }} className="font-numeric">
                        {it.price * it.quantity}৳
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>
                      কোনো পণ্যের বিবরণ পাওয়া যায়নি।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 4. Financial Calculations & COD Box */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>

            {/* Left Box: Terms & Guarantees */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#475569', lineHeight: 1.6 }}>
              <div style={{ fontWeight: 800, color: '#0f766e', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={16} />
                <span>ওয়ারেন্টি ও রিটার্ন নীতিমালা:</span>
              </div>
              <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                <li>সকল ডিজিটাল মেডিকেল ডিভাইসে <strong>অফিশিয়াল ওয়ারেন্টি ও গ্যারান্টি</strong> প্রযোজ্য ক্ষেত্রে।</li>
                <li>ডেলিভারি রাইডারের সামনে প্যাকেট খুলে পণ্য ও বিবরণ মিলিয়ে দেখে ক্যাশ প্রদান করুন।</li>
                <li>যেকোনো ত্রুটি বা সহায়তার জন্য ক্রয়ের ৭ দিনের মধ্যে হেল্পলাইনে যোগাযোগ করুন।</li>
              </ul>
            </div>

            {/* Right Box: Total Billing Summary */}
            <div style={{ background: '#f0fdfa', padding: '1rem 1.25rem', borderRadius: '10px', border: '1.5px solid #99f6e4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem', color: '#334155' }}>
                <span>পণ্য উপ-মোট (Subtotal):</span>
                <span className="font-numeric" style={{ fontWeight: 700 }}>{subtotal}৳</span>
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem', color: '#059669', fontWeight: 700 }}>
                  <span>কুপন ডিসকাউন্ট {couponCode ? `(${couponCode})` : ''}:</span>
                  <span className="font-numeric">−{discountAmount}৳</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem', color: '#334155' }}>
                <span>হোম ডেলিভারি চার্জ ({deliveryAreaText}):</span>
                <span className="font-numeric" style={{ fontWeight: 700, color: shippingCharge === 0 ? '#059669' : '#0f172a' }}>
                  {shippingCharge === 0 ? '০৳' : `${shippingCharge}৳`}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px dashed #0d9488', paddingTop: '8px', marginTop: '4px' }}>
                <span style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>সর্বমোট প্রদেয় টাকা:</span>
                <span className="font-numeric" style={{ fontSize: '1.35rem', fontWeight: 900, color: '#047857' }}>
                  {grandTotal}৳
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#0f766e', textAlign: 'right', marginTop: '2px', fontWeight: 600 }}>
                (ক্যাশ অন ডেলিভারি - পণ্য বুঝে পেয়ে পরিশোধ করুন)
              </div>
            </div>

          </div>

          {/* 5. Footer: Seals, Signatures & Helpline */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '1rem' }}>

            {/* Customer Helpline Reminder */}
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              <div>হেলথ বাড়ি কাস্টমার কেয়ার: <strong style={{ color: '#0f766e' }}>{phone}</strong></div>
              <div>আমাদের সাথে থাকার জন্য ধন্যবাদ! সুস্থ থাকুন, নিরাপদে থাকুন।</div>
            </div>

            {/* Official Store Seal */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-block',
                border: '2px solid #0d9488',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#0d9488',
                background: '#f0fdfa'
              }}>
                ✔ VERIFIED & QUALITY CHECKED
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>হেলথ বাড়ি অথোরাইজড ইনভয়েস</div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
