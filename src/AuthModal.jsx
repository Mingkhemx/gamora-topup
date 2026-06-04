import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

// Brand SVG icons (biar warna & bentuk 100% akurat seperti di referensi)
const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" width="28" height="28" aria-hidden="true">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
    <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
  </svg>
);

const LineIcon = () => (
  <svg viewBox="0 0 48 48" width="22" height="22" aria-hidden="true">
    <text x="24" y="32" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="18" fill="#fff" letterSpacing="0.5">LINE</text>
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    <path fill="#fff" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
    <path fill="#fff" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
    <path fill="#fff" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <path fill="#fff" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
    <path fill="#22c55e" d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
);

export default function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('main'); // 'main' | 'email-login' | 'email-register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset state on open
      setMode('main');
      setEmail('');
      setPassword('');
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSocial = async (provider) => {
    try {
      setError('');
      setLoading(true);
      // Biarkan Supabase handle redirect secara otomatis (PKCE flow)
      // Jangan pakai skipBrowserRedirect — itu akan memutus exchange code PKCE
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      // Supabase akan otomatis redirect ke Google, lalu kembali ke redirectTo
      // onAuthStateChange di App.jsx yang akan menangani session-nya
    } catch (err) {
      console.error('[Auth] Social login error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      if (mode === 'email-login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        setSuccessMsg('Registrasi berhasil! Silakan cek email Anda untuk verifikasi, atau langsung masuk.');
        setMode('email-login');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gamora-auth-overlay" onClick={onClose}>
      <div className="gamora-auth-modal" onClick={(e) => e.stopPropagation()}>
        {/* Decorative blob background */}
        <div className="gamora-auth-blob" aria-hidden="true" />

        {/* Close button */}
        <button
          className="gamora-auth-close"
          onClick={onClose}
          aria-label="Tutup"
          type="button"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path fill="currentColor" d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        {mode === 'main' ? (
          <>
            <h2 className="gamora-auth-title">Masuk / Mendaftar</h2>

            {/* Social row - satu card memuat semua provider */}
            <div className="gamora-auth-social-wrap">
              <div className="gamora-auth-social-row">
                <button
                  type="button"
                  className="gamora-auth-social google"
                  onClick={() => handleSocial('google')}
                  aria-label="Masuk dengan Google"
                  disabled={loading}
                >
                  <GoogleIcon />
                </button>
                <button
                  type="button"
                  className="gamora-auth-social line"
                  onClick={() => handleSocial('line')}
                  aria-label="Masuk dengan LINE"
                  disabled={loading}
                >
                  <LineIcon />
                </button>
                <button
                  type="button"
                  className="gamora-auth-social x"
                  onClick={() => handleSocial('twitter')}
                  aria-label="Masuk dengan X"
                  disabled={loading}
                >
                  <XIcon />
                </button>
                <button
                  type="button"
                  className="gamora-auth-social facebook"
                  onClick={() => handleSocial('facebook')}
                  aria-label="Masuk dengan Facebook"
                  disabled={loading}
                >
                  <FacebookIcon />
                </button>
                <button
                  type="button"
                  className="gamora-auth-social apple"
                  onClick={() => handleSocial('apple')}
                  aria-label="Masuk dengan Apple"
                  disabled={loading}
                >
                  <AppleIcon />
                </button>
                <button
                  type="button"
                  className="gamora-auth-social email"
                  onClick={() => setMode('email-login')}
                  aria-label="Lanjut dengan Email"
                >
                  <EmailIcon />
                </button>
              </div>
            </div>

            {/* Legal text */}
            <p className="gamora-auth-legal">
              Mendaftar atau masuk berarti Anda menyetujui<br />
              <a href="#" onClick={(e) => e.preventDefault()}>Kebijakan Privasi</a>
              {' | '}
              <a href="#" onClick={(e) => e.preventDefault()}>Syarat &amp; Ketentuan</a>
              {' | '}
              <a href="#" onClick={(e) => e.preventDefault()}>Kebijakan Cookie</a>
            </p>

            {/* Trust bar */}
            <div className="gamora-auth-trustbar">
              <div className="gamora-auth-trust-item">
                <span className="gamora-auth-trust-num">
                  <StarIcon /> 4.9
                </span>
                <span className="gamora-auth-trust-label">Trustpilot 30K+ Ulasan</span>
              </div>
              <div className="gamora-auth-trust-divider" />
              <div className="gamora-auth-trust-item">
                <span className="gamora-auth-trust-num">30%</span>
                <span className="gamora-auth-trust-label">Diskon hingga 30%</span>
              </div>
              <div className="gamora-auth-trust-divider" />
              <div className="gamora-auth-trust-item">
                <span className="gamora-auth-trust-num">10M+</span>
                <span className="gamora-auth-trust-label">Pilihan Gamer</span>
              </div>
            </div>
          </>
        ) : (
          <div className="gamora-auth-email-form">
            <button
              type="button"
              className="gamora-auth-back"
              onClick={() => { setMode('main'); setError(''); setSuccessMsg(''); }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
              Kembali
            </button>

            <h2 className="gamora-auth-title" style={{ fontSize: '1.4rem' }}>
              {mode === 'email-login' ? 'Masuk dengan Email' : 'Daftar Akun Baru'}
            </h2>

            {error && (
              <div className="gamora-auth-error">{error}</div>
            )}
            {successMsg && (
              <div className="gamora-auth-success">{successMsg}</div>
            )}

            <form onSubmit={handleEmailAuth}>
              <div className="gamora-auth-field">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="gamora-auth-field">
                <label>Kata Sandi</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                  autoComplete={mode === 'email-login' ? 'current-password' : 'new-password'}
                />
              </div>
              <button
                type="submit"
                className="gamora-auth-submit"
                disabled={loading}
              >
                {loading ? 'Memproses...' : (mode === 'email-login' ? 'Masuk' : 'Daftar Sekarang')}
              </button>
            </form>

            <p className="gamora-auth-switch">
              {mode === 'email-login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
              <span
                onClick={() => {
                  setMode(mode === 'email-login' ? 'email-register' : 'email-login');
                  setError('');
                }}
              >
                {mode === 'email-login' ? 'Daftar di sini' : 'Masuk di sini'}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
