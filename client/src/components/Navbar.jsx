import React, { useState } from 'react';
import {
  ShoppingBag, Search, PhoneCall, LogIn, Lock,
  Truck, Menu, X, Home, Package, BookOpen
} from 'lucide-react';

export default function Navbar({
  currentTab,
  setCurrentTab,
  cartCount,
  setIsCartOpen,
  searchQuery,
  setSearchQuery,
  setIsAdminOpen,
  settings
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const brandName = settings?.brandName || 'হেলথ বাড়ি';
  const brandLogo = settings?.brandLogo || '/images/healthbari_logo.png';
  const phone = settings?.phone || '01540-696573';

  const announcements = (settings?.announcements && Array.isArray(settings.announcements) && settings.announcements.length > 0)
    ? settings.announcements
    : [
      "🩺 সকল মেডিকেল ডিভাইসে ২ বছরের অফিশিয়াল ওয়ারেন্টি ও সারাদেশে ক্যাশ অন ডেলিভারি",
      "🎟️ বিশেষ ছাড়: 'HEALTH100' কুপন কোড ব্যবহার করে পান ১০০৳ নিশ্চিত ছাড়!",
      "🚚 কাশিমপুর (গাজীপুর) এরিয়াতে দ্রুততম হোম ডেলিভারি ও ফ্রি চেকআপ সুবিধা",
      "🎁 'HEALTH10' কোড ব্যবহারে পেয়ে যান যেকোনো অর্ডারে ১০% ইনস্ট্যান্ট ডিসকাউন্ট!",
      "📞 যেকোনো স্বাস্থ্য পরামর্শ ও ডিভাইসের ব্যবহারের নিয়ম জানতে কল করুন: 01540-696573"
    ];

  const speedDuration = settings?.announcementSpeed === 'slow' ? '38s' : settings?.announcementSpeed === 'fast' ? '16s' : '26s';
  const isEnabled = settings?.isAnnouncementEnabled !== undefined ? settings.isAnnouncementEnabled : true;

  const handleNavClick = (tab) => {
    setCurrentTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="navbar-wrapper" style={{ position: 'sticky', top: 0, zIndex: 50, background: '#ffffff' }}>
      {/* Top Notification Bar */}
      <div style={{ backgroundColor: '#0f766e', color: '#ffffff', fontSize: '0.825rem', padding: '0.35rem 1rem', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container flex items-center justify-between gap-3">

          {/* Badge (Hidden on mobile) */}
          <div className="hide-mobile flex items-center gap-2 flex-shrink-0">
            <span className="badge badge-teal" style={{ background: '#134e4a', color: '#5eead4', border: 'none', padding: '0.18rem 0.55rem', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.3px' }}>
              অফিশিয়াল হেলথ কেয়ার
            </span>
          </div>

          {/* Animated Moving Marquee Ticker (Takes Full Width on Mobile) */}
          {isEnabled ? (
            <div className="topbar-ticker-wrapper" style={{ '--ticker-duration': speedDuration, width: '100%' }}>
              <div className="topbar-ticker-track">
                {[...announcements, ...announcements].map((text, idx) => (
                  <span key={idx} className="ticker-item">
                    <span>{text}</span>
                    <span className="ticker-separator">✦</span>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.825rem' }}>
              {announcements[0]}
            </div>
          )}

          {/* Helpline Phone (Hidden on mobile) */}
          <div className="hide-mobile flex items-center gap-2 flex-shrink-0">
            <a
              href={`tel:${phone.replace(/[^0-9]/g, '')}`}
              className="flex items-center gap-1.5"
              style={{
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 700,
                background: 'rgba(255,255,255,0.12)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.78rem'
              }}
            >
              <PhoneCall size={13} color="#5eead4" />
              <span className="font-numeric">{phone}</span>
              <span style={{ color: '#ccfbf1', fontWeight: 500 }}>(ফ্রি পরামর্শ)</span>
            </a>
          </div>

        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="container" style={{ padding: '0.75rem 1.25rem' }}>
        <div className="flex items-center justify-between gap-4">

          {/* Left: Mobile Toggle & Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

            {/* Mobile Hamburger / Dropdown Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="show-mobile-flex btn btn-outline"
              style={{
                width: 38,
                height: 38,
                padding: 0,
                borderRadius: '10px',
                border: '1.5px solid #99f6e4',
                background: isMobileMenuOpen ? '#f0fdfa' : '#ffffff',
                color: '#0f766e',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              aria-label="মেনু ড্রপডাউন খুলুন"
              title="মেনু ড্রপডাউন খুলুন"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Brand Logo */}
            <div
              onClick={() => handleNavClick('home')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
            >
              <div style={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                backgroundColor: '#f0fdfa',
                border: '1.5px solid #99f6e4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <img src={brandLogo} alt={`${brandName} Logo`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.src = '/images/healthbari_logo.png'; }} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f766e', lineHeight: 1.1, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {brandName}
                </div>
              </div>
            </div>

          </div>

          {/* Desktop Navigation Links */}
          <nav className="hide-mobile flex items-center gap-1">
            <button
              onClick={() => setCurrentTab('home')}
              className={`nav-link ${currentTab === 'home' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95rem' }}
            >
              হোম
            </button>
            <button
              onClick={() => setCurrentTab('products')}
              className={`nav-link ${currentTab === 'products' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95rem' }}
            >
              সকল হেলথ গ্যাজেট
            </button>
            <button
              onClick={() => setCurrentTab('track-parcel')}
              className={`nav-link ${currentTab === 'track-parcel' ? 'active' : ''}`}
              style={{
                background: currentTab === 'track-parcel' ? '#f0fdfa' : 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: currentTab === 'track-parcel' ? '#0d9488' : '#334155',
                fontWeight: currentTab === 'track-parcel' ? 800 : 600
              }}
            >
              <Truck size={16} color="#0d9488" />
              <span>ট্র্যাক পার্সেল</span>
            </button>
            <button
              onClick={() => setCurrentTab('health-tips')}
              className={`nav-link ${currentTab === 'health-tips' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95rem' }}
            >
              স্বাস্থ্য টিপস ও গাইড
            </button>
          </nav>

          {/* Desktop Search Bar */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '260px' }} className="hide-mobile">
            <Search size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="সার্চ করুন (বিপি মেশিন...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '36px', paddingRight: '12px', height: '40px', fontSize: '0.875rem', borderRadius: '50px', background: '#f8fafc' }}
            />
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">

            {/* Admin Switcher / Login button */}
            <button
              onClick={() => {
                setIsAdminOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="btn btn-outline"
              title="এডমিন লগইন"
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.825rem', borderRadius: '50px', color: '#0f766e', borderColor: '#99f6e4', background: '#f0fdfa' }}
            >
              <LogIn size={15} />
              <span className="hide-mobile">এডমিন লগইন</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              style={{
                position: 'relative',
                background: '#047857',
                color: '#ffffff',
                border: 'none',
                width: 42,
                height: 42,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(4, 120, 87, 0.35)',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              aria-label="শপিং কার্ট"
            >
              <ShoppingBag size={19} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#ea580c',
                  color: '#ffffff',
                  fontSize: '0.725rem',
                  fontWeight: 800,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff'
                }}>
                  {cartCount}
                </span>
              )}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Search Bar Row (Always visible directly below navbar on mobile) */}
      <div className="show-mobile-only" style={{ padding: '0 1.25rem 0.75rem 1.25rem' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#0d9488' }} />
          <input
            type="text"
            placeholder="পণ্য বা স্বাস্থ্য ডিভাইস খুঁজুন (বিপি মেশিন...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{
              paddingLeft: '38px',
              paddingRight: '14px',
              height: '42px',
              fontSize: '0.875rem',
              borderRadius: '50px',
              border: '1.5px solid #99f6e4',
              background: '#f8fafc',
              width: '100%',
              boxSizing: 'border-box',
              boxShadow: '0 2px 6px rgba(13, 148, 136, 0.06)'
            }}
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 📱 MOBILE VIEW DROPDOWN MENU (Clean Vertical Stack) */}
      {/* ======================================================== */}
      {isMobileMenuOpen && (
        <div
          className="show-mobile-only"
          style={{
            background: '#ffffff',
            borderTop: '1px solid #ccfbf1',
            borderBottom: '2px solid #0d9488',
            boxShadow: '0 15px 30px rgba(15, 23, 42, 0.15)',
            padding: '1rem',
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          {/* 1. Home */}
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: 'none',
              background: currentTab === 'home' ? '#f0fdfa' : 'transparent',
              color: currentTab === 'home' ? '#0f766e' : '#1e293b',
              fontWeight: currentTab === 'home' ? 800 : 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Home size={18} color={currentTab === 'home' ? '#0d9488' : '#64748b'} />
              <span>হোম (Home)</span>
            </div>
            {currentTab === 'home' && <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>বর্তমান</span>}
          </button>

          {/* 2. All Health Gadgets */}
          <button
            type="button"
            onClick={() => handleNavClick('products')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: 'none',
              background: currentTab === 'products' ? '#f0fdfa' : 'transparent',
              color: currentTab === 'products' ? '#0f766e' : '#1e293b',
              fontWeight: currentTab === 'products' ? 800 : 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package size={18} color={currentTab === 'products' ? '#0d9488' : '#64748b'} />
              <span>সকল হেলথ গ্যাজেট</span>
            </div>
            {currentTab === 'products' && <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>বর্তমান</span>}
          </button>

          {/* 3. Track Parcel */}
          <button
            type="button"
            onClick={() => handleNavClick('track-parcel')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              background: currentTab === 'track-parcel' ? '#ecfdf5' : '#f8fafc',
              color: currentTab === 'track-parcel' ? '#047857' : '#0f766e',
              fontWeight: currentTab === 'track-parcel' ? 800 : 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              textAlign: 'left',
              border: '1.5px solid #99f6e4'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Truck size={18} color="#0d9488" />
              <span>ট্র্যাক পার্সেল (Live Tracking)</span>
            </div>
          </button>

          {/* 4. Health Tips & Guide */}
          <button
            type="button"
            onClick={() => handleNavClick('health-tips')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: 'none',
              background: currentTab === 'health-tips' ? '#f0fdfa' : 'transparent',
              color: currentTab === 'health-tips' ? '#0f766e' : '#1e293b',
              fontWeight: currentTab === 'health-tips' ? 800 : 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BookOpen size={18} color={currentTab === 'health-tips' ? '#0d9488' : '#64748b'} />
              <span>স্বাস্থ্য টিপস ও গাইড</span>
            </div>
            {currentTab === 'health-tips' && <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>বর্তমান</span>}
          </button>

          {/* 5. Admin Panel */}
          <button
            type="button"
            onClick={() => {
              setIsAdminOpen(true);
              setIsMobileMenuOpen(false);
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: 'none',
              background: 'transparent',
              color: '#475569',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <LogIn size={18} color="#0d9488" />
              <span>এডমিন লগইন</span>
            </div>
          </button>

        </div>
      )}
    </header>
  );
}
