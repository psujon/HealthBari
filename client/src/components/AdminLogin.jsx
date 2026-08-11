import React, { useState } from 'react';
import { Lock, Mail, ArrowLeft, ShieldCheck, HeartPulse, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';

export default function AdminLogin({ onLoginSuccess, onBackToStore }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('অনুগ্রহ করে ইমেইল ও পাসওয়ার্ড উভয়টি পূরণ করুন।');
      return;
    }

    setError('');
    setLoading(true);

    const result = await api.loginAdmin(email, password);
    setLoading(false);

    if (result && result.success) {
      onLoginSuccess();
    } else {
      setError(result?.message || 'ভুল ইমেইল বা পাসওয়ার্ড! অনুগ্রহ করে সঠিক তথ্য দিন।');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0f172a',
      padding: '1.5rem',
      position: 'relative'
    }}>

      {/* Background glow circle */}
      <div style={{
        position: 'absolute',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(13, 148, 136, 0.25) 0%, rgba(15, 23, 42, 0) 70%)',
        top: '10%',
        left: '15%',
        pointerEvents: 'none'
      }}></div>

      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        zIndex: 10
      }}>

        {/* Top Brand Logo & Icon */}
        <div
          onClick={onBackToStore}
          title="হোম পেজে ফিরে যান"
          style={{ textAlign: 'center', marginBottom: '1.75rem', cursor: 'pointer' }}
        >
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '14px',
            backgroundColor: '#f0fdfa',
            border: '2px solid #99f6e4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0d9488',
            margin: '0 auto 0.75rem auto',
            transition: 'transform 0.15s ease'
          }}>
            <HeartPulse size={30} />
          </div>

          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            হেলথ বাড়ি এডমিন
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            ← হোম পেজে ফিরে যেতে এখানে ক্লিক করুন
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #f87171',
            color: '#991b1b',
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            fontWeight: 600
          }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>

          {/* Email Input */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>এডমিন ইমেইল / ইউজারনেম *</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px', height: '44px', fontSize: '0.9rem' }}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>গোপন পাসওয়ার্ড *</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px', paddingRight: '40px', height: '44px', fontSize: '0.9rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Login CTA */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-buy-now btn-large btn-full"
            style={{ fontSize: '1rem', padding: '0.85rem' }}
          >
            <ShieldCheck size={18} />
            <span>{loading ? 'যাচাই করা হচ্ছে...' : 'লগইন করে ড্যাশবোর্ডে প্রবেশ করুন'}</span>
          </button>

        </form>

        {/* Back to Store */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
          <button
            type="button"
            onClick={onBackToStore}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ArrowLeft size={14} />
            <span>মূল ওয়েবসাইটে ফিরে যান</span>
          </button>
        </div>

      </div>
    </div>
  );
}
