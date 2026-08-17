import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../lib/toast';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import PharmacyEmblem from '../../components/PharmacySymbol';

export default function AdminLogin() {
  const { login, loading, authed } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (authed) navigate('/admin/dashboard');
  }, [authed, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      padding: 24,
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(232,0,45,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-5%',
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
      </div>

      <div style={{ width: '100%', maxWidth: 400, position: 'relative' }}>
        {/* Card */}
        <div style={{
          background: '#141414',
          border: '1px solid #222',
          borderRadius: 20,
          padding: '40px 36px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              width: 72, height: 72,
              margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              filter: 'drop-shadow(0 8px 24px rgba(27,88,166,0.35))',
            }}>
              <PharmacyEmblem className="w-full h-full" />
            </div>
            <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
              صيدلية الرحمة
            </div>
            <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>لوحة تحكم الإدارة</div>
          </div>

          <h1 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>
            Sign in to continue
          </h1>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Email */}
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#555', pointerEvents: 'none' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@tammi.com"
                required
                style={{
                  width: '100%', padding: '12px 14px 12px 38px',
                  background: '#0d0d0d', border: '1px solid #262626',
                  borderRadius: 10, color: '#fff', fontSize: 14,
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                  fontFamily: "'Inter', sans-serif",
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#e8002d'}
                onBlur={e => e.currentTarget.style.borderColor = '#262626'}
              />
            </div>

            {/* Password */}
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#555', pointerEvents: 'none' }} />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
                style={{
                  width: '100%', padding: '12px 40px 12px 38px',
                  background: '#0d0d0d', border: '1px solid #262626',
                  borderRadius: 10, color: '#fff', fontSize: 14,
                  outline: 'none', boxSizing: 'border-box',
                  fontFamily: "'Inter', sans-serif",
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#e8002d'}
                onBlur={e => e.currentTarget.style.borderColor = '#262626'}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 0,
                }}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? '#444' : '#e8002d',
                color: '#fff', border: 'none', borderRadius: 10,
                fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: 0.5, marginTop: 4,
                boxShadow: loading ? 'none' : '0 4px 16px rgba(232,0,45,0.35)',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Signing in…</> : 'Sign In'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#444' }}>
          Tammi Sports Admin Panel — Authorized Access Only
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
