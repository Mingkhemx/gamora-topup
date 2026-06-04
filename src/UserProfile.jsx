import React, { useState } from 'react';
import {
  User, History, Lock, HelpCircle, LogOut,
  Camera, Wallet, CreditCard, ShieldCheck, MessagesSquare,
  Link2, CheckCircle2, Plus, Unlink, Star, Zap, Trophy,
  TrendingUp, Clock, ChevronRight, Bell, Settings
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { toast, confirm } from './AlertSystem.jsx';
import './UserProfile.css';


/* ─── Provider Icons ─────────────────────────────────────── */
const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" width="22" height="22">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
    <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
  </svg>
);
const LineIcon = () => (
  <svg viewBox="0 0 40 40" width="22" height="22">
    <rect width="40" height="40" rx="10" fill="#06C755"/>
    <text x="20" y="27" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="900" fontSize="13" fill="#fff">LINE</text>
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22">
    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const AppleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

const providers = [
  { id: 'google',   name: 'Google',      bg: '#f1f3f4', iconBg: '#fff',     Icon: GoogleIcon },
  { id: 'line',     name: 'LINE',        bg: '#e8faf0', iconBg: '#06C755',  Icon: LineIcon, iconColor: '#fff' },
  { id: 'twitter',  name: 'X (Twitter)', bg: '#f1f3f4', iconBg: '#000',     Icon: XIcon, iconColor: '#fff' },
  { id: 'facebook', name: 'Facebook',    bg: '#e8f0fe', iconBg: '#fff',     Icon: FacebookIcon },
  { id: 'apple',    name: 'Apple',       bg: '#f1f3f4', iconBg: '#000',     Icon: AppleIcon, iconColor: '#fff' },
];

const navItems = [
  { id: 'account',      label: 'Profil Akun',        Icon: User },
  { id: 'transactions', label: 'Riwayat Transaksi',  Icon: History },
  { id: 'accounts',     label: 'Pusat Akun',         Icon: Link2 },
  { id: 'security',     label: 'Keamanan',           Icon: Lock },
  { id: 'help',         label: 'Pusat Bantuan',      Icon: HelpCircle },
];

/* ─── Component ──────────────────────────────────────────── */
export default function UserProfile({ user, profile, onProfileUpdate, onExit }) {
  const [activeTab, setActiveTab] = useState('account');
  const [linkingProvider, setLinkingProvider] = useState(null);
  const [linkError, setLinkError] = useState('');
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [userTransactions, setUserTransactions] = useState([]);
  const [userGachaHistory, setUserGachaHistory] = useState([]);
  const [loadingTrx, setLoadingTrx] = useState(false);

  const linkedProviders = (user?.identities || []).map(i => i.provider);

  // Selalu pakai data dari tabel profiles (konsisten lintas platform)
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Pengguna';
  const displayEmail = profile?.email || user?.email || '';
  const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff&size=128`;

  // Init edit fields dari profile
  React.useEffect(() => {
    setEditName(profile?.full_name || '');
    setEditPhone(profile?.phone || '');
  }, [profile]);

  // Fetch transaksi dan gacha history user
  React.useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoadingTrx(true);
      const [trxRes, gachaRes] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('gacha_history').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      ]);
      if (trxRes.data) setUserTransactions(trxRes.data);
      if (gachaRes.data) setUserGachaHistory(gachaRes.data);
      setLoadingTrx(false);
    };
    fetchData();
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ full_name: editName, phone: editPhone, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      if (onProfileUpdate) onProfileUpdate(data);
      toast.success('Profil berhasil disimpan!');
    } catch (err) {
      toast.error('Gagal menyimpan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLinkProvider = async (providerId) => {
    setLinkError('');
    setLinkingProvider(providerId);
    try {
      const { error } = await supabase.auth.linkIdentity({ provider: providerId, options: { redirectTo: window.location.origin + '/?page=profile' } });
      if (error) throw error;
    } catch (err) {
      setLinkError(err.message);
      toast.error(err.message);
      setLinkingProvider(null);
    }
  };

  const handleUnlinkProvider = async (identity) => {
    setLinkError('');
    const ok = await confirm('Yakin ingin melepas koneksi platform ini?', 'Lepas Platform');
    if (!ok) return;
    try {
      const { error } = await supabase.auth.unlinkIdentity(identity);
      if (error) throw error;
      toast.success('Platform berhasil dilepas.');
      window.location.reload();
    } catch (err) {
      setLinkError(err.message);
      toast.error(err.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onExit();
  };

  return (
    <div className="up-root">
      <div className="up-container">

        {/* ══ SIDEBAR ══════════════════════════════════════════ */}
        <aside className="up-sidebar">

          {/* Avatar card */}
          <div className="up-avatar-card">
            <div className="up-avatar-banner" />
            <div className="up-avatar-body">
              <div className="up-avatar-wrap">
                <img src={avatarUrl} alt="avatar" className="up-avatar-img" />
                <button className="up-avatar-cam" aria-label="Ganti foto">
                  <Camera size={13} />
                </button>
                <span className="up-avatar-dot" />
              </div>
              <h3 className="up-avatar-name">{displayName}</h3>
              <p className="up-avatar-email">{displayEmail}</p>
              <div className="up-avatar-badge">
                <Star size={11} fill="currentColor" /> VIP Member
              </div>
            </div>

            {/* Mini stats */}
            <div className="up-mini-stats">
              <div className="up-mini-stat">
                <span className="up-mini-val">24</span>
                <span className="up-mini-lbl">Transaksi</span>
              </div>
              <div className="up-mini-divider" />
              <div className="up-mini-stat">
                <span className="up-mini-val">Rp 1,4jt</span>
                <span className="up-mini-lbl">Total Belanja</span>
              </div>
              <div className="up-mini-divider" />
              <div className="up-mini-stat">
                <span className="up-mini-val">100%</span>
                <span className="up-mini-lbl">Sukses</span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="up-nav">
            {navItems.map(({ id, label, Icon }) => (
              <button
                key={id}
                className={`up-nav-btn ${activeTab === id ? 'active' : ''}`}
                onClick={() => setActiveTab(id)}
              >
                <span className="up-nav-icon"><Icon size={17} /></span>
                <span className="up-nav-label">{label}</span>
                <ChevronRight size={14} className="up-nav-arrow" />
              </button>
            ))}
            <div className="up-nav-separator" />
            <button className="up-nav-btn logout" onClick={handleLogout}>
              <span className="up-nav-icon"><LogOut size={17} /></span>
              <span className="up-nav-label">Keluar</span>
            </button>
          </nav>
        </aside>

        {/* ══ MAIN ═════════════════════════════════════════════ */}
        <main className="up-main">

          {/* ── TAB: PROFIL AKUN ────────────────────────────── */}
          {activeTab === 'account' && (
            <div className="up-panel up-fade">
              <div className="up-panel-header">
                <div>
                  <h2 className="up-panel-title">Informasi Akun</h2>
                  <p className="up-panel-sub">Kelola informasi data diri dan kontak Anda.</p>
                </div>
                <button className="up-edit-btn"><Settings size={15} /> Edit</button>
              </div>

              {/* Profile summary banner */}
              <div className="up-profile-banner-card">
                <div className="up-pb-left">
                  <img src={avatarUrl} alt="avatar" className="up-pb-avatar" />
                  <div>
                    <h3 className="up-pb-name">{displayName}</h3>
                    <p className="up-pb-email">{displayEmail}</p>
                    <div className="up-pb-badges">
                      <span className="up-badge gold"><Trophy size={11} /> VIP Member</span>
                      <span className="up-badge green"><ShieldCheck size={11} /> Verified</span>
                    </div>
                  </div>
                </div>
                <div className="up-pb-right">
                  <div className="up-pb-stat">
                    <Zap size={16} className="up-pb-stat-icon" />
                    <div>
                      <div className="up-pb-stat-val">Level 12</div>
                      <div className="up-pb-stat-lbl">Gamer Level</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form grid */}
              <div className="up-form-grid">
                <div className="up-field">
                  <label className="up-field-label">👤 Nama Pengguna</label>
                  <input type="text" className="up-field-input" value={displayEmail.split('@')[0]} disabled />
                </div>
                <div className="up-field">
                  <label className="up-field-label">✏️ Nama Lengkap</label>
                  <input
                    type="text"
                    className="up-field-input"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Nama lengkap"
                  />
                </div>
                <div className="up-field">
                  <label className="up-field-label">📧 Alamat Email</label>
                  <input type="email" className="up-field-input" value={displayEmail} disabled />
                </div>
                <div className="up-field">
                  <label className="up-field-label">📱 Nomor Telepon</label>
                  <input
                    type="tel"
                    className="up-field-input"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    placeholder="Belum diisi"
                  />
                </div>
              </div>
              <div className="up-form-footer">
                <button className="up-btn-primary" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          )}

          {/* ── TAB: TRANSAKSI ──────────────────────────────── */}
          {activeTab === 'transactions' && (
            <div className="up-panel up-fade">
              <div className="up-panel-header">
                <div>
                  <h2 className="up-panel-title">Riwayat Transaksi</h2>
                  <p className="up-panel-sub">Semua riwayat pembelian dan top-up Anda.</p>
                </div>
              </div>

              {/* Stat cards */}
              <div className="up-stat-cards">
                <div className="up-stat-card purple">
                  <div className="up-stat-card-icon"><Wallet size={22} /></div>
                  <div>
                    <div className="up-stat-card-val">
                      Rp {userTransactions.reduce((s,t) => s + Number(t.price||0), 0).toLocaleString('id-ID')}
                    </div>
                    <div className="up-stat-card-lbl">Total Pengeluaran</div>
                  </div>
                </div>
                <div className="up-stat-card blue">
                  <div className="up-stat-card-icon"><CreditCard size={22} /></div>
                  <div>
                    <div className="up-stat-card-val">{userTransactions.length} Order</div>
                    <div className="up-stat-card-lbl">Total Transaksi</div>
                  </div>
                </div>
                <div className="up-stat-card green">
                  <div className="up-stat-card-icon"><TrendingUp size={22} /></div>
                  <div>
                    <div className="up-stat-card-val">
                      {userTransactions.length === 0 ? '0%' :
                        Math.round(userTransactions.filter(t=>t.status==='success').length/userTransactions.length*100)+'%'}
                    </div>
                    <div className="up-stat-card-lbl">Tingkat Sukses</div>
                  </div>
                </div>
              </div>

              <h3 className="up-section-title"><Clock size={16} /> Transaksi Terbaru</h3>
              {loadingTrx ? (
                <div style={{textAlign:'center',padding:'32px',color:'#94a3b8'}}>Memuat...</div>
              ) : userTransactions.length === 0 ? (
                <div style={{textAlign:'center',padding:'40px'}}>
                  <div style={{fontSize:'3rem',marginBottom:'12px'}}>📭</div>
                  <p style={{color:'#64748b',fontWeight:600}}>Belum ada transaksi.</p>
                </div>
              ) : (
                <div className="up-trx-list">
                  {userTransactions.map(trx => (
                    <div key={trx.id} className="up-trx-row">
                      <div className="up-trx-thumb">
                        <img src={trx.image_url || '/mlbb.png'} alt={trx.game} />
                      </div>
                      <div className="up-trx-info">
                        <div className="up-trx-game">{trx.game}</div>
                        <div className="up-trx-item">{trx.item_name}</div>
                        <div className="up-trx-meta">
                          {trx.id.slice(0,8).toUpperCase()} · {new Date(trx.created_at).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                      <div className="up-trx-right">
                        <div className="up-trx-price">Rp {Number(trx.price).toLocaleString('id-ID')}</div>
                        <span className={`up-trx-badge ${trx.status}`}>
                          {trx.status === 'success' ? 'Sukses' : trx.status === 'pending' ? 'Proses' : 'Gagal'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: PUSAT AKUN ─────────────────────────────── */}
          {activeTab === 'accounts' && (
            <div className="up-panel up-fade">
              <div className="up-panel-header">
                <div>
                  <h2 className="up-panel-title">Pusat Akun</h2>
                  <p className="up-panel-sub">Hubungkan akun Anda untuk login lebih mudah.</p>
                </div>
              </div>

              {linkError && <div className="up-error-box">{linkError}</div>}

              {/* Terhubung */}
              {providers.filter(p => linkedProviders.includes(p.id)).length > 0 && (
                <div className="up-provider-group">
                  <div className="up-provider-group-title">
                    <CheckCircle2 size={14} color="#22c55e" /> Platform Terhubung
                  </div>
                  {providers.filter(p => linkedProviders.includes(p.id)).map(p => (
                    <div key={p.id} className="up-provider-row connected">
                      <div className="up-provider-icon" style={{ background: p.iconBg, color: p.iconColor || 'inherit' }}>
                        <p.Icon />
                      </div>
                      <div className="up-provider-info">
                        <div className="up-provider-name">{p.name}</div>
                        <div className="up-provider-status connected"><CheckCircle2 size={12} /> Terhubung</div>
                      </div>
                      <button className="up-provider-btn unlink" onClick={() => {
                        const identity = user?.identities?.find(i => i.provider === p.id);
                        if (identity) handleUnlinkProvider(identity);
                      }}>
                        <Unlink size={13} /> Lepas
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Belum terhubung */}
              {providers.filter(p => !linkedProviders.includes(p.id)).length > 0 && (
                <div className="up-provider-group">
                  <div className="up-provider-group-title">
                    <Plus size={14} color="#6366f1" /> Tambah Platform
                  </div>
                  {providers.filter(p => !linkedProviders.includes(p.id)).map(p => (
                    <div key={p.id} className="up-provider-row">
                      <div className="up-provider-icon" style={{ background: p.iconBg, color: p.iconColor || 'inherit' }}>
                        <p.Icon />
                      </div>
                      <div className="up-provider-info">
                        <div className="up-provider-name">{p.name}</div>
                        <div className="up-provider-status">Belum terhubung</div>
                      </div>
                      <button
                        className="up-provider-btn link"
                        disabled={linkingProvider === p.id}
                        onClick={() => handleLinkProvider(p.id)}
                      >
                        {linkingProvider === p.id ? <span className="up-spinner" /> : <><Plus size={13} /> Hubungkan</>}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="up-provider-note">
                <ShieldCheck size={14} />
                Menghubungkan platform tidak mengubah data profil Anda. Anda bisa melepas koneksi kapan saja.
              </div>
            </div>
          )}

          {/* ── TAB: KEAMANAN ───────────────────────────────── */}
          {activeTab === 'security' && (
            <div className="up-panel up-fade">
              <div className="up-panel-header">
                <div>
                  <h2 className="up-panel-title">Keamanan Akun</h2>
                  <p className="up-panel-sub">Kelola kata sandi dan keamanan akun Anda.</p>
                </div>
              </div>
              <div className="up-security-card">
                <div className="up-security-icon"><Lock size={24} /></div>
                <div>
                  <div className="up-security-title">Ubah Kata Sandi</div>
                  <div className="up-security-desc">Perbarui kata sandi Anda secara berkala untuk keamanan akun.</div>
                </div>
              </div>
              <div className="up-form-grid" style={{ maxWidth: 520 }}>
                {[
                  { label: 'Kata Sandi Saat Ini', ph: 'Masukkan kata sandi lama', auto: 'current-password' },
                  { label: 'Kata Sandi Baru', ph: 'Minimal 8 karakter', auto: 'new-password' },
                  { label: 'Konfirmasi Kata Sandi', ph: 'Ulangi kata sandi baru', auto: 'new-password' },
                ].map(({ label, ph, auto }) => (
                  <div key={label} className="up-field" style={{ gridColumn: '1 / -1' }}>
                    <label className="up-field-label">{label}</label>
                    <input type="password" className="up-field-input" placeholder={ph} autoComplete={auto} />
                  </div>
                ))}
              </div>
              <div className="up-form-footer" style={{ justifyContent: 'flex-start' }}>
                <button className="up-btn-primary">Perbarui Kata Sandi</button>
              </div>
            </div>
          )}

          {/* ── TAB: BANTUAN ────────────────────────────────── */}
          {activeTab === 'help' && (
            <div className="up-panel up-fade">
              <div className="up-panel-header">
                <div>
                  <h2 className="up-panel-title">Pusat Bantuan</h2>
                  <p className="up-panel-sub">Kami siap membantu Anda 24/7.</p>
                </div>
              </div>
              <div className="up-help-hero">
                <div className="up-help-icon"><MessagesSquare size={36} /></div>
                <h3>Ada yang bisa kami bantu?</h3>
                <p>Tim support kami siap melayani pertanyaan seputar top-up, transaksi, dan akun.</p>
                <div className="up-help-actions">
                  <button className="up-btn-primary up-btn-wa">💬 Chat WhatsApp</button>
                  <button className="up-btn-outline">📧 Kirim Email</button>
                </div>
              </div>
              <div className="up-help-faq">
                <h4 className="up-section-title">FAQ Cepat</h4>
                {[
                  { q: 'Berapa lama proses top-up?', a: 'Proses berlangsung otomatis dalam 1–5 detik setelah pembayaran terkonfirmasi.' },
                  { q: 'Apakah transaksi bisa dibatalkan?', a: 'Transaksi yang sudah diproses tidak dapat dibatalkan. Hubungi CS jika ada masalah.' },
                  { q: 'Metode pembayaran apa saja yang tersedia?', a: 'QRIS, E-Wallet (OVO, GoPay, Dana), Virtual Account, dan minimarket.' },
                ].map(({ q, a }) => (
                  <div key={q} className="up-faq-item">
                    <div className="up-faq-q">❓ {q}</div>
                    <div className="up-faq-a">{a}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
