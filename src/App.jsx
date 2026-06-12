import React, { useState, useEffect } from 'react';
import { 
  Search, Bell, Gamepad2, MessageSquare, Settings, Gift, Star, 
  Zap, Ticket, BarChart3, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Camera, Globe, Video, ShoppingCart, LogOut, User
} from 'lucide-react';
import './index.css';
import ProductDetail from './ProductDetail';
import { MysteryBoxGame, ScratchGame, RouletteGame } from './ArcadeGames';
import LiveChat from './LiveChat';
import BuyCoinsPage from './BuyCoinsPage';
import CartDrawer from './CartDrawer';
import AdminDashboard from './AdminDashboard';
import UserProfile from './UserProfile';
import AuthModal from './AuthModal';
import PaymentPage from './PaymentPage';
import { supabase } from './supabaseClient';
import { useT } from './i18n';
import { toast, confirm } from './AlertSystem.jsx';



function PromoPage({ promos, t }) {
  const [copiedId, setCopiedId] = React.useState(null);

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success(`Kode "${code}" berhasil disalin!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categoryColors = {
    'Cashback':      { bg: '#fef3c7', color: '#92400e' },
    'Diskon':        { bg: '#ede9fe', color: '#5b21b6' },
    'Game Spesifik': { bg: '#dbeafe', color: '#1e40af' },
    'Pengguna Baru': { bg: '#d1fae5', color: '#065f46' },
    'Flash Sale':    { bg: '#fee2e2', color: '#b91c1c' },
  };

  return (
    <main className="page-container">
      <div className="promo-wrapper">
        <h2 className="page-title">{t('promo_title')}</h2>
        {promos.length === 0 ? (
          <div style={{textAlign:'center',padding:'60px 20px'}}>
            <div style={{fontSize:'3rem',marginBottom:'12px'}}>🎁</div>
            <p style={{color:'#64748b',fontWeight:600}}>Belum ada promo aktif saat ini.</p>
          </div>
        ) : (
          <div className="promo-grid">
            {promos.map((promo) => {
              const cat = categoryColors[promo.category] || { bg: '#f1f5f9', color: '#475569' };
              const isCopied = copiedId === promo.id;
              return (
                <div className="promo-card" key={promo.id}>
                  <div className="promo-card-image">
                    <img src={promo.image_url || '/hero_bg.png'} alt={promo.title} />
                    <span className="promo-cat-badge" style={{background: cat.bg, color: cat.color}}>
                      {promo.category}
                    </span>
                  </div>
                  <div className="promo-card-content">
                    <div className="promo-card-top">
                      <h3>{promo.title}</h3>
                      <p>{promo.description}</p>
                    </div>
                    <div className="promo-code-section">
                      <div className="promo-code-row">
                        <div className="promo-code-pill">
                          <span className="promo-code-label-sm">{t('promo_code_label')}</span>
                          <span className="promo-code-value">{promo.code}</span>
                        </div>
                        <button
                          className={`promo-copy-btn ${isCopied ? 'copied' : ''}`}
                          onClick={() => handleCopy(promo.code, promo.id)}
                        >
                          {isCopied ? (
                            <><span className="copy-icon">✓</span> Tersalin!</>
                          ) : (
                            <><span className="copy-icon">📋</span> {t('promo_copy')}</>
                          )}
                        </button>
                      </div>
                      <div className="promo-exp-row">
                        <span className="promo-exp-text">
                          🗓 {t('promo_valid')} <strong>
                            {promo.expiry_date
                              ? new Date(promo.expiry_date).toLocaleDateString('id-ID', {day:'numeric',month:'long',year:'numeric'})
                              : 'Tidak ada masa berlaku'}
                          </strong>
                        </span>
                        {promo.discount_value > 0 && (
                          <span className="promo-discount-badge">
                            {promo.discount_type === 'percent'
                              ? `Hemat ${promo.discount_value}%`
                              : `Hemat Rp ${Number(promo.discount_value).toLocaleString('id-ID')}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function LoginGate({ onLogin, title, icon, desc, btnText = 'Masuk / Daftar Sekarang', subText = 'Gratis · Proses cepat · Aman' }) {
  return (
    <main className="page-container">
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', textAlign: 'center', padding: '40px 20px'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px', lineHeight: 1 }}>{icon}</div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
          {title}
        </h2>
        <p style={{ fontSize: '1rem', color: '#64748b', margin: '0 0 32px', maxWidth: '380px', lineHeight: 1.6 }}>
          {desc}
        </p>
        <button
          onClick={onLogin}
          style={{
            padding: '13px 36px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', fontWeight: 800, fontSize: '1rem',
            border: 'none', borderRadius: '14px', cursor: 'pointer',
            boxShadow: '0 4px 18px rgba(99,102,241,.4)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          🔐 {btnText}
        </button>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '16px' }}>{subText}</p>
      </div>
    </main>
  );
}

// ── Admin Guard: login via Supabase Auth ────────────────────
function AdminGuard({ onExit }) {
  const [authed, setAuthed] = React.useState(false);
  const [checking, setChecking] = React.useState(true);
  const [email, setEmail]   = React.useState('');
  const [pw, setPw]         = React.useState('');
  const [err, setErr]       = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // Cek apakah sudah ada session aktif dengan role admin
  React.useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (profile?.role === 'admin') {
          setAuthed(true);
        }
      }
      setChecking(false);
    };
    checkSession();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      // Login via Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pw,
      });
      if (error) throw error;

      // Cek role admin di tabel profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Akun ini tidak memiliki akses admin.');
      }

      setAuthed(true);
    } catch (err) {
      setErr(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0f172a'}}>
        <div style={{color:'#6366f1',fontSize:'1rem',fontWeight:700}}>🔄 Memeriksa sesi...</div>
      </div>
    );
  }

  if (authed) {
    return <AdminDashboard onExit={async () => {
      await supabase.auth.signOut();
      onExit();
    }} />;
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)',
      fontFamily:"'Inter',sans-serif", padding:20
    }}>
      <div style={{
        background:'#1e293b', borderRadius:24, padding:'40px 36px',
        width:'100%', maxWidth:420,
        boxShadow:'0 24px 60px rgba(0,0,0,.5)',
        border:'1px solid rgba(99,102,241,.3)'
      }}>
        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:32}}>
          <img src="/logo.png" alt="Gamora" style={{width:64,height:64,objectFit:'contain',marginBottom:12}} />
          <h2 style={{color:'#f1f5f9',fontWeight:800,fontSize:'1.4rem',margin:0}}>Gamora Admin</h2>
          <p style={{color:'#64748b',fontSize:'0.85rem',margin:'6px 0 0'}}>Masuk dengan akun admin Supabase</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{marginBottom:16}}>
            <label style={{display:'block',fontSize:'0.78rem',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:.5,marginBottom:6}}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@gamora.com"
              required
              autoComplete="email"
              style={{
                width:'100%',padding:'12px 14px',borderRadius:12,
                border:'1.5px solid #334155',background:'#0f172a',
                color:'#f1f5f9',fontSize:'0.92rem',outline:'none',
                boxSizing:'border-box',fontFamily:'inherit',
              }}
              onFocus={e => e.target.style.borderColor='#6366f1'}
              onBlur={e => e.target.style.borderColor='#334155'}
            />
          </div>
          <div style={{marginBottom:20}}>
            <label style={{display:'block',fontSize:'0.78rem',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:.5,marginBottom:6}}>
              Password
            </label>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              style={{
                width:'100%',padding:'12px 14px',borderRadius:12,
                border:'1.5px solid #334155',background:'#0f172a',
                color:'#f1f5f9',fontSize:'0.92rem',outline:'none',
                boxSizing:'border-box',fontFamily:'inherit',
              }}
              onFocus={e => e.target.style.borderColor='#6366f1'}
              onBlur={e => e.target.style.borderColor='#334155'}
            />
          </div>

          {err && (
            <div style={{
              background:'#450a0a',border:'1px solid #b91c1c',
              color:'#fca5a5',borderRadius:10,padding:'10px 14px',
              fontSize:'0.85rem',fontWeight:600,marginBottom:16
            }}>
              ⚠ {err}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width:'100%',padding:'13px',borderRadius:12,
              background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color:'#fff',fontWeight:800,fontSize:'0.95rem',
              border:'none',cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow:'0 4px 18px rgba(99,102,241,.4)',
              fontFamily:'inherit', opacity: loading ? .7 : 1
            }}
          >
            {loading ? '🔄 Memverifikasi...' : '🔐 Masuk ke Dashboard'}
          </button>
        </form>

        <button
          onClick={onExit}
          style={{
            marginTop:16, width:'100%', padding:'10px',
            background:'transparent',border:'1px solid #334155',
            color:'#64748b',borderRadius:10,cursor:'pointer',
            fontSize:'0.85rem',fontWeight:600,fontFamily:'inherit',
          }}
          onMouseOver={e => e.target.style.color='#94a3b8'}
          onMouseOut={e => e.target.style.color='#64748b'}
        >
          ← Kembali ke Toko
        </button>
      </div>
    </div>
  );
}

function App() {
  const [faqOpen, setFaqOpen] = useState(null);
  const [activeTab, setActiveTab] = useState('lagi-populer');
  const [currentPage, setCurrentPage] = useState(() => {
    if (window.location.pathname === '/admin') return 'admin';
    const params = new URLSearchParams(window.location.search);
    const pageFromUrl = params.get('page');
    if (pageFromUrl) return pageFromUrl;
    return localStorage.getItem('currentPage') || 'beranda';
  });
  const [currentProduct, setCurrentProduct] = useState(() => {
    return localStorage.getItem('currentProduct') || null;
  });
  const [gachaMode, setGachaMode] = useState('menu');
  const [coins, setCoins] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('ID');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useT(currentLang);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Backend data per user
  const [transactions, setTransactions] = useState([]);
  const [promos, setPromos] = useState([]);
  const [gachaHistory, setGachaHistory] = useState([]);
  const [trxLoading, setTrxLoading] = useState(false);

  // Fetch transaksi user dari Supabase
  const fetchTransactions = async (userId) => {
    setTrxLoading(true);
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setTransactions(data);
    setTrxLoading(false);
  };

  // Fetch promo aktif dari Supabase
  const fetchPromos = async () => {
    const { data } = await supabase
      .from('promos')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (data) setPromos(data);
  };

  // Fetch gacha history user
  const fetchGachaHistory = async (userId) => {
    const { data } = await supabase
      .from('gacha_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setGachaHistory(data);
  };

  useEffect(() => {
    let mounted = true;

    // Fetch atau buat profile dari tabel profiles (data konsisten lintas platform)
    const fetchOrCreateProfile = async (authUser) => {
      if (!authUser || !mounted) return;

      // Ambil provider list dari identities user
      const providers = (authUser.identities || []).map(i => i.provider);

      // Coba fetch existing profile
      const { data: existing } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (existing) {
        // Profile sudah ada — update providers terbaru
        const updatedProviders = [...new Set([...(existing.providers || []), ...providers])];
        const { data: updated } = await supabase
          .from('profiles')
          .update({ providers: updatedProviders })
          .eq('id', authUser.id)
          .select()
          .single();
        if (mounted) {
          setProfile(updated || existing);
          setCoins((updated || existing).coins ?? 0);
        }
      } else {
        // Profile belum ada — buat baru
        const newProfile = {
          id: authUser.id,
          full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0],
          avatar_url: authUser.user_metadata?.avatar_url || null,
          email: authUser.email,
          coins: 0,
          providers: providers,
        };
        const { data: created } = await supabase
          .from('profiles')
          .upsert(newProfile, { onConflict: 'id' })
          .select()
          .single();
        if (mounted && created) {
          setProfile(created);
          setCoins(created.coins ?? 0);
        }
      }
    };

    // Cek session saat pertama load (termasuk setelah OAuth redirect callback)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session?.user) {
        console.log('[Auth] Session restored:', session.user.email);
        setUser(session.user);
        fetchOrCreateProfile(session.user);
        fetchTransactions(session.user.id);
        fetchPromos();
        fetchGachaHistory(session.user.id);
      }
    });

    // Listen semua perubahan auth state (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth]', event, '|', session?.user?.email || 'no user');
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        fetchOrCreateProfile(session.user);
        fetchTransactions(session.user.id);
        fetchPromos();
        fetchGachaHistory(session.user.id);
        setAuthModalOpen(false);
        // Bersihkan URL dari OAuth params setelah session sudah disimpan
        const url = new URL(window.location.href);
        if (url.searchParams.has('code') || url.hash.includes('access_token')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setCoins(0);
        setTransactions([]);
        setGachaHistory([]);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      if (isLoginMode) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setAuthModalOpen(false);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Registrasi berhasil! Silakan masuk dengan akun yang baru dibuat.');
        setIsLoginMode(true);
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.lang-dropdown-container')) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const handleCoinsChange = async (delta, gachaInfo = null) => {
    if (!user) return;
    const newCoins = Math.max(0, coins + delta);
    setCoins(newCoins);
    // Sync coins ke Supabase
    await supabase
      .from('profiles')
      .update({ coins: newCoins })
      .eq('id', user.id);
    // Catat ke gacha_history kalau ini dari game
    if (gachaInfo) {
      await supabase.from('gacha_history').insert({
        user_id: user.id,
        game_type: gachaInfo.game_type,
        bet_amount: gachaInfo.bet_amount || 0,
        win_amount: delta > 0 ? delta : 0,
        prize_name: gachaInfo.prize_name || null,
        result: delta > 0 ? 'win' : 'lose',
      });
      fetchGachaHistory(user.id);
    }
  };

  // Tambah transaksi baru (dipanggil saat user checkout)
  const addTransaction = async (trxData) => {
    if (!user) return;
    const { data } = await supabase.from('transactions').insert({
      user_id: user.id,
      game: trxData.game,
      item_name: trxData.item_name,
      price: trxData.price,
      status: trxData.status || 'success',
      image_url: trxData.image_url || null,
    }).select().single();
    if (data) setTransactions(prev => [data, ...prev]);
  };

  // Guard: kalau belum login, buka auth modal
  const requireAuth = (action) => {
    if (!user) {
      setAuthModalOpen(true);
      return false;
    }
    action();
    return true;
  };

  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
    if (currentProduct) {
      localStorage.setItem('currentProduct', currentProduct);
    } else {
      localStorage.removeItem('currentProduct');
    }
    
    // Jangan timpa URL kalau ada OAuth callback params (code= atau access_token)
    // Supabase perlu baca params ini untuk PKCE exchange
    const hasOAuthParams = window.location.search.includes('code=') || 
                           window.location.hash.includes('access_token');
    if (hasOAuthParams) return;

    // Sync with browser history
    const currentState = window.history.state;
    if (!currentState || currentState.page !== currentPage || currentState.product !== currentProduct) {
       let newUrl = '/';
       if (currentPage === 'admin') {
         newUrl = '/admin';
       } else {
         const urlParams = new URLSearchParams();
         if (currentPage !== 'beranda') urlParams.set('page', currentPage);
         if (currentProduct) urlParams.set('product', currentProduct);
         const queryString = urlParams.toString();
         if (queryString) newUrl = `/?${queryString}`;
       }
       
       window.history.pushState(
         { page: currentPage, product: currentProduct }, 
         '', 
         newUrl
       );
    }
  }, [currentPage, currentProduct]);

  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state) {
        if (e.state.page) setCurrentPage(e.state.page);
        setCurrentProduct(e.state.product || null);
      }
    };
    
    // Jangan replace state kalau ada OAuth callback params
    const hasOAuthParams = window.location.search.includes('code=') || 
                           window.location.hash.includes('access_token');

    if (!window.history.state && !hasOAuthParams) {
       let newUrl = '/';
       if (currentPage === 'admin') {
         newUrl = '/admin';
       } else {
         const urlParams = new URLSearchParams();
         if (currentPage !== 'beranda') urlParams.set('page', currentPage);
         if (currentProduct) urlParams.set('product', currentProduct);
         const queryString = urlParams.toString();
         if (queryString) newUrl = `/?${queryString}`;
       }
       window.history.replaceState({ page: currentPage, product: currentProduct }, '', newUrl);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [banners, setBanners] = useState([
    "/hero_bg.png",
    "/mlbb.png",
    "/genshin.png",
    "/pubg.png",
    "/ff.png"
  ]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data, error } = await supabase.from('banners').select('image_url').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          setBanners(data.map(b => b.image_url));
        }
      } catch (err) {
        console.error('Error fetching frontend banners:', err);
      }
    };
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          setProducts(data);
        }
      } catch (err) {
        console.error('Error fetching frontend products:', err);
      }
    };
    
    fetchBanners();
    fetchProducts();
    fetchPromos(); // promos bisa di-load tanpa login
  }, []);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches ? e.targetTouches[0].clientX : e.clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches ? e.targetTouches[0].clientX : e.clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }
    if (distance < -50) {
      setCurrentBanner((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const getPrevBanner = () => (currentBanner === 0 ? banners.length - 1 : currentBanner - 1);
  const getNextBanner = () => (currentBanner + 1) % banners.length;

  // transactions dan promos sekarang dari state Supabase (diset via fetchTransactions / fetchPromos)

  const toggleFaq = (index) => {
    if (faqOpen === index) {
      setFaqOpen(null);
    } else {
      setFaqOpen(index);
    }
  };

  const handleTabClick = (e, id) => {
    e.preventDefault();
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({top: y, behavior: 'smooth'});
    }
  };

  if (currentPage === 'admin') {
    return <AdminGuard onExit={() => setCurrentPage('beranda')} />;
  }

  return (
    <>
      {/* AUTH MODAL — Social Login */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* HEADER GAMORA */}
      <header className="header-gamora">
        <div className="gamora-header-left">
          <div className="gamora-logo-container" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => { setCurrentPage('beranda'); setCurrentProduct(null); }}>
            <img src="/logo-header.png" alt="Gamora Logo" style={{ height: '55px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <div className="gamora-search">
            <Search size={16} color="#94a3b8" />
            <input type="text" placeholder={t('search_placeholder')} />
          </div>
        </div>
        
        <div className="gamora-header-right">
          <nav className="gamora-nav">
            <a href="#" className={`nav-item ${currentPage === 'beranda' && !currentProduct ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentPage('beranda'); setCurrentProduct(null); }}>
              <Gamepad2 size={16} /> {t('nav_home')}
            </a>
            <a href="#" className={`nav-item ${currentPage === 'transaksi' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); requireAuth(() => { setCurrentPage('transaksi'); setCurrentProduct(null); }); }}>
              <BarChart3 size={16} /> {t('nav_transaksi')}
            </a>
            <a href="#" className={`nav-item ${currentPage === 'promo' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); requireAuth(() => { setCurrentPage('promo'); setCurrentProduct(null); }); }}>
              <Ticket size={16} /> {t('nav_promo')}
            </a>
            <a href="#" className={`nav-item ${currentPage === 'gacha' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); requireAuth(() => { setCurrentPage('gacha'); setCurrentProduct(null); }); }}>
              <Gift size={16} /> {t('nav_gacha')}
            </a>
          </nav>
          
          <div className="gamora-divider"></div>
          
          <div className="gamora-cart-wrapper" onClick={() => requireAuth(() => setIsCartOpen(true))} style={{cursor: 'pointer'}}>
            <div className="gamora-cart">
              <ShoppingCart size={18} color="#64748b" />
            </div>
            <span className="gamora-cart-badge">{cartItems.length}</span>
          </div>

          {/* Gamora Coin Balance */}
          <div className="gamora-coin-btn" onClick={() => { 
            requireAuth(() => { setCurrentPage('topup-coins'); setCurrentProduct(null); });
          }}>
            <div className="gc-icon-wrapper">
              <span className="gc-icon">⭐</span>
            </div>
            <span className="gc-amount">{user ? coins.toLocaleString('id-ID') : '0'}</span>
            <div className="gc-plus">+</div>
          </div>
          
          <div className="gamora-lang-btn lang-dropdown-container" onClick={() => setLangMenuOpen(!langMenuOpen)} style={{position: 'relative'}}>
            <Globe size={16} color="#64748b" /> 
            <span style={{fontWeight: 700, margin: '0 2px'}}>{currentLang}</span> 
            <ChevronDown size={14} color="#94a3b8" />
            
            {langMenuOpen && (
              <div className="lang-dropdown-menu">
                {['ID - Indonesia', 'EN - English', 'MY - Malaysia', 'SG - Singapore', 'TH - Thailand', 'PH - Philippines'].map(lang => (
                  <div 
                    key={lang} 
                    className={`lang-option ${currentLang === lang.split(' ')[0] ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentLang(lang.split(' ')[0]);
                      setLangMenuOpen(false);
                    }}
                  >
                    {lang}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {user ? (
            <div className="gamora-profile-btn" onClick={() => setCurrentPage('profile')} style={{cursor: 'pointer'}}>
              <div className="gamora-avatar">
                <img 
                  src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || user.email)}&background=6366f1&color=fff`} 
                  alt="Avatar" 
                />
              </div>
              <span style={{fontWeight: 700, color: '#0f172a'}}>
                {profile?.full_name?.split(' ')[0] || user.email.split('@')[0]}
              </span>
            </div>
          ) : (
            <div className="gamora-login-btn" onClick={() => setAuthModalOpen(true)}>
              <span>{t('login_btn')}</span>
            </div>
          )}
        </div>
      </header>

      {/* PRODUCT DETAIL PAGE */}
      {currentProduct && (
        <div style={{ paddingTop: '70px' }}>
          <ProductDetail 
            productId={currentProduct}
            onBack={() => setCurrentProduct(null)} 
            onAddToCart={(item) => setCartItems(prev => [...prev, item])}
            onAddTransaction={addTransaction}
            userId={user?.id}
            currentCoins={coins}
            onCoinsChange={handleCoinsChange}
          />
        </div>
      )}

      {currentPage === 'beranda' && !currentProduct && (
      <main>
      {/* BANNER CAROUSEL SECTION */}
      <section className="banner-carousel-container">
        <div 
          className="banner-wrapper-3d"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onTouchStart}
          onMouseMove={(e) => touchStart && onTouchMove(e)}
          onMouseUp={onTouchEnd}
          onMouseLeave={() => {
            if(touchStart) onTouchEnd();
            setTouchStart(null);
          }}
          style={{ cursor: 'grab' }}
        >
          {banners.map((imgSrc, idx) => {
            let offset = idx - currentBanner;
            if (offset < -Math.floor(banners.length / 2)) offset += banners.length;
            if (offset > Math.floor(banners.length / 2)) offset -= banners.length;

            let className = "banner-3d-item";
            if (offset === 0) className += " active";
            else if (offset === -1) className += " prev";
            else if (offset === 1) className += " next";
            else className += " hidden";

            return (
              <div 
                key={idx} 
                className={className} 
                onClick={() => {
                  if (offset === -1) setCurrentBanner(getPrevBanner());
                  if (offset === 1) setCurrentBanner(getNextBanner());
                }}
              >
                <img src={imgSrc} alt={`Banner ${idx}`} draggable="false" />
              </div>
            );
          })}
        </div>
        <div className="banner-dots">
          {banners.map((_, idx) => (
            <span 
              key={idx} 
              className={`dot ${idx === currentBanner ? 'active' : ''}`}
              onClick={() => setCurrentBanner(idx)}
              style={{cursor: 'pointer'}}
            ></span>
          ))}
        </div>
      </section>

      <div className="floating-chat-btn">
        <MessageSquare size={24} color="white" />
      </div>



      {/* FILTER TABS */}
      <div className="filter-tabs">
        <button className={`filter-pill ${activeTab === 'lagi-populer' ? 'active' : ''}`} onClick={(e) => handleTabClick(e, 'lagi-populer')}>{t('section_popular')}</button>
        <button className={`filter-pill ${activeTab === 'voucher' ? 'active' : ''}`} onClick={(e) => handleTabClick(e, 'voucher')}>{t('section_voucher')}</button>
        <button className={`filter-pill ${activeTab === 'top-up-langsung' ? 'active' : ''}`} onClick={(e) => handleTabClick(e, 'top-up-langsung')}>{t('section_topup')}</button>
        <button className="filter-pill">{t('section_new')}</button>
        <button className="filter-pill">{t('section_topup_login')}</button>
        <button className="filter-pill">{t('filter_pulsa')}</button>
        <button className="filter-pill">{t('filter_entertainment')}</button>
      </div>


      {/* LAGI POPULER */}
      <section id="lagi-populer" className="simple-grid-section">
        <div className="section-header-simple">
          <h2>{t('section_popular')}</h2>
        </div>
        <div className="grid-5">
          {products.filter(p => p.category === 'lagi-populer').map(p => (
            <div className="simple-card" key={p.id} onClick={() => setCurrentProduct(p.id)} style={{cursor:'pointer'}}>
              <div className="simple-card-img">
                <img src={p.image_url} alt={p.name} />
                {p.has_cashback && <div className="cashback-pill">💰 CASHBACK</div>}
              </div>
              <h4>{p.name}</h4>
            </div>
          ))}
        </div>
        <div className="load-more">
          <button>{t('show_more')}</button>
        </div>
      </section>

      {/* VOUCHER */}
      <section id="voucher" className="simple-grid-section">
        <div className="section-header-simple">
          <h2>{t('section_voucher')}</h2>
        </div>
        <div className="grid-5">
          {products.filter(p => p.category === 'voucher').map(p => (
            <div className="simple-card" key={p.id} onClick={() => setCurrentProduct(p.id)} style={{cursor:'pointer'}}>
              <div className="simple-card-img">
                <img src={p.image_url} alt={p.name} />
                {p.has_cashback && <div className="cashback-pill">💰 CASHBACK</div>}
              </div>
              <h4>{p.name}</h4>
            </div>
          ))}
        </div>
        <div className="load-more">
          <button>{t('show_more')}</button>
        </div>
      </section>

      {/* TOP UP LANGSUNG */}
      <section id="top-up-langsung" className="simple-grid-section">
        <div className="section-header-simple">
          <h2>{t('section_topup')}</h2>
        </div>
        <div className="grid-5">
          {products.filter(p => p.category === 'top-up-langsung').map(p => (
            <div className="simple-card" key={p.id} onClick={() => setCurrentProduct(p.id)} style={{cursor:'pointer'}}>
              <div className="simple-card-img">
                <img src={p.image_url} alt={p.name} />
                {p.has_cashback && <div className="cashback-pill">💰 CASHBACK</div>}
              </div>
              <h4>{p.name}</h4>
            </div>
          ))}
        </div>
        <div className="load-more">
          <button>{t('show_more')}</button>
        </div>
      </section>


      {/* TESTIMONIALS */}
      <section className="section">
        <div className="section-header">
          <div className="section-title">
            <h2>{t('testi_title')}</h2>
            <p>{t('testi_sub')}</p>
          </div>
        </div>

        <div className="grid-3">
          <div className="testi-card">
            <div className="stars">
              <Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} />
            </div>
            <p>"GamerCredits emang gila cepatnya! Tadi top up MLBB gak sampe 10 detik langsung masuk Diamond-nya. Parah sih recommended banget."</p>
            <div className="user-info">
              <img src="https://ui-avatars.com/api/?name=Andi+Wijaya&background=random" alt="User" className="user-avatar" />
              <div className="user-details">
                <h4>Andi Wijaya</h4>
                <span>Pro Player MLBB</span>
              </div>
            </div>
          </div>
          <div className="testi-card">
            <div className="stars">
              <Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} />
            </div>
            <p>"Suka banget sama UI-nya yang modern dan gampang banget dipake. Pilihan pembayarannya lengkap, bisa pake QRIS sampe transfer bank. Mantap!"</p>
            <div className="user-info">
              <img src="https://ui-avatars.com/api/?name=Siska+Putri&background=random" alt="User" className="user-avatar" />
              <div className="user-details">
                <h4>Siska Putri</h4>
                <span>Twitch Streamer</span>
              </div>
            </div>
          </div>
          <div className="testi-card">
            <div className="stars">
              <Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} />
            </div>
            <p>"Harga primogems di sini paling stabil dan sering ada diskon flash sale. Prosesnya otomatis banget, tinggal input UID langsung beres."</p>
            <div className="user-info">
              <img src="https://ui-avatars.com/api/?name=Budi+Santoso&background=random" alt="User" className="user-avatar" />
              <div className="user-details">
                <h4>Budi Santoso</h4>
                <span>Casual Gamer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <div className="faq-container">
        <section className="faq-section">
          <div className="section-header">
            <div className="section-title">
              <h2>{t('faq_title')}</h2>
              <p>{t('faq_sub')}</p>
            </div>
          </div>
          <div className="faq-list">
            {[
              { q: t('faq_q1'), a: t('faq_a1') },
              { q: t('faq_q2'), a: t('faq_a2') },
              { q: t('faq_q3'), a: t('faq_a3') },
              { q: t('faq_q4'), a: t('faq_a4') },
            ].map((item, idx) => (
              <div className="faq-item" key={idx}>
                <div className="faq-question" onClick={() => toggleFaq(idx)}>
                  {item.q}
                  {faqOpen === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                {faqOpen === idx && (
                  <div className="faq-answer">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
      </main>
      )}

      {currentPage === 'profile' && (
        <UserProfile 
          user={user} 
          profile={profile} 
          onProfileUpdate={(p) => { setProfile(p); if (p.coins !== undefined) setCoins(p.coins); }} 
          onExit={() => setCurrentPage('beranda')} 
        />
      )}

      {currentPage === 'payment' && (
        <PaymentPage
          cartItems={cartItems}
          user={user}
          addTransaction={addTransaction}
          coins={coins}
          onCoinsChange={handleCoinsChange}
          onBack={() => { setCurrentPage('beranda'); setIsCartOpen(true); }}
          onSuccess={() => {
            setCartItems([]);
            setCurrentPage('beranda');
            toast.success('Terima kasih! Pembelianmu berhasil diproses. 🎉');
          }}
        />
      )}

      {currentPage === 'topup-coins' && (
        user
          ? <BuyCoinsPage
              coins={coins}
              onCoinsChange={handleCoinsChange}
              onAddTransaction={addTransaction}
              userId={user?.id}
            />
          : <LoginGate
              onLogin={() => setAuthModalOpen(true)}
              icon="⭐"
              title={t('gate_coins_title')}
              desc={t('gate_coins_desc')}
              btnText={t('gate_btn')}
              subText={t('gate_sub')}
            />
      )}

      {currentPage === 'transaksi' && (
        user
          ? <main className="page-container">
              <div className="transaction-wrapper">
                <h2 className="page-title">{t('trx_title')}</h2>
                {trxLoading ? (
                  <div style={{textAlign:'center',padding:'40px',color:'#94a3b8'}}>Memuat data...</div>
                ) : transactions.length === 0 ? (
                  <div style={{textAlign:'center',padding:'60px 20px'}}>
                    <div style={{fontSize:'3rem',marginBottom:'12px'}}>📭</div>
                    <p style={{color:'#64748b',fontWeight:600}}>{t('trx_empty')}</p>
                  </div>
                ) : (
                  <div className="transaction-list">
                    {transactions.map((trx) => (
                      <div className="trx-card" key={trx.id}>
                        <div className="trx-header">
                          <span className="trx-date">
                            {new Date(trx.created_at).toLocaleDateString('id-ID', {
                              day:'numeric', month:'long', year:'numeric',
                              hour:'2-digit', minute:'2-digit'
                            })}
                          </span>
                          <span className={`trx-status status-${trx.status}`}>{trx.status}</span>
                        </div>
                        <div className="trx-body">
                          <div className="trx-info">
                            <h4>{trx.game}</h4>
                            <p>{trx.item_name}</p>
                            <span className="trx-id">ID: {trx.id.slice(0,8).toUpperCase()}</span>
                          </div>
                          <div className="trx-price">
                            Rp {Number(trx.price).toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </main>
          : <LoginGate
              onLogin={() => setAuthModalOpen(true)}
              icon="📋"
              title={t('gate_transaksi_title')}
              desc={t('gate_transaksi_desc')}
              btnText={t('gate_btn')}
              subText={t('gate_sub')}
            />
      )}

      {currentPage === 'promo' && (
        user
          ? <PromoPage promos={promos} t={t} onLoginRequired={() => setAuthModalOpen(true)} />
          : <LoginGate
              onLogin={() => setAuthModalOpen(true)}
              icon="🎁"
              title={t('gate_promo_title')}
              desc={t('gate_promo_desc')}
              btnText={t('gate_btn')}
              subText={t('gate_sub')}
            />
      )}

      {currentPage === 'gacha' && (
        !user
          ? <LoginGate
              onLogin={() => setAuthModalOpen(true)}
              icon="🎰"
              title={t('gate_gacha_title')}
              desc={t('gate_gacha_desc')}
              btnText={t('gate_btn')}
              subText={t('gate_sub')}
            />
          : <main className="arcade-page">

          {/* HERO BANNER */}
          <div className="arcade-hero">
            <div className="arcade-hero-bg" />
            <div className="arcade-hero-content">
              <div className="arcade-badge">🎮 GAMORA ARCADE</div>
              <h1 className="arcade-title">PLAY & <span>WIN BIG</span></h1>
              <p className="arcade-subtitle">Pilih gamenya, keluarkan koin kamu, dan raih hadiah seru setiap hari!</p>
              <div className="arcade-coins-display">
                <div className="arcade-coin-icon">⭐</div>
                <div>
                  <div className="arcade-coin-label">Koin Kamu</div>
                  <div className="arcade-coin-val">{coins.toLocaleString('id-ID')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* GAME MENU */}
          {gachaMode === 'menu' && (
            <div className="arcade-menu-section">
              <div className="arcade-section-label">— Pilih Permainan —</div>
              <div className="arcade-game-grid">

                {/* Mystery Box Card */}
                <div className="arcade-game-card mystery" onClick={() => setGachaMode('mystery_box')}>
                  <div className="arcade-card-glow mystery-glow" />
                  <div className="arcade-card-inner">
                    <div className="arcade-card-badge">100 Koin</div>
                    <div className="arcade-card-icon">
                      <div className="arcade-icon-ring mystery-ring">
                        <span>🎁</span>
                      </div>
                    </div>
                    <div className="arcade-card-info">
                      <h3>Mystery Box</h3>
                      <p>Buka kotak misterius dan dapatkan hadiah kejutan mulai dari Diamonds hingga Grand Prize!</p>
                    </div>
                    <div className="arcade-card-prizes">
                      <span className="arcade-prize-chip">💎 Diamonds</span>
                      <span className="arcade-prize-chip">🎫 Voucher</span>
                      <span className="arcade-prize-chip">🎮 Grand Prize</span>
                    </div>
                    <button className="arcade-play-btn mystery-btn">
                      Mainkan <span>→</span>
                    </button>
                  </div>
                </div>

                {/* Scratch Card */}
                <div className="arcade-game-card scratch" onClick={() => setGachaMode('scratch')}>
                  <div className="arcade-card-glow scratch-glow" />
                  <div className="arcade-card-inner">
                    <div className="arcade-card-badge">50 Koin</div>
                    <div className="arcade-card-icon">
                      <div className="arcade-icon-ring scratch-ring">
                        <span>🪄</span>
                      </div>
                    </div>
                    <div className="arcade-card-info">
                      <h3>Gosok & Menang</h3>
                      <p>Gosok permukaan kartu untuk mengungkap hadiahmu. Satu gosok bisa mengubah nasib!</p>
                    </div>
                    <div className="arcade-card-prizes">
                      <span className="arcade-prize-chip">💰 Cashback</span>
                      <span className="arcade-prize-chip">🎟️ Promo</span>
                      <span className="arcade-prize-chip">💎 Diamonds</span>
                    </div>
                    <button className="arcade-play-btn scratch-btn">
                      Mainkan <span>→</span>
                    </button>
                  </div>
                </div>

                {/* Lucky Roulette */}
                <div className="arcade-game-card roulette" onClick={() => setGachaMode('roulette')}>
                  <div className="arcade-card-glow roulette-glow" />
                  <div className="arcade-card-inner">
                    <div className="arcade-card-badge">200 Koin</div>
                    <div className="arcade-card-icon">
                      <div className="arcade-icon-ring roulette-ring">
                        <span>🎡</span>
                      </div>
                    </div>
                    <div className="arcade-card-info">
                      <h3>Lucky Roulette</h3>
                      <p>Putar roda keberuntungan dan lihat di mana jarumnya berhenti! Hadiah terbesar pernah ada.</p>
                    </div>
                    <div className="arcade-card-prizes">
                      <span className="arcade-prize-chip">🏆 Jackpot</span>
                      <span className="arcade-prize-chip">💎 10K Diamonds</span>
                      <span className="arcade-prize-chip">🎮 PS5</span>
                    </div>
                    <button className="arcade-play-btn roulette-btn">
                      Mainkan <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BACK BUTTON */}
          {gachaMode !== 'menu' && (
            <div className="arcade-back-bar">
              <button className="arcade-back-btn" onClick={() => setGachaMode('menu')}>
                ← Pilih Game Lain
              </button>
              <div className="arcade-coins-display" style={{marginLeft: 'auto'}}>
                <div className="arcade-coin-icon" style={{width: 32, height: 32, fontSize: '1rem'}}>⭐</div>
                <div>
                  <div className="arcade-coin-label" style={{fontSize: '0.7rem'}}>Sisa Koin</div>
                  <div className="arcade-coin-val" style={{fontSize: '1.1rem'}}>{coins.toLocaleString('id-ID')}</div>
                </div>
              </div>
            </div>
          )}

          {gachaMode === 'mystery_box' && <MysteryBoxGame coins={coins} onCoinsChange={handleCoinsChange} />}
          {gachaMode === 'scratch' && <ScratchGame coins={coins} onCoinsChange={handleCoinsChange} />}
          {gachaMode === 'roulette' && <RouletteGame coins={coins} onCoinsChange={handleCoinsChange} />}

        </main>
      )}

      {/* CartDrawer */}
      {/* PREMIUM FOOTER */}
      <footer className="gamora-footer">
        <div className="footer-top">
          <div className="footer-col brand-col">
            <div className="gamora-logo-container" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
              <img src="/logo-header.png" alt="Gamora Logo" style={{ height: '55px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            </div>
            <p>{t('footer_desc')}</p>
            <div className="social-links">
              <a href="#" className="social-btn"><Camera size={18} /></a>
              <a href="#" className="social-btn"><Globe size={18} /></a>
              <a href="#" className="social-btn"><Video size={18} /></a>
            </div>
          </div>
          
          <div className="footer-col">
            <h4>{t('footer_links')}</h4>
            <ul>
              <li><a href="#">{t('nav_home')}</a></li>
              <li><a href="#">{t('nav_transaksi')}</a></li>
              <li><a href="#">{t('nav_promo')}</a></li>
              <li><a href="#">{t('nav_gacha')}</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>{t('footer_contact')}</h4>
            <ul>
              <li><a href="#">{t('footer_terms')}</a></li>
              <li><a href="#">{t('footer_privacy')}</a></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>
          
          <div className="footer-col payment-col">
            <h4>{t('footer_payment')}</h4>
            <div className="payment-methods">
              <div className="pay-badge">QRIS</div>
              <div className="pay-badge">GoPay</div>
              <div className="pay-badge">OVO</div>
              <div className="pay-badge">Dana</div>
              <div className="pay-badge">ShopeePay</div>
              <div className="pay-badge">BCA</div>
              <div className="pay-badge">Mandiri</div>
              <div className="pay-badge">Alfamart</div>
              <div className="pay-badge">Indomaret</div>
            </div>
            <div className="security-badges" style={{marginTop: '1rem'}}>
              <div className="sec-badge">🔒 Secure Payment</div>
              <div className="sec-badge">⭐ Trusted</div>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>{t('footer_rights')}</p>
          <div className="footer-bottom-links">
            <a href="#">{t('footer_terms')}</a>
            <span className="dot">•</span>
            <a href="#">{t('footer_privacy')}</a>
          </div>
        </div>
      </footer>
      <LiveChat />
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={(id) => setCartItems(prev => prev.filter(i => i.id !== id))}
        onCheckout={() => {
          setIsCartOpen(false);
          setCurrentPage('payment');
        }}
      />

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="mobile-bottom-nav">
        <button 
          className={`mobile-nav-item ${currentPage === 'beranda' && !currentProduct ? 'active' : ''}`} 
          onClick={() => { setCurrentPage('beranda'); setCurrentProduct(null); }}
        >
          <Gamepad2 size={20} />
          <span>Shop</span>
        </button>
        
        <button 
          className={`mobile-nav-item ${currentPage === 'transaksi' ? 'active' : ''}`} 
          onClick={() => requireAuth(() => { setCurrentPage('transaksi'); setCurrentProduct(null); })}
        >
          <BarChart3 size={20} />
          <span>Transaksi</span>
        </button>

        <button 
          className={`mobile-nav-item ${currentPage === 'promo' ? 'active' : ''}`} 
          onClick={() => requireAuth(() => { setCurrentPage('promo'); setCurrentProduct(null); })}
        >
          <Ticket size={20} />
          <span>Promo</span>
        </button>

        <button 
          className={`mobile-nav-item ${currentPage === 'gacha' ? 'active' : ''}`} 
          onClick={() => requireAuth(() => { setCurrentPage('gacha'); setCurrentProduct(null); })}
        >
          <Gift size={20} />
          <span>Gacha</span>
        </button>      </div>
    </>
  );
}

export default App;
