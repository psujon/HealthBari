import React, { useEffect } from 'react';
import { ShieldCheck, FileText, ArrowLeft, CheckCircle2, AlertCircle, RotateCcw, Truck, Award, Phone } from 'lucide-react';

export default function TermsConditionsView({ onBackToHome, settings }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const brandName = settings?.brandName || 'হেলথ বাড়ি';
  const phone = settings?.phone || '01540-696573';

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem', maxWidth: '960px', margin: '0 auto' }}>

      {/* Back Button & Breadcrumb */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          onClick={onBackToHome}
          className="btn btn-outline"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            color: '#0d9488',
            borderColor: '#0d9488',
            fontWeight: 700,
            borderRadius: '10px'
          }}
        >
          <ArrowLeft size={16} />
          <span>মূল স্টোরে ফিরে যান</span>
        </button>

        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
          <span>হোম</span> <span style={{ margin: '0 4px' }}>/</span> <strong style={{ color: '#0f172a' }}>শর্তাবলী ও নিয়মাবলী</strong>
        </div>
      </div>

      {/* Main Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #042f2e 0%, #0f766e 100%)',
          color: '#ffffff',
          padding: '2.5rem 2rem',
          borderRadius: '20px',
          marginBottom: '2rem',
          boxShadow: '0 10px 25px rgba(13, 148, 136, 0.2)'
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', padding: '4px 12px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
          <FileText size={15} />
          <span>অফিশিয়াল আইনি নীতিমালা</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.75rem 0', color: '#ffffff' }}>
          শর্তাবলী ও নিয়মাবলী (Terms & Conditions)
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#ccfbf1', margin: 0, maxWidth: '700px', lineHeight: 1.6 }}>
          {brandName}-এ কেনাকাটা ও সেবা গ্রহণের জন্য সাধারণ শর্তাবলী। গ্রাহকদের ১০০% নিরাপদ ও নির্ভরযোগ্য সেবা নিশ্চিত করতে আমাদের এই নীতিমালা প্রণীত।
        </p>
      </div>

      {/* Terms Content Body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* 1. General Introduction */}
        <div className="card" style={{ padding: '1.75rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ width: 28, height: 28, borderRadius: '8px', background: '#f0fdfa', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>১</span>
            সাধারণ ভূমিকা (General Terms)
          </h2>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.8, margin: 0 }}>
            <strong>{brandName}</strong> থেকে যেকোনো মেডিকেল ডিভাইস, হেলথ গ্যাজেট বা পণ্য ক্রয়ের মাধ্যমে আপনি আমাদের সকল শর্তাবলী মেনে নিচ্ছেন বলে গণ্য হবে। আমরা সর্বদা ১০০% অরিজিনাল এবং কোয়ালিটি সার্টিফাইড পণ্য সরবরাহে প্রতিশ্রুতিবদ্ধ।
          </p>
        </div>

        {/* 2. Ordering & Payment */}
        <div className="card" style={{ padding: '1.75rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ width: 28, height: 28, borderRadius: '8px', background: '#f0fdfa', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>২</span>
            অর্ডার ও পেমেন্ট পলিসি (Order & Payment)
          </h2>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.925rem', color: '#334155', lineHeight: 1.8, margin: 0 }}>
            <li>আমাদের ওয়েবসাইটে কোনো অগ্রিম টাকা প্রদান ছাড়াই <strong>ক্যাশ অন ডেলিভারি (Cash on Delivery)</strong>-তে অর্ডার করা যায়।</li>
            <li>অর্ডার সম্পন্ন হওয়ার পর আমাদের কাস্টমার কেয়ার টিম ফোন কলের মাধ্যমে অর্ডারটি কনফার্ম করতে পারে।</li>
            <li>কুপন বা ডিসকাউন্ট কোড ব্যবহারের ক্ষেত্রে একটি অর্ডারে সর্বোচ্চ একটি বৈধ কুপন প্রযোজ্য হবে।</li>
          </ul>
        </div>

        {/* 3. Delivery & Shipping */}
        <div className="card" style={{ padding: '1.75rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Truck size={22} color="#0d9488" />
            <span>৩. ডেলিভারি নীতিমালা (Delivery Terms)</span>
          </h2>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.925rem', color: '#334155', lineHeight: 1.8, margin: 0 }}>
            <li><strong>কাশিমপুর (গাজীপুর) ভিতরে:</strong> অর্ডার কনফার্মেশনের পর ২৪ থেকে ৪৮ ঘণ্টার মধ্যে দ্রুততম হোম ডেলিভারি।</li>
            <li><strong>গাজীপুর (কাশিমপুর) শহরের বাইরে ও সারাদেশে:</strong> বিশ্বস্ত কুরিয়ার সার্ভিসের মাধ্যমে ২ থেকে ৩ কার্যদিবসের মধ্যে ডেলিভারি।</li>
            <li>পার্সেল ডেলিভারির সময় গ্রাহক ট্র্যাকিং কোড দিয়ে অনলাইনে যেকোনো সময় পার্সেলের লাইভ স্ট্যাটাস দেখতে পারবেন।</li>
          </ul>
        </div>

        {/* 4. Warranty & Replacement Policy */}
        <div className="card" style={{ padding: '1.75rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', borderLeft: '5px solid #0d9488' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f766e', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Award size={22} color="#0d9488" />
            <span>৪. রিপ্লেসমেন্ট ওয়ারেন্টি পলিসি</span>
          </h2>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.8, marginBottom: '0.75rem' }}>
            সকল ইলেকট্রনিক মেডিকেল ডিভাইসে (যেমন: ব্লাড প্রেশার মনিটর, গ্লুকোমিটার, নেবুলাইজার, পালস অক্সিমিটার) <strong>অফিশিয়াল রিপ্লেসমেন্ট গ্যারান্টি/ওয়ারেন্টি</strong> প্রদান করা হয় (প্রযোজ্য ক্ষেত্রে)।
          </p>
          <div style={{ background: '#f0fdfa', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #ccfbf1', fontSize: '0.875rem', color: '#0f766e' }}>
            <strong>ওয়ারেন্টির আওতাভুক্ত শর্তাবলী:</strong>
            <ul style={{ paddingLeft: '1.25rem', margin: '6px 0 0 0', lineHeight: 1.7 }}>
              <li>ডিভাইসের অভ্যন্তরীণ সার্কিট বা সেন্সরে কোনো যান্ত্রিক ত্রুটি দেখা দিলে সম্পূর্ণ ফ্রি রিপ্লেসমেন্ট।</li>
              <li>ভাঙ্গা, পানিতে ভেজা বা গ্রাহকের অসাবধানতায় শারীরিক ক্ষতিগ্রস্ত পণ্য ওয়ারেন্টির আওতাভুক্ত নয়।</li>
            </ul>
          </div>
        </div>

        {/* 5. Return & Refund Policy */}
        <div className="card" style={{ padding: '1.75rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <RotateCcw size={22} color="#0284c7" />
            <span>৫. রিটার্ন ও রিফান্ড পলিসি (Return & Refund)</span>
          </h2>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.925rem', color: '#334155', lineHeight: 1.8, margin: 0 }}>
            <li>ডেলিভারির সময় প্রোডাক্টে কোনো ত্রুটি থাকলে ডেলিভারি ম্যানের সামনেই চেক করে রিটার্ন করতে পারবেন।</li>
            <li>পণ্য পাওয়ার ৭ দিনের মধ্যে যেকোনো ত্রুটির জন্য আমাদের হেল্পলাইনে যোগাযোগ করে ইনস্ট্যান্ট সমাধান বা পরিবর্তন নেওয়া যাবে।</li>
          </ul>
        </div>

        {/* 6. Contact & Support Box */}
        <div
          className="card"
          style={{
            padding: '1.5rem',
            background: '#f8fafc',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              কোনো প্রশ্ন বা সাহায্যের প্রয়োজন?
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0 0' }}>
              আমাদের কাস্টমার কেয়ার টিম ২৪/৭ স্বাস্থ্য ও ডিভাইস পরামর্শে নিয়োজিত।
            </p>
          </div>
          <a
            href={`tel:${phone}`}
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.6rem 1.25rem',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}
          >
            <Phone size={16} />
            <span>কল করুন: {phone}</span>
          </a>
        </div>

      </div>

    </div>
  );
}
