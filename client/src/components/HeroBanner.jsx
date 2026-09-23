import React from 'react';
import { ShieldCheck, Truck, Clock, Award, ArrowRight, HeartPulse, Sparkles } from 'lucide-react';

export default function HeroBanner({ onExploreProducts, onOpenTips, settings }) {
  const heroBannerImage = settings?.heroBanner || '/images/healthbari_hero.png';
  const brandName = settings?.brandName || 'হেলথ বাড়ি';
  const heroBadgeTag = settings?.heroBadgeTag || '১০০% অরিজিনাল হেলথ, হারবাল ও মেডিকেল পণ্য';
  const heroTitle = settings?.heroTitle !== undefined ? settings.heroTitle : 'ঘরে বসেই রাখুন পরিবারের';
  const heroTitleHighlight = settings?.heroTitleHighlight !== undefined ? settings.heroTitleHighlight : 'স্বাস্থ্যের নিখুঁত যত্ন';
  const heroSubtitle = settings?.heroSubtitle || `সুস্বাস্থ্য রক্ষায় সঠিক যত্নই একমাত্র সুরক্ষা। ${brandName}-এর ১০০% অরিজিনাল হেলথ, হারবাল ও মেডিকেল পণ্য দিয়ে খুব সহজেই নিজের ও পরিবারের হেলথ ট্র্যাক করুন।`;

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {/* Grand Hero Section */}
      <div 
        className="hero-banner-card"
        style={{
          background: 'linear-gradient(135deg, #042f2e 0%, #0f766e 50%, #115e59 100%)',
          borderRadius: '24px',
          overflow: 'hidden',
          color: '#ffffff',
          position: 'relative',
          boxShadow: '0 20px 40px -15px rgba(15, 118, 110, 0.45)'
        }}
      >
        <div className="grid md:grid-cols-2 items-center gap-6">
          
          {/* Left Column: Headline & Value Proposition */}
          <div>
            {heroBadgeTag && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                padding: '0.3rem 0.8rem',
                borderRadius: '50px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#5eead4',
                marginBottom: '0.65rem',
                border: '1px solid rgba(94, 234, 212, 0.3)'
              }}>
                <Sparkles size={15} />
                <span>{heroBadgeTag}</span>
              </div>
            )}

            <h1 style={{ 
              fontSize: 'clamp(1.75rem, 3.5vw, 2.6rem)', 
              fontWeight: 800, 
              lineHeight: 1.2, 
              marginBottom: '0.75rem',
              color: '#ffffff',
              letterSpacing: '-0.02em'
            }}>
              {heroTitle && <>{heroTitle} <br /></>}
              {heroTitleHighlight && (
                <span style={{ color: '#5eead4', textDecoration: 'underline decoration-wavy decoration-amber-400' }}>
                  {heroTitleHighlight}
                </span>
              )}
            </h1>

            <p style={{ fontSize: '0.98rem', color: '#ccfbf1', lineHeight: 1.55, marginBottom: '1.25rem', maxWidth: '520px' }}>
              {heroSubtitle}
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: '1.25rem' }}>
              <button 
                onClick={onExploreProducts}
                className="btn btn-large"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.45)',
                  border: 'none'
                }}
              >
                <span>পণ্যগুলো দেখুন ও অর্ডার করুন</span>
                <ArrowRight size={18} />
              </button>

              <button 
                onClick={onOpenTips}
                className="btn btn-large"
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(6px)'
                }}
              >
                <HeartPulse size={18} style={{ color: '#5eead4' }} />
                <span>স্বাস্থ্য নির্দেশিকা পড়ুন</span>
              </button>
            </div>

            {/* Mini Trust Stats */}
            <div className="flex items-center gap-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }} className="font-numeric">18,500+</div>
                <div style={{ fontSize: '0.75rem', color: '#99f6e4' }}>সুস্থ ও সন্তুষ্ট পরিবার</div>
              </div>
              <div style={{ width: '1px', height: '30px', background: 'rgba(255, 255, 255, 0.2)' }} />
              <div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }} className="font-numeric">2 Years</div>
                <div style={{ fontSize: '0.75rem', color: '#99f6e4' }}>অফিশিয়াল রিপ্লেসমেন্ট ওয়ারেন্টি</div>
              </div>
              <div style={{ width: '1px', height: '30px', background: 'rgba(255, 255, 255, 0.2)' }} />
              <div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>১০০% COD</div>
                <div style={{ fontSize: '0.75rem', color: '#99f6e4' }}>পণ্য দেখে টাকা পরিশোধ</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Graphic */}
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <div style={{
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
              border: '3px solid rgba(255, 255, 255, 0.25)',
              background: '#042f2e'
            }}>
              <img 
                src={heroBannerImage} 
                alt={`${brandName} Family Medical Devices`} 
                style={{ width: '100%', height: 'auto', display: 'block', transform: 'scale(1.02)', transition: 'transform 0.5s ease' }} 
                onError={(e) => { e.target.src = '/images/healthbari_hero_banner.png'; }}
              />
            </div>

            {/* Floating Trust Bubble */}
            <div style={{
              position: 'absolute',
              bottom: '-12px',
              right: '20px',
              background: '#ffffff',
              color: '#0f172a',
              padding: '0.65rem 1rem',
              borderRadius: '14px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              textAlign: 'left'
            }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>১০০% জেনুইন ডিভাইস</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>সরাসরি ইমপোর্টেড ও টেস্টেড</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4 Feature Badges Bar (4-Grid Desktop, 2-Grid Mobile) */}
      <div className="feature-badges-grid">
        <div className="card" style={{ padding: '0.85rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.65rem', background: '#ffffff' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d9488', flexShrink: 0 }}>
            <Award size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.25 }}>২ বছরের ওয়ারেন্টি</h4>
            <p className="hide-mobile" style={{ fontSize: '0.72rem', color: '#64748b', margin: '2px 0 0 0' }}>সমস্যা হলে সরাসরি রিপ্লেসমেন্ট</p>
          </div>
        </div>

        <div className="card" style={{ padding: '0.85rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.65rem', background: '#ffffff' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', flexShrink: 0 }}>
            <Truck size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.25 }}>সারাদেশে হোম ডেলিভারি</h4>
            <p className="hide-mobile" style={{ fontSize: '0.72rem', color: '#64748b', margin: '2px 0 0 0' }}>৪৮ থেকে ৭২ ঘণ্টায় কুরিয়ারে</p>
          </div>
        </div>

        <div className="card" style={{ padding: '0.85rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.65rem', background: '#ffffff' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', flexShrink: 0 }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.25 }}>ক্যাশ অন ডেলিভারি</h4>
            <p className="hide-mobile" style={{ fontSize: '0.72rem', color: '#64748b', margin: '2px 0 0 0' }}>পণ্য হাতে পেয়ে টাকা দিন</p>
          </div>
        </div>

        <div className="card" style={{ padding: '0.85rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.65rem', background: '#ffffff' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', flexShrink: 0 }}>
            <Clock size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.25 }}>২৪/৭ কাস্টমার সাপোর্ট</h4>
            <p className="hide-mobile" style={{ fontSize: '0.72rem', color: '#64748b', margin: '2px 0 0 0' }}>যেকোনো সহায়তায় কল করুন</p>
          </div>
        </div>
      </div>
    </div>
  );
}
