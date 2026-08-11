import React, { useEffect } from 'react';
import { ShieldCheck, Lock, ArrowLeft, CheckCircle2, EyeOff, Server, Phone, HelpCircle } from 'lucide-react';

export default function PrivacyPolicyView({ onBackToHome, settings }) {
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
          <span>হোম</span> <span style={{ margin: '0 4px' }}>/</span> <strong style={{ color: '#0f172a' }}>গোপনীয়তা নীতি (Privacy Policy)</strong>
        </div>
      </div>

      {/* Main Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          padding: '2.5rem 2rem',
          borderRadius: '20px',
          marginBottom: '2rem',
          boxShadow: '0 10px 25px rgba(15, 23, 42, 0.25)'
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.12)', padding: '4px 12px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem', color: '#5eead4' }}>
          <Lock size={15} />
          <span>১০০% ডাটা নিরাপত্তা ও সুরক্ষা</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.75rem 0', color: '#ffffff' }}>
          গোপনীয়তা নীতি (Privacy Policy)
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#94a3b8', margin: 0, maxWidth: '700px', lineHeight: 1.6 }}>
          {brandName}-এ আপনার ব্যক্তিগত তথ্যের নিরাপত্তা আমাদের সর্বোচ্চ অগ্রাধিকার। আপনার তথ্য কীভাবে সুরক্ষিত ও প্রক্রিয়াজাত করা হয় তা নিচে বিস্তারিত দেওয়া হলো।
        </p>
      </div>

      {/* Privacy Policy Content Body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* 1. Information We Collect */}
        <div className="card" style={{ padding: '1.75rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ width: 28, height: 28, borderRadius: '8px', background: '#f0fdfa', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>১</span>
            আমরা যেসব তথ্য সংগ্রহ করি (Information We Collect)
          </h2>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.8, marginBottom: '0.5rem' }}>
            সঠিক ঠিকানায় অর্ডার ডেলিভারি ও দ্রুত যোগাযোগের জন্য আমরা শুধুমাত্র প্রয়োজনীয় তথ্য সংগ্রহ করি:
          </p>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.925rem', color: '#334155', lineHeight: 1.8, margin: 0 }}>
            <li><strong>গ্রাহকের নাম:</strong> ডেলিভারি রিসিভ ও ইনভয়েস তৈরির জন্য।</li>
            <li><strong>ফোন নম্বর:</strong> অর্ডার কনফার্মেশন, ডেলিভারি আপডেট এবং রাইডার যোগাযোগের জন্য।</li>
            <li><strong>ডেলিভারি ঠিকানা:</strong> কুরিয়ারে সঠিক গন্তব্যে পার্সেল পৌঁছে দেওয়ার জন্য।</li>
            <li><strong>ইমেইল (ঐচ্ছিক):</strong> ডিজিটাল ইনভয়েস ও অর্ডার রশিদ পাঠানোর জন্য।</li>
          </ul>
        </div>

        {/* 2. How We Use Your Information */}
        <div className="card" style={{ padding: '1.75rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ width: 28, height: 28, borderRadius: '8px', background: '#f0fdfa', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>২</span>
            তথ্যের ব্যবহার (How We Use Your Information)
          </h2>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.925rem', color: '#334155', lineHeight: 1.8, margin: 0 }}>
            <li>অর্ডার প্রসেসিং, প্যাকিং এবং হোম ডেলিভারি সম্পন্ন করতে।</li>
            <li>অর্ডার স্ট্যাটাস ও ট্র্যাকিং আপডেট এসএমএস বা ফোনে জানাতে।</li>
            <li>ওয়ারেন্টি বা সার্ভিসিং প্রয়োজনে ডিভাইস হিস্ট্রি ভেরিফাই করতে।</li>
          </ul>
        </div>

        {/* 3. Data Protection & Confidentiality */}
        <div className="card" style={{ padding: '1.75rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', borderLeft: '5px solid #0d9488' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f766e', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <EyeOff size={22} color="#0d9488" />
            <span>৩. তথ্যের সর্বোচ্চ গোপনীয়তা ও তৃতীয় পক্ষ সুরক্ষা</span>
          </h2>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.8, margin: 0 }}>
            <strong>{brandName}</strong> কোনো অবস্থাতেই আপনার ব্যক্তিগত তথ্য কোনো বাণিজ্যিক তৃতীয় পক্ষের কাছে বিক্রি, ভাড়া বা শেয়ার করে না। আপনার তথ্য সম্পূর্ণ এনক্রিপ্টেড ও সুরক্ষিত ডাটাবেসে সংরক্ষিত থাকে।
          </p>
        </div>

        {/* 4. Cookies & Website Experience */}
        <div className="card" style={{ padding: '1.75rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Server size={22} color="#0284c7" />
            <span>৪. কুকিজ ও ব্রাউজিং অভিজ্ঞতা (Cookies)</span>
          </h2>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.8, margin: 0 }}>
            আপনার শপিং কার্ট এবং পছন্দের পণ্য সাময়িকভাবে মনে রাখার সুবিধার্থে ব্রাউজার লোকাল স্টোরেজ ও কুকিজ ব্যবহৃত হয়, যা আপনার ব্রাউজিংকে আরও দ্রুত ও সহজ করে তোলে।
          </p>
        </div>

        {/* 5. Customer Rights & Contact */}
        <div
          className="card"
          style={{
            padding: '1.5rem',
            background: '#f0fdfa',
            borderRadius: '16px',
            border: '1px solid #ccfbf1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f766e', margin: 0 }}>
              ডাটা বা তথ্যের নিরাপত্তা সংক্রান্ত জিজ্ঞাসা?
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#134e4a', margin: '2px 0 0 0' }}>
              আপনার যেকোনো তথ্য আপডেট বা ডিলিট করতে আমাদের সাপোর্ট সেন্টারে যোগাযোগ করুন।
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
            <span>সরাসরি কল: {phone}</span>
          </a>
        </div>

      </div>

    </div>
  );
}
