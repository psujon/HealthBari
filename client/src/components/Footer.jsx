import React from 'react';
import { PhoneCall, MapPin, ShieldCheck, HeartPulse, CheckCircle2 } from 'lucide-react';

export default function Footer({ onNavigate, settings }) {
  const brandName = settings?.brandName || 'হেলথ বাড়ি';
  const brandLogo = settings?.brandLogo || '/images/healthbari_logo.png';
  const phone = settings?.phone || '01540-696573';
  const whatsappNumber = settings?.whatsappNumber || '8801540696573';
  const address = settings?.address || 'কাশিমপুর, গাজীপুর';
  const facebookUrl = settings?.facebookUrl || 'https://facebook.com/healthbari';

  return (
    <footer style={{ backgroundColor: '#f0fdf4', borderTop: '1px solid #dcfce7', marginTop: 'auto', paddingTop: '1.75rem', paddingBottom: '1.25rem' }}>
      <div className="container">

        {/* 4-Column Grid Structure */}
        <div className="footer-4-grid" style={{ marginBottom: '1.25rem' }}>

          {/* Column 1: Brand & Contact Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                border: '1.5px solid #a7f3d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <img src={brandLogo} alt={`${brandName} Logo`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.src = '/images/healthbari_logo.png'; }} />
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f766e', lineHeight: 1 }}>
                {brandName}
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div className="flex items-center gap-1">
                <MapPin size={13} color="#0d9488" />
                <span>{address}</span>
              </div>
              <a href={`tel:${phone.replace(/[^0-9]/g, '')}`} className="flex items-center gap-1 font-numeric" style={{ color: '#0f766e', textDecoration: 'none', fontWeight: 700 }}>
                <PhoneCall size={13} color="#0d9488" />
                <span>{phone}</span>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              কোম্পানি
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>
                <a href="#home" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} style={{ color: '#475569', textDecoration: 'none' }}>
                  হোম (Home)
                </a>
              </li>
              <li>
                <a href="#products" onClick={(e) => { e.preventDefault(); onNavigate('products'); }} style={{ color: '#475569', textDecoration: 'none' }}>
                  সকল হেলথ গ্যাজেট
                </a>
              </li>
              <li>
                <a href="#tips" onClick={(e) => { e.preventDefault(); onNavigate('health-tips'); }} style={{ color: '#475569', textDecoration: 'none' }}>
                  স্বাস্থ্য গাইড ও টিপস
                </a>
              </li>
              <li>
                <a href="#track" onClick={(e) => { e.preventDefault(); onNavigate('track-parcel'); }} style={{ color: '#0d9488', textDecoration: 'none', fontWeight: 700 }}>
                  🚚 পার্সেল ট্র্যাক করুন
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal Information & Warranty */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              আইনি তথ্য ও ওয়ারেন্টি
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>
                <a
                  href="#terms"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigate) onNavigate('terms');
                  }}
                  style={{ color: '#475569', textDecoration: 'none', cursor: 'pointer' }}
                  className="hover:text-teal-600"
                >
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a
                  href="#privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigate) onNavigate('privacy');
                  }}
                  style={{ color: '#475569', textDecoration: 'none', cursor: 'pointer' }}
                  className="hover:text-teal-600"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#warranty"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigate) onNavigate('terms');
                  }}
                  style={{ color: '#475569', textDecoration: 'none', cursor: 'pointer' }}
                  className="hover:text-teal-600"
                >
                  ২ বছরের রিপ্লেসমেন্ট ওয়ারেন্টি পলিসি
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Social Media & Trust Badge */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.6rem' }}>
              কানেক্টেড থাকুন
            </h4>
            <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '0.6rem' }}>
              <div className="flex items-center gap-2">
                {/* Facebook Button */}
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: '#1877F2',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    boxShadow: '0 2px 6px rgba(24, 119, 242, 0.35)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                  }}
                  className="hover:scale-105"
                  title="Facebook পেজে যোগ দিন"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* WhatsApp Button */}
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: '#25D366',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    boxShadow: '0 2px 6px rgba(37, 211, 102, 0.35)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                  }}
                  className="hover:scale-105"
                  title="WhatsApp-এ সরাসরি চ্যাট করুন"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.979-.276-.1-.477-.15-.678.15-.2.301-.778.979-.954 1.18-.176.2-.352.226-.653.075s-1.27-.468-2.42-1.493c-.894-.798-1.498-1.784-1.674-2.085-.176-.301-.019-.464.132-.614.136-.135.301-.352.452-.527.151-.176.2-.301.301-.502.101-.2.05-.377-.025-.527-.075-.15-.678-1.633-.929-2.235-.245-.586-.494-.506-.678-.515-.176-.008-.377-.01-.578-.01s-.527.075-.803.377c-.276.301-1.054 1.03-1.054 2.511 0 1.481 1.079 2.912 1.23 3.113.15.2 2.123 3.242 5.143 4.547.719.311 1.281.497 1.718.636.722.23 1.379.197 1.898.12.578-.087 1.782-.728 2.033-1.431.251-.703.251-1.305.176-1.431-.075-.126-.276-.201-.577-.351zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.178L2 22l4.957-1.399C8.423 21.499 10.153 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                  </svg>
                </a>
              </div>

              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                ২৪/৭ অনলাইন
              </span>
            </div>

            <div style={{ fontSize: '0.72rem', color: '#0f766e', background: '#e6fffa', padding: '3px 7px', borderRadius: '6px', border: '1px solid #99f6e4', display: 'inline-block', lineHeight: 1.3 }}>
              🚚 সারাদেশে ক্যাশ অন ডেলিভারি
            </div>
          </div>

        </div>

        {/* Bottom Copyright Strip */}
        <div style={{
          borderTop: '1px solid #dcfce7',
          paddingTop: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '0.78rem',
          color: '#64748b'
        }}>
          <div>
            © 2026 HealthBari (হেলথ বাড়ি) . All rights reserved.
          </div>
          <div style={{ color: '#0f766e', fontWeight: 600 }}>
            ১০০% নিরাপদ ও অরিজিনাল মেডিকেল ডিভাইস
          </div>
        </div>

      </div>
    </footer>
  );
}
