import React, { useState } from 'react';
import { 
  X, Truck, CheckCircle2, Clock, AlertCircle, Printer, Search, 
  Send, RefreshCw, BarChart3, Package, ShieldCheck
} from 'lucide-react';

export default function AdminSimulationModal({ isOpen, onClose, orders, onUpdateOrderStatus }) {
  if (!isOpen) return null;

  const [activeFilter, setActiveFilter] = useState('all');
  const [loadingCourierId, setLoadingCourierId] = useState(null);

  const filteredOrders = orders.filter(ord => {
    if (activeFilter === 'all') return true;
    return ord.status === activeFilter;
  });

  const totalSales = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;

  const handleSendToSteadfast = (orderId) => {
    setLoadingCourierId(orderId);
    setTimeout(() => {
      const tracking = 'ST-' + Math.floor(100000 + Math.random() * 900000);
      onUpdateOrderStatus(orderId, 'In Courier', {
        courierName: 'Steadfast Courier',
        trackingCode: tracking
      });
      setLoadingCourierId(null);
    }, 800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '1100px', maxHeight: '92vh', padding: '1.75rem' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-teal">হেলদি বাড়ি এডমিন ড্যাশবোর্ড</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>React + Node.js Courier Automation</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
              অর্ডার ও কুরিয়ার অটোমেশন প্যানেল (Steadfast / Pathao Sync)
            </h2>
          </div>
          <button 
            onClick={onClose}
            style={{ background: '#f1f5f9', border: 'none', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 4 Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ marginBottom: '1.5rem' }}>
          <div className="card" style={{ padding: '1rem', background: '#f0fdfa' }}>
            <span style={{ fontSize: '0.75rem', color: '#0f766e', fontWeight: 600 }}>মোট অর্ডার</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }} className="font-numeric">
              {orders.length} টি
            </div>
          </div>
          <div className="card" style={{ padding: '1rem', background: '#fffbeb' }}>
            <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>পেন্ডিং অর্ডার (বুকিং বাকি)</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b45309' }} className="font-numeric">
              {pendingOrdersCount} টি
            </div>
          </div>
          <div className="card" style={{ padding: '1rem', background: '#ecfdf5' }}>
            <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>মোট সেলস পরিমাণ</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#047857' }} className="font-numeric">
              {totalSales} ৳
            </div>
          </div>
          <div className="card" style={{ padding: '1rem', background: '#f8fafc' }}>
            <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>সাকসেস ডেলিভারি রেট</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0284c7' }} className="font-numeric">
              98.4%
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-4 flex-wrap" style={{ marginBottom: '1rem' }}>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveFilter('all')}
              className={`btn ${activeFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
            >
              সকল অর্ডার ({orders.length})
            </button>
            <button 
              onClick={() => setActiveFilter('Pending')}
              className={`btn ${activeFilter === 'Pending' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
            >
              নতুন পেন্ডিং ({pendingOrdersCount})
            </button>
            <button 
              onClick={() => setActiveFilter('In Courier')}
              className={`btn ${activeFilter === 'In Courier' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
            >
              কুরিয়ারে আছে ({orders.filter(o => o.status === 'In Courier').length})
            </button>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            💡 ১-ক্লিকে কুরিয়ারে বুকিং দিলে সাথে সাথে পার্সেল আইডি তৈরি হয়
          </div>
        </div>

        {/* Orders Table */}
        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem' }}>অর্ডার আইডি</th>
                <th style={{ padding: '0.75rem 1rem' }}>গ্রাহকের নাম ও ফোন</th>
                <th style={{ padding: '0.75rem 1rem' }}>পণ্য ও ভ্যারিয়েন্ট</th>
                <th style={{ padding: '0.75rem 1rem' }}>টোটাল</th>
                <th style={{ padding: '0.75rem 1rem' }}>স্ট্যাটাস</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>কুরিয়ার একশন</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    কোনো অর্ডার পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.orderId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0d9488' }} className="font-numeric">
                      #{ord.orderId}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{ord.customer.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }} className="font-numeric">{ord.customer.phone}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{ord.customer.address}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {ord.items.map((it, idx) => (
                        <div key={idx} style={{ fontSize: '0.8rem' }}>
                          • {it.title} ({it.quantity}x)
                        </div>
                      ))}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#0f172a' }} className="font-numeric">
                      {ord.grandTotal}৳
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {ord.status === 'Pending' && (
                        <span className="badge badge-warning">অপেক্ষমাণ (Pending)</span>
                      )}
                      {ord.status === 'In Courier' && (
                        <div className="flex flex-col gap-1">
                          <span className="badge badge-teal">🚚 কুরিয়ারে আছে</span>
                          <span style={{ fontSize: '0.7rem', color: '#0f766e' }} className="font-numeric">
                            {ord.courierInfo?.trackingCode}
                          </span>
                        </div>
                      )}
                      {ord.status === 'Delivered' && (
                        <span className="badge badge-success">✔ ডেলিভার্ড</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      {ord.status === 'Pending' ? (
                        <button 
                          onClick={() => handleSendToSteadfast(ord.orderId)}
                          disabled={loadingCourierId === ord.orderId}
                          className="btn btn-buy-now"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                        >
                          <Send size={13} />
                          <span>{loadingCourierId === ord.orderId ? 'বুকিং হচ্ছে...' : 'Steadfast এ পাঠান'}</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => onUpdateOrderStatus(ord.orderId, 'Delivered')}
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        >
                          Mark Delivered
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
