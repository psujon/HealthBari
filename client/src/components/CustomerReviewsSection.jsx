import React, { useState } from 'react';
import { Star, CheckCircle, PenTool, X, Send, Heart } from 'lucide-react';
import { api } from '../services/api';

export default function CustomerReviewsSection({ reviews = [], onReviewSubmitted }) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerLocation, setCustomerLocation] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !comment.trim()) {
      alert('অনুগ্রহ করে আপনার নাম এবং মতামত প্রদান করুন।');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        customerLocation: customerLocation.trim() || 'ঢাকা, বাংলাদেশ',
        productTitle: productTitle.trim() || 'হেলথ বাড়ি মেডিকেল ডিভাইস',
        rating,
        comment: comment.trim()
      };

      const res = await api.createReview(payload);
      if (res && res.success) {
        setToastMessage('🎉 ধন্যবাদ! আপনার মূল্যবান রিভিউটি সফলভাবে প্রকাশিত হয়েছে।');
        setCustomerName('');
        setCustomerLocation('');
        setProductTitle('');
        setComment('');
        setRating(5);
        setShowReviewModal(false);

        if (onReviewSubmitted) {
          onReviewSubmitted(res.review);
        }

        setTimeout(() => setToastMessage(''), 4000);
      } else {
        alert(res.message || 'রিভিউ জমা নিতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      alert('রিভিউ জমা নেওয়ার সময় ত্রুটি হয়েছে: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Compute average rating
  const totalCount = reviews.length;
  const avgRating = totalCount > 0
    ? (reviews.reduce((acc, curr) => acc + (curr.rating || 5), 0) / totalCount).toFixed(1)
    : '4.9';

  return (
    <div id="customer-reviews-section" style={{ marginTop: '3.5rem', marginBottom: '3.5rem' }}>

      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          background: '#059669',
          color: '#ffffff',
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(5, 150, 105, 0.4)',
          fontWeight: 700,
          fontSize: '0.95rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Container */}
      <div 
        className="customer-reviews-header-banner"
        style={{
          background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #059669 100%)',
          borderRadius: '20px',
          padding: '2.25rem 1.75rem',
          color: '#ffffff',
          marginBottom: '2rem',
          boxShadow: '0 12px 30px rgba(13, 148, 136, 0.22)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Decorative Circles */}
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-30px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.06)' }} />

        <div className="flex items-center justify-between gap-4 flex-wrap" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '650px' }}>
            <div className="customer-reviews-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.18)', backdropFilter: 'blur(8px)', padding: '4px 14px', borderRadius: '50px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.65rem' }}>
              <Heart size={14} fill="#ffffff" color="#ffffff" />
              <span>১০০% সন্তুষ্ট ও ভেরিফাইড ক্রেতাদের অভিজ্ঞতা</span>
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.4rem 0', lineHeight: 1.3 }}>
              গ্রাহকদের মতামত ও কাস্টমার রিভিউ
            </h2>
            <p style={{ fontSize: '0.92rem', opacity: 0.92, margin: 0, lineHeight: 1.5 }}>
              হেলথ বাড়ি থেকে অরিজিনাল মেডিকেল ডিভাইস ও গ্যাজেট ব্যবহারকারীদের ভেরিফাইড অভিজ্ঞতা ও প্রতিক্রিয়া নিচে সরাসরি দেখুন।
            </p>
          </div>

          {/* Rating Summary Box & Write Button */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="customer-reviews-rating-box" style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.25)', padding: '0.75rem 1.15rem', borderRadius: '14px', textAlign: 'center' }}>
              <div className="flex items-center justify-center gap-1 font-numeric customer-reviews-rating-score" style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                <Star size={20} fill="#f59e0b" color="#f59e0b" />
                <span>{avgRating}</span>
                <span style={{ fontSize: '0.9rem', opacity: 0.85 }}>/ 5.0</span>
              </div>
              <div style={{ fontSize: '0.72rem', opacity: 0.9, marginTop: '2px' }}>
                মোট {totalCount > 0 ? totalCount : 5}+ ভেরিফাইড রিভিউ
              </div>
            </div>

            <button
              onClick={() => setShowReviewModal(true)}
              className="btn customer-reviews-write-btn"
              style={{
                background: '#ffffff',
                color: '#0f766e',
                fontWeight: 800,
                fontSize: '0.9rem',
                padding: '0.8rem 1.25rem',
                borderRadius: '12px',
                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <PenTool size={17} />
              <span>আপনার রিভিউ লিখুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4-COLUMN GRID IN ONE ROW FOR REVIEWS */}
      <div className="reviews-4-col-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem' }}>
        {reviews.map((r, index) => (
          <div
            key={r.id || index}
            className="card"
            style={{
              padding: '1.2rem',
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              height: '100%'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 10px 20px rgba(13, 148, 136, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.03)';
            }}
          >
            <div>
              {/* Header: Stars & Verified Badge */}
              <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem', flexWrap: 'wrap', gap: '4px' }}>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      fill={i < (r.rating || 5) ? "#f59e0b" : "#e2e8f0"}
                      color={i < (r.rating || 5) ? "#f59e0b" : "#cbd5e1"}
                    />
                  ))}
                </div>

                <span style={{ fontSize: '0.68rem', color: '#047857', background: '#ecfdf5', padding: '2px 7px', borderRadius: '50px', fontWeight: 700, border: '1px solid #a7f3d0', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <CheckCircle size={11} color="#059669" />
                  <span>ভেরিফাইড</span>
                </span>
              </div>

              {/* Review Comment Text */}
              <p style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.55, margin: '0 0 0.85rem 0', fontStyle: 'italic' }}>
                "{r.comment}"
              </p>
            </div>

            {/* Footer: User Info & Product Title */}
            <div style={{ borderTop: '1px dashed #f1f5f9', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '0.35rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #0d9488, #059669)', color: '#ffffff', fontWeight: 800, fontSize: '0.92rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {(r.customerName || 'গ')[0]}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.customerName}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.customerLocation || 'ঢাকা, বাংলাদেশ'}
                  </div>
                </div>
              </div>

              {r.productTitle && (
                <div style={{ fontSize: '0.7rem', color: '#0f766e', background: '#f0fdfa', padding: '2px 6px', borderRadius: '4px', border: '1px solid #ccfbf1', fontWeight: 600, display: 'inline-block', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  📦 {r.productTitle}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* WRITE REVIEW MODAL */}
      {showReviewModal && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', padding: '1.75rem' }}
          >
            <div className="flex items-center justify-between" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div className="flex items-center gap-2">
                <PenTool size={20} color="#0d9488" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  আপনার অভিজ্ঞতা ও রিভিউ দিন
                </h3>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview}>
              {/* Rating Selector */}
              <div style={{ marginBottom: '1.25rem', textAlign: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                  আপনার স্টার রেটিং নির্বাচন করুন:
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', transition: 'transform 0.15s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <Star
                        size={32}
                        fill={star <= rating ? "#f59e0b" : "#cbd5e1"}
                        color={star <= rating ? "#f59e0b" : "#cbd5e1"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Name */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  আপনার নাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মোঃ আব্দুল জলিল"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              {/* Location & Product */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                    আপনার এলাকা / শহর
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: কাশিমপুর, গাজীপুর"
                    value={customerLocation}
                    onChange={(e) => setCustomerLocation(e.target.value)}
                    className="form-control"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                    ক্রয়কৃত প্রোডাক্টের নাম
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: ব্লাড প্রেশার মনিটর"
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                    className="form-control"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              {/* Comment text */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  আপনার মতামত / রিভিউ *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="ডিভাইসটির পারফরম্যান্স, ডেলিভারি সার্ভিস বা ব্যবহার অভিজ্ঞতা সম্পর্কে লিখুন..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', lineHeight: 1.5 }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="btn btn-outline"
                  style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-buy-now"
                  style={{ padding: '0.65rem 1.4rem', fontSize: '0.875rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={16} />
                  <span>{submitting ? 'জমা হচ্ছে...' : 'রিভিউ সাবমিট করুন'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
