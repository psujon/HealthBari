import React from 'react';
import { HeartPulse, BookOpen, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { healthArticles as fallbackArticles } from '../data/healthArticles';

export default function HealthTipsSection({ articles = [], products = [], onSelectProduct }) {
  const displayArticles = (articles && articles.length > 0) ? articles : fallbackArticles;

  return (
    <section style={{ margin: '3.5rem 0' }}>
      <div className="container">
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="badge badge-teal" style={{ marginBottom: '0.5rem' }}>
            <HeartPulse size={15} />
            <span>হেলথ গাইড ও ডাক্তারের পরামর্শ</span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            স্বাস্থ্য সম্পর্কিত তথ্য ও সচেতনতা
          </h2>
          <p style={{ color: '#64748b', maxWidth: '620px', margin: '0 auto', fontSize: '0.95rem' }}>
            সঠিক স্বাস্থ্য তথ্যের মাধ্যমে পরিবারকে রাখুন যেকোনো মেডিকেল ইমার্জেন্সি থেকে নিরাপদ।
          </p>
        </div>

        {/* Dynamic Articles Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {displayArticles.map((art) => {
            const recommendedProduct = products.find(p => p.id === art.recommendedProductId);
            const contentPoints = Array.isArray(art.content) ? art.content : [];
            const displayPoints = contentPoints.slice(0, 4);
            
            return (
               <div 
                key={art.id} 
                className="card flex flex-col justify-between"
                style={{ padding: '1.5rem', background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px' }}
              >
                <div>
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f766e', background: '#f0fdfa', padding: '3px 10px', borderRadius: '6px' }}>
                      {art.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{art.readTime || '৪ মিনিট পড়া'}</span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                    {art.title}
                  </h3>

                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, marginBottom: '1rem' }}>
                    {art.summary}
                  </p>

                  {displayPoints.length > 0 && (
                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: '3px solid #0d9488' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f766e', marginBottom: '4px' }}>
                        জরুরি পরামর্শ:
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.78rem', color: '#334155' }}>
                        {displayPoints.map((pt, idx) => (
                          <li key={idx} style={{ marginBottom: '3px' }}>✔ {pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Linked Health Device CTA */}
                {recommendedProduct && (
                  <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
                      প্রস্তাবিত মেডিকেল ডিভাইস:
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                        {recommendedProduct.title}
                      </span>
                      <button 
                        onClick={() => onSelectProduct && onSelectProduct(recommendedProduct)}
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderColor: '#0d9488', color: '#0d9488', whiteSpace: 'nowrap' }}
                      >
                        ডিভাইস দেখুন
                      </button>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
