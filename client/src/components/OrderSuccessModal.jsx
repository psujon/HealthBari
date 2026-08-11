import React, { useState, useEffect } from 'react';
import { CheckCircle, Printer, MessageSquare, ArrowRight, Truck, FileText, Download, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import CustomerInvoiceModal from './CustomerInvoiceModal';

export default function OrderSuccessModal({ order, settings, onClose }) {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  if (!order) return null;

  useEffect(() => {
    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log('Confetti effect');
    }
  }, []);

  // Safe fallback extractors
  const customerName = order?.customer?.name || order?.customerName || order?.name || 'সম্মানিত গ্রাহক';
  const customerPhone = order?.customer?.phone || order?.customerPhone || order?.phone || 'প্রদান করা হয়নি';
  const customerAddress = order?.customer?.address || order?.customerAddress || order?.address || 'ঢাকা, বাংলাদেশ';
  const orderId = order?.orderId || order?.order_id || 'HB-' + Math.floor(1000 + Math.random() * 9000);
  const items = Array.isArray(order?.items) ? order.items : [];
  const grandTotal = order?.grandTotal || order?.grand_total || order?.subtotal || 0;

  const deliveryArea = order?.deliveryArea || order?.delivery_area || 'inside_dhaka';
  const isInside = deliveryArea === 'inside_dhaka';

  const insideDhakaRate = (settings?.shippingInsideDhaka !== undefined && settings?.shippingInsideDhaka !== null && !isNaN(Number(settings.shippingInsideDhaka)))
    ? Number(settings.shippingInsideDhaka)
    : 0;
  const outsideDhakaRate = (settings?.shippingOutsideDhaka !== undefined && settings?.shippingOutsideDhaka !== null && !isNaN(Number(settings.shippingOutsideDhaka)))
    ? Number(settings.shippingOutsideDhaka)
    : 0;

  let shippingCharge = 0;
  if (order?.shippingCharge !== undefined && order?.shippingCharge !== null && !isNaN(Number(order.shippingCharge))) {
    shippingCharge = Number(order.shippingCharge);
  } else if (order?.shipping_charge !== undefined && order?.shipping_charge !== null && !isNaN(Number(order.shipping_charge))) {
    shippingCharge = Number(order.shipping_charge);
  } else {
    shippingCharge = isInside ? insideDhakaRate : outsideDhakaRate;
  }

  const deliveryAreaText = isInside ? 'কাশিমপুর (গাজীপুর) এরিয়ার ভেতরে' : 'কাশিমপুর (গাজীপুর) এরিয়ার বাহিরে';
  const discountAmount = order?.discountAmount || 0;
  const couponCode = order?.couponCode || null;
  const whatsappNumber = settings?.whatsappNumber || '8801540696573';

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '650px', padding: '2rem 1.75rem', textAlign: 'center' }}
        >
          {/* Printable Bengali Invoice Area */}
          <div className="printable-invoice">

            <div style={{
              width: 70,
              height: 70,
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }} className="no-print">
              <CheckCircle size={44} />
            </div>

            <span className="badge badge-success no-print" style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              🎉 অর্ডার সফল হয়েছে!
            </span>

            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
              ধন্যবাদ, {customerName}!
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে। খুব শীঘ্রই আমাদের প্রতিনিধি ফোন করে অর্ডারটি কনফার্ম করবেন।
            </p>

            {/* Invoice Summary Box */}
            <div style={{
              background: '#f8fafc',
              border: '1.5px dashed #0d9488',
              borderRadius: '12px',
              padding: '1.25rem',
              textAlign: 'left',
              marginBottom: '1.5rem'
            }}>
              <div className="flex items-center justify-between" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>ইনভয়েস নম্বর:</span>
                  <div style={{ fontWeight: 800, color: '#0d9488', fontSize: '1.1rem' }} className="font-numeric">
                    #{orderId}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>পেমেন্ট পদ্ধতি:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>
                    ক্যাশ অন ডেলিভারি
                  </div>
                </div>
              </div>

              {/* Customer info */}
              <div style={{ fontSize: '0.875rem', marginBottom: '0.75rem', color: '#334155' }}>
                <div><strong>গ্রাহকের নাম:</strong> {customerName}</div>
                <div><strong>মোবাইল নম্বর:</strong> <span className="font-numeric">{customerPhone}</span></div>
                <div><strong>ডেলিভারি ঠিকানা:</strong> {customerAddress}</div>
              </div>

              {/* Item list */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', marginBottom: '0.5rem' }}>
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between" style={{ fontSize: '0.875rem', marginBottom: '4px' }}>
                    <span>{item.title || item.name || 'মেডিকেল ডিভাইস'} ({item.variantName || 'স্ট্যান্ডার্ড'}) × {item.quantity || 1}</span>
                    <span className="font-numeric" style={{ fontWeight: 700 }}>{(item.price || 0) * (item.quantity || 1)}৳</span>
                  </div>
                ))}

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between" style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                    <span>কুপন ছাড় {couponCode ? `(${couponCode})` : ''}:</span>
                    <span className="font-numeric">−{discountAmount}৳</span>
                  </div>
                )}

                <div className="flex items-center justify-between" style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                  <span>হোম ডেলিভারি চার্জ ({deliveryAreaText}):</span>
                  <span className="font-numeric" style={{ fontWeight: 700, color: shippingCharge === 0 ? '#059669' : '#0f172a' }}>
                    {shippingCharge === 0 ? '০৳' : `${shippingCharge}৳`}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between" style={{ borderTop: '2px solid #0f172a', paddingTop: '0.5rem', fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>
                <span>সর্বমোট প্রদেয় টাকা:</span>
                <span className="font-numeric" style={{ color: '#059669' }}>{grandTotal}৳</span>
              </div>
            </div>

            {/* Warranty & Delivery Note */}
            <div className="no-print" style={{ background: '#f0fdfa', borderRadius: '10px', padding: '0.85rem', border: '1px solid #99f6e4', marginBottom: '1.5rem', textAlign: 'left' }}>
              <div className="flex items-center gap-2" style={{ color: '#0f766e', fontWeight: 700, fontSize: '0.875rem', marginBottom: '4px' }}>
                <ShieldCheck size={16} />
                <span>অফিশিয়াল ওয়ারেন্টি ও ডেলিভারি নিশ্চয়তা:</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#134e4a', margin: 0 }}>
                সকল ডিভাইসে পাচ্ছেন <strong>রিপ্লেসমেন্ট ওয়ারেন্টি</strong> (প্রযোজ্য ক্ষেত্রে)। পার্সেল ডেলিভারি পাওয়ার পর রাইডারের সামনে চেক করে ক্যাশ পরিশোধ করুন।
              </p>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="no-print flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="btn btn-buy-now"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.65rem 1.25rem' }}
            >
              <FileText size={16} />
              <span>ইনভয়েস ডাউনলোড / প্রিন্ট</span>
            </button>

            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`হ্যালো, আমি হেলথ বাড়ি থেকে #${orderId} নম্বরের অর্ডারটি সম্পন্ন করেছি। বিস্তারিত জানতে যোগাযোগ করছি।`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{ background: '#25D366', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px', padding: '0.65rem 1.25rem' }}
            >
              <MessageSquare size={16} />
              <span>হোয়াটসঅ্যাপে যোগাযোগ</span>
            </a>

            <button
              onClick={onClose}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.65rem 1.25rem' }}
            >
              <span>আরো কেনাকাটা করুন</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </div>

      {/* Full Customer Sales Invoice Modal */}
      {showInvoiceModal && (
        <CustomerInvoiceModal
          order={order}
          settings={settings}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </>
  );
}
