import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ShoppingCart, Users, Package, Settings, 
  Search, Bell, LogOut, TrendingUp, DollarSign, 
  Activity, ArrowUpRight, ArrowDownRight, Menu, Image as ImageIcon, Trash2, Ticket, Plus
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { toast, confirm, alert } from './AlertSystem.jsx';
import './AdminDashboard.css';

export default function AdminDashboard({ onExit }) {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Banners State
  const [banners, setBanners] = useState([]);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Products State
  const [products, setProducts] = useState([]);
  const [uploadingProduct, setUploadingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ 
    name: '', category: 'lagi-populer', has_cashback: false, file: null,
    bannerFile: null, publisher: '', description: '', hero_description: ''
  });
  const [showProductModal, setShowProductModal] = useState(false);

  // Promos State
  const [promos, setPromos] = useState([]);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [uploadingPromo, setUploadingPromo] = useState(false);
  const [newPromo, setNewPromo] = useState({
    code: '', title: '', description: '', category: 'Diskon',
    discount_type: 'percent', discount_value: 0,
    expiry_date: '', is_active: true, file: null
  });

  // Transactions State
  const [allTransactions, setAllTransactions] = useState([]);
  const [trxSearch, setTrxSearch] = useState('');
  const [trxLoading, setTrxLoading] = useState(false);

  // Dashboard Stats State
  const [dashStats, setDashStats] = useState({
    totalRevenue: 0,
    successTrx: 0,
    totalUsers: 0,
    totalProducts: 0,
    pendingTrx: 0,
    totalPromos: 0,
  });
  const [dashLoading, setDashLoading] = useState(false);

  // Users State
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    if (activeMenu === 'banners') fetchBanners();
    if (activeMenu === 'products') fetchProducts();
    if (activeMenu === 'promos') fetchPromos();
    if (activeMenu === 'transactions') fetchAllTransactions();
    if (activeMenu === 'users') fetchUsers();
    if (activeMenu === 'dashboard') {
      fetchDashboardStats();
      fetchAllTransactions();
    }
  }, [activeMenu]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      // Fetch profiles + hitung transaksi per user
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch jumlah transaksi per user
      const { data: trxCounts } = await supabase
        .from('transactions')
        .select('user_id, status');

      // Gabungkan data
      const trxMap = {};
      (trxCounts || []).forEach(t => {
        if (!trxMap[t.user_id]) trxMap[t.user_id] = { total: 0, success: 0 };
        trxMap[t.user_id].total++;
        if (t.status === 'success') trxMap[t.user_id].success++;
      });

      const enriched = (profilesData || []).map(u => ({
        ...u,
        trxTotal: trxMap[u.id]?.total || 0,
        trxSuccess: trxMap[u.id]?.success || 0,
      }));

      setUsers(enriched);
    } catch (err) {
      toast.error('Gagal memuat pengguna: ' + err.message);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    setDashLoading(true);
    try {
      const [trxRes, usersRes, productsRes, promosRes] = await Promise.all([
        supabase.from('transactions').select('price, status, created_at'),
        supabase.from('profiles').select('id, created_at'),
        supabase.from('products').select('id'),
        supabase.from('promos').select('id').eq('is_active', true),
      ]);

      const trxData = trxRes.data || [];
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      const successTrx = trxData.filter(t => t.status === 'success');
      const totalRevenue = successTrx.reduce((s, t) => s + Number(t.price || 0), 0);
      const pendingTrx = trxData.filter(t => t.status === 'pending').length;

      // Hitung transaksi bulan ini vs bulan lalu untuk trend
      const thisMonthTrx = successTrx.filter(t => {
        const d = new Date(t.created_at);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      });
      const lastMonthTrx = successTrx.filter(t => {
        const d = new Date(t.created_at);
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;
        return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
      });

      const revenueThisMonth = thisMonthTrx.reduce((s,t) => s + Number(t.price||0), 0);
      const revenueLastMonth = lastMonthTrx.reduce((s,t) => s + Number(t.price||0), 0);
      const revenueTrend = revenueLastMonth > 0
        ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100)
        : revenueThisMonth > 0 ? 100 : 0;

      setDashStats({
        totalRevenue,
        successTrx: successTrx.length,
        totalUsers: (usersRes.data || []).length,
        totalProducts: (productsRes.data || []).length,
        pendingTrx,
        totalPromos: (promosRes.data || []).length,
        revenueTrend,
        thisMonthTrx: thisMonthTrx.length,
      });
    } catch (err) {
      console.error('Dashboard stats error:', err);
    } finally {
      setDashLoading(false);
    }
  };

  const fetchAllTransactions = async () => {
    setTrxLoading(true);
    try {
      // Join dengan profiles untuk dapat nama/email user
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAllTransactions(data || []);
    } catch (err) {
      toast.error('Gagal memuat transaksi: ' + err.message);
    } finally {
      setTrxLoading(false);
    }
  };

  const exportTransactionsCsv = () => {
    if (allTransactions.length === 0) return toast.warning('Tidak ada data untuk diekspor.');
    const header = 'ID,User,Game,Item,Harga,Status,Tanggal';
    const rows = allTransactions.map(t =>
      `${t.id.slice(0,8).toUpperCase()},${t.profiles?.email || '-'},${t.game},${t.item_name},${t.price},${t.status},${new Date(t.created_at).toLocaleString('id-ID')}`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transaksi_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File CSV berhasil diunduh!');
  };

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error.message);
    }
  };

  const uploadBanner = async (event) => {
    try {
      setUploadingBanner(true);
      const file = event.target.files[0];
      if (!file) return;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('banners').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(fileName);
      const { error: insertError } = await supabase.from('banners').insert([{ image_url: publicUrl }]);
      if (insertError) throw insertError;
      toast.success('Banner berhasil diupload!');
      fetchBanners();
    } catch (error) {
      toast.error('Gagal upload banner: ' + error.message);
    } finally {
      setUploadingBanner(false);
      event.target.value = '';
    }
  };

  const deleteBanner = async (id, e) => {
    e.preventDefault();
    const ok = await confirm('Yakin ingin menghapus banner ini?', 'Hapus Banner');
    if (!ok) return;
    try {
      const { error } = await supabase.from('banners').delete().eq('id', id);
      if (error) throw error;
      toast.success('Banner berhasil dihapus.');
      fetchBanners();
    } catch (error) {
      toast.error('Gagal menghapus banner: ' + error.message);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error.message);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.file) return toast.warning('Nama dan gambar wajib diisi!');
    try {
      setUploadingProduct(true);
      const file = newProduct.file;
      const fileExt = file.name.split('.').pop();
      const fileName = `cover_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl: coverUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
      let bannerUrl = null;
      if (newProduct.bannerFile) {
        const bFile = newProduct.bannerFile;
        const bExt = bFile.name.split('.').pop();
        const bName = `banner_${Date.now()}_${Math.random().toString(36).substring(7)}.${bExt}`;
        const { error: bError } = await supabase.storage.from('products').upload(bName, bFile);
        if (!bError) {
          const { data: { publicUrl: bUrl } } = supabase.storage.from('products').getPublicUrl(bName);
          bannerUrl = bUrl;
        }
      }
      const { error: insertError } = await supabase.from('products').insert([{
        name: newProduct.name,
        category: newProduct.category,
        image_url: coverUrl,
        has_cashback: newProduct.has_cashback,
        banner_url: bannerUrl,
        publisher: newProduct.publisher,
        description: newProduct.description,
        hero_description: newProduct.hero_description
      }]);
      if (insertError) throw insertError;
      toast.success('Produk berhasil ditambahkan!');
      setNewProduct({ name:'', category:'lagi-populer', has_cashback:false, file:null, bannerFile:null, publisher:'', description:'', hero_description:'' });
      setShowProductModal(false);
      fetchProducts();
    } catch (error) {
      toast.error('Gagal menambah produk: ' + error.message);
    } finally {
      setUploadingProduct(false);
    }
  };

  const deleteProduct = async (id, e) => {
    e.preventDefault();
    const ok = await confirm('Yakin ingin menghapus produk ini?', 'Hapus Produk');
    if (!ok) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast.success('Produk berhasil dihapus.');
      fetchProducts();
    } catch (error) {
      toast.error('Gagal menghapus produk: ' + error.message);
    }
  };

  // ── PROMO FUNCTIONS ──────────────────────────────────────
  const fetchPromos = async () => {
    const { data } = await supabase.from('promos').select('*').order('created_at', { ascending: false });
    if (data) setPromos(data);
  };

  const handlePromoSubmit = async (e) => {
    e.preventDefault();
    if (!newPromo.code || !newPromo.title) return toast.warning('Kode dan judul promo wajib diisi!');
    try {
      setUploadingPromo(true);
      let imageUrl = null;
      if (newPromo.file) {
        const f = newPromo.file;
        const ext = f.name.split('.').pop();
        const fname = `promo_${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('banners').upload(fname, f);
        if (!upErr) {
          const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(fname);
          imageUrl = publicUrl;
        }
      }
      const { error } = await supabase.from('promos').insert([{
        code: newPromo.code.toUpperCase(),
        title: newPromo.title,
        description: newPromo.description,
        category: newPromo.category,
        discount_type: newPromo.discount_type,
        discount_value: Number(newPromo.discount_value),
        expiry_date: newPromo.expiry_date || null,
        is_active: newPromo.is_active,
        image_url: imageUrl,
      }]);
      if (error) throw error;
      toast.success('Promo berhasil ditambahkan!');
      setNewPromo({ code:'', title:'', description:'', category:'Diskon', discount_type:'percent', discount_value:0, expiry_date:'', is_active:true, file:null });
      setShowPromoModal(false);
      fetchPromos();
    } catch (err) {
      toast.error('Gagal: ' + err.message);
    } finally {
      setUploadingPromo(false);
    }
  };

  const deletePromo = async (id, e) => {
    if (e) e.preventDefault();
    const ok = await confirm('Yakin ingin menghapus promo ini? Aksi ini tidak bisa dibatalkan.', 'Hapus Promo');
    if (!ok) return;
    try {
      const { error } = await supabase.from('promos').delete().eq('id', id);
      if (error) throw error;
      toast.success('Promo berhasil dihapus.');
      fetchPromos();
    } catch (err) {
      toast.error('Gagal menghapus: ' + (err.message || 'Cek RLS policy di Supabase'));
      console.error('[deletePromo]', err);
    }
  };

  const togglePromoActive = async (id, current) => {
    await supabase.from('promos').update({ is_active: !current }).eq('id', id);
    toast.success(current ? 'Promo dinonaktifkan.' : 'Promo diaktifkan.');
    fetchPromos();
  };

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <img src="/logo.png" alt="Gamora" style={{width:36,height:36,objectFit:'contain',borderRadius:8}} />
            <span className="admin-logo-text">Gamora Admin</span>
          </div>
        </div>
        
        <nav className="admin-nav">
          <p className="admin-nav-label">MAIN MENU</p>
          <button className={`admin-nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveMenu('dashboard')}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          <button className={`admin-nav-item ${activeMenu === 'transactions' ? 'active' : ''}`} onClick={() => setActiveMenu('transactions')}>
            <ShoppingCart size={20} />
            <span>Transaksi</span>
          </button>
          <button className={`admin-nav-item ${activeMenu === 'products' ? 'active' : ''}`} onClick={() => setActiveMenu('products')}>
            <Package size={20} />
            <span>Produk & Layanan</span>
          </button>
          <button className={`admin-nav-item ${activeMenu === 'banners' ? 'active' : ''}`} onClick={() => setActiveMenu('banners')}>
            <ImageIcon size={20} />
            <span>Banner Promosi</span>
          </button>
          <button className={`admin-nav-item ${activeMenu === 'promos' ? 'active' : ''}`} onClick={() => setActiveMenu('promos')}>
            <Ticket size={20} />
            <span>Manajemen Promo</span>
          </button>
          <button className={`admin-nav-item ${activeMenu === 'users' ? 'active' : ''}`} onClick={() => setActiveMenu('users')}>
            <Users size={20} />
            <span>Pengguna</span>
          </button>

          <p className="admin-nav-label" style={{marginTop: '20px'}}>SYSTEM</p>
          <button className={`admin-nav-item ${activeMenu === 'settings' ? 'active' : ''}`} onClick={() => setActiveMenu('settings')}>
            <Settings size={20} />
            <span>Pengaturan</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={onExit}>
            <LogOut size={20} />
            <span>Kembali ke Toko</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        {/* HEADER */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button className="admin-menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu size={24} color="#64748b" />
            </button>
            <div className="admin-search">
              <Search size={18} color="#94a3b8" />
              <input type="text" placeholder="Cari transaksi, produk, atau user..." />
            </div>
          </div>
          <div className="admin-topbar-right">
            <button className="admin-icon-btn">
              <Bell size={20} color="#64748b" />
              <span className="admin-badge">3</span>
            </button>
            <div className="admin-profile">
              <img src="https://ui-avatars.com/api/?name=Admin+Gamora&background=0f172a&color=fff" alt="Admin" />
              <div className="admin-profile-info">
                <span className="admin-profile-name">Super Admin</span>
                <span className="admin-profile-role">Owner</span>
              </div>
            </div>
          </div>
        </header>

        {/* DYNAMIC CONTENT */}
        <div className="admin-content-area">
          {activeMenu === 'dashboard' && (
            <>
              <div className="admin-page-header">
                <h1>Ringkasan Dashboard</h1>
                <p>Pantau performa penjualan dan transaksi harian toko Anda.</p>
              </div>

              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-icon bg-blue">
                    <DollarSign size={24} color="#3b82f6" />
                  </div>
                  <div className="admin-stat-details">
                    <p className="admin-stat-title">Total Pendapatan</p>
                    <h3 className="admin-stat-value">
                      {dashLoading ? '...' : `Rp ${dashStats.totalRevenue.toLocaleString('id-ID')}`}
                    </h3>
                    <p className={`admin-stat-trend ${dashStats.revenueTrend >= 0 ? 'positive' : 'negative'}`}>
                      {dashStats.revenueTrend >= 0
                        ? <><ArrowUpRight size={14} /> +{dashStats.revenueTrend}% bulan ini</>
                        : <><ArrowDownRight size={14} /> {dashStats.revenueTrend}% bulan ini</>
                      }
                    </p>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon bg-green">
                    <ShoppingCart size={24} color="#10b981" />
                  </div>
                  <div className="admin-stat-details">
                    <p className="admin-stat-title">Transaksi Sukses</p>
                    <h3 className="admin-stat-value">
                      {dashLoading ? '...' : dashStats.successTrx.toLocaleString('id-ID')}
                    </h3>
                    <p className="admin-stat-trend positive">
                      <ArrowUpRight size={14} /> {dashStats.thisMonthTrx || 0} bulan ini
                    </p>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon bg-orange">
                    <Users size={24} color="#f59e0b" />
                  </div>
                  <div className="admin-stat-details">
                    <p className="admin-stat-title">Total Pengguna</p>
                    <h3 className="admin-stat-value">
                      {dashLoading ? '...' : dashStats.totalUsers.toLocaleString('id-ID')}
                    </h3>
                    <p className="admin-stat-trend neutral">
                      {dashStats.totalProducts} produk aktif
                    </p>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon bg-purple">
                    <Activity size={24} color="#8b5cf6" />
                  </div>
                  <div className="admin-stat-details">
                    <p className="admin-stat-title">Pending / Promo Aktif</p>
                    <h3 className="admin-stat-value">
                      {dashLoading ? '...' : `${dashStats.pendingTrx} / ${dashStats.totalPromos}`}
                    </h3>
                    <p className="admin-stat-trend neutral">
                      Transaksi menunggu
                    </p>
                  </div>
                </div>
              </div>

              <div className="admin-table-container">
                <div className="admin-table-header">
                  <h2>Transaksi Terbaru</h2>
                  <button className="admin-btn-secondary" onClick={() => setActiveMenu('transactions')}>Lihat Semua</button>
                </div>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID Transaksi</th>
                        <th>Pengguna</th>
                        <th>Game / Item</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Waktu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allTransactions.slice(0, 5).length === 0 ? (
                        <tr><td colSpan={6} style={{textAlign:'center',padding:'24px',color:'#94a3b8'}}>Belum ada transaksi.</td></tr>
                      ) : allTransactions.slice(0, 5).map((trx) => (
                        <tr key={trx.id}>
                          <td style={{fontWeight:700,fontFamily:'monospace',fontSize:'0.82rem',color:'#6366f1'}}>{trx.id.slice(0,8).toUpperCase()}</td>
                          <td>{trx.profiles?.full_name || trx.profiles?.email?.split('@')[0] || 'User'}</td>
                          <td>{trx.game} — {trx.item_name}</td>
                          <td style={{fontWeight:700}}>Rp {Number(trx.price||0).toLocaleString('id-ID')}</td>
                          <td>
                            <span className={`admin-status-badge ${trx.status}`}>
                              {trx.status === 'success' ? 'Sukses' : trx.status === 'pending' ? 'Pending' : 'Gagal'}
                            </span>
                          </td>
                          <td style={{color:'#64748b',fontSize:'0.82rem'}}>
                            {new Date(trx.created_at).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeMenu === 'transactions' && (
            <>
              <div className="admin-page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
                <div>
                  <h1>Semua Transaksi</h1>
                  <p>Kelola dan pantau semua riwayat transaksi pengguna.</p>
                </div>
                <button
                  className="admin-add-btn"
                  onClick={exportTransactionsCsv}
                  style={{background:'linear-gradient(135deg,#10b981,#059669)',boxShadow:'0 4px 12px rgba(16,185,129,.35)'}}
                >
                  📥 Ekspor CSV
                </button>
              </div>

              {/* Stats strip */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:20}}>
                {[
                  { label:'Total Transaksi', val: allTransactions.length, color:'#6366f1' },
                  { label:'Sukses', val: allTransactions.filter(t=>t.status==='success').length, color:'#10b981' },
                  { label:'Pending', val: allTransactions.filter(t=>t.status==='pending').length, color:'#f59e0b' },
                  { label:'Gagal', val: allTransactions.filter(t=>t.status==='failed').length, color:'#ef4444' },
                  { label:'Total Nilai', val: 'Rp '+allTransactions.filter(t=>t.status==='success').reduce((s,t)=>s+Number(t.price||0),0).toLocaleString('id-ID'), color:'#0ea5e9' },
                ].map(s => (
                  <div key={s.label} style={{background:'#fff',borderRadius:14,padding:'14px 18px',border:'1px solid #e2e8f0',boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}>
                    <div style={{fontSize:'0.72rem',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:.5,marginBottom:4}}>{s.label}</div>
                    <div style={{fontSize:'1.2rem',fontWeight:800,color:s.color}}>{s.val}</div>
                  </div>
                ))}
              </div>

              <div className="admin-table-container">
                <div className="admin-table-header">
                  <div className="admin-search" style={{width:'100%',maxWidth:'400px'}}>
                    <Search size={18} color="#94a3b8" />
                    <input
                      type="text"
                      placeholder="Cari ID, user, atau game..."
                      value={trxSearch}
                      onChange={e => setTrxSearch(e.target.value)}
                    />
                  </div>
                  <span style={{fontSize:'0.82rem',color:'#94a3b8',fontWeight:600}}>
                    {trxLoading ? 'Memuat...' : `${allTransactions.length} transaksi`}
                  </span>
                </div>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID TRANSAKSI</th>
                        <th>PENGGUNA</th>
                        <th>GAME</th>
                        <th>ITEM</th>
                        <th>TOTAL</th>
                        <th>STATUS</th>
                        <th>WAKTU</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trxLoading ? (
                        <tr><td colSpan={7} style={{textAlign:'center',padding:'40px',color:'#94a3b8'}}>Memuat data...</td></tr>
                      ) : allTransactions.length === 0 ? (
                        <tr><td colSpan={7} style={{textAlign:'center',padding:'40px',color:'#94a3b8'}}>Belum ada transaksi dari pengguna manapun.</td></tr>
                      ) : allTransactions
                          .filter(t => {
                            if (!trxSearch) return true;
                            const q = trxSearch.toLowerCase();
                            return (
                              t.id?.toLowerCase().includes(q) ||
                              t.game?.toLowerCase().includes(q) ||
                              t.item_name?.toLowerCase().includes(q) ||
                              t.profiles?.email?.toLowerCase().includes(q) ||
                              t.profiles?.full_name?.toLowerCase().includes(q)
                            );
                          })
                          .map(trx => (
                          <tr key={trx.id}>
                            <td style={{fontWeight:700,fontFamily:'monospace',fontSize:'0.82rem',color:'#6366f1'}}>
                              {trx.id.slice(0,8).toUpperCase()}
                            </td>
                            <td>
                              <div style={{fontWeight:600,fontSize:'0.88rem',color:'#0f172a'}}>
                                {trx.profiles?.full_name || trx.profiles?.email?.split('@')[0] || 'User'}
                              </div>
                              <div style={{fontSize:'0.75rem',color:'#94a3b8'}}>{trx.profiles?.email || '-'}</div>
                            </td>
                            <td style={{fontWeight:600}}>{trx.game}</td>
                            <td style={{color:'#64748b',fontSize:'0.88rem'}}>{trx.item_name}</td>
                            <td style={{fontWeight:800,color:'#0f172a'}}>
                              Rp {Number(trx.price||0).toLocaleString('id-ID')}
                            </td>
                            <td>
                              <span className={`admin-status-badge ${trx.status}`}>
                                {trx.status === 'success' ? 'Sukses' : trx.status === 'pending' ? 'Pending' : 'Gagal'}
                              </span>
                            </td>
                            <td style={{fontSize:'0.82rem',color:'#64748b'}}>
                              {new Date(trx.created_at).toLocaleString('id-ID', {
                                day:'numeric', month:'short', year:'numeric',
                                hour:'2-digit', minute:'2-digit'
                              })}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeMenu === 'products' && (
            <>
              <div className="admin-page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <h1>Produk & Layanan</h1>
                  <p>Manajemen daftar game dan kategori produk.</p>
                </div>
                <button className="admin-btn-secondary" style={{background: '#4f46e5', color: 'white', border: 'none'}} onClick={() => setShowProductModal(true)}>
                  + Tambah Produk
                </button>
              </div>

              {showProductModal && (
                <div className="admin-modal-overlay" onClick={() => setShowProductModal(false)}>
                  <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
                    <div className="admin-modal-header">
                      <h3>Tambah Produk</h3>
                      <button className="admin-close-btn" onClick={() => setShowProductModal(false)}>&times;</button>
                    </div>
                    <form onSubmit={handleProductSubmit}>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Nama Game/Produk</label>
                        <input 
                          type="text" 
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                          className="admin-form-input"
                          placeholder="Cth: Mobile Legends"
                          required 
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Kategori</label>
                        <select 
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                          className="admin-form-select"
                        >
                          <option value="lagi-populer">🔥 Lagi Populer</option>
                          <option value="voucher">Voucher</option>
                          <option value="top-up-langsung">Top Up Langsung</option>
                        </select>
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Gambar Cover (Square)</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => setNewProduct({...newProduct, file: e.target.files[0]})}
                          className="admin-form-file"
                          required={!newProduct.file}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Gambar Banner Hero (Landscape - Opsional)</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => setNewProduct({...newProduct, bannerFile: e.target.files[0]})}
                          className="admin-form-file"
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Publisher</label>
                        <input 
                          type="text" 
                          value={newProduct.publisher}
                          onChange={(e) => setNewProduct({...newProduct, publisher: e.target.value})}
                          className="admin-form-input"
                          placeholder="Cth: Moonton, Tencent"
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Deskripsi Singkat (Hero)</label>
                        <input 
                          type="text" 
                          value={newProduct.hero_description}
                          onChange={(e) => setNewProduct({...newProduct, hero_description: e.target.value})}
                          className="admin-form-input"
                          placeholder="Cth: Top up murah, langsung masuk!"
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Deskripsi Lengkap (Cara Beli dll)</label>
                        <textarea 
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                          className="admin-form-input"
                          placeholder="Penjelasan produk dan cara top up..."
                          rows="4"
                        />
                      </div>
                      <label className="admin-form-checkbox-label">
                        <input 
                          type="checkbox" 
                          checked={newProduct.has_cashback}
                          onChange={(e) => setNewProduct({...newProduct, has_cashback: e.target.checked})}
                        />
                        Tampilkan label "CASHBACK"
                      </label>
                      <button 
                        type="submit" 
                        className="admin-btn-primary" 
                        disabled={uploadingProduct}
                      >
                        {uploadingProduct ? 'Menyimpan...' : 'Simpan Produk'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              <div className="admin-table-container">
                <div className="admin-table-header">
                  <div className="admin-search" style={{width: '100%', maxWidth: '400px'}}>
                    <Search size={18} color="#94a3b8" />
                    <input type="text" placeholder="Cari produk..." />
                  </div>
                </div>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Gambar</th>
                        <th>Nama Produk</th>
                        <th>Kategori</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length === 0 ? (
                        <tr>
                          <td colSpan="5">
                            <div className="admin-empty-state">
                              <div className="admin-empty-state-icon">
                                <Package size={32} />
                              </div>
                              <h4>Belum ada produk</h4>
                              <p>Silakan tambahkan produk baru melalui tombol di atas.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        products.map(p => (
                          <tr key={p.id}>
                            <td>
                              <img src={p.image_url} alt={p.name} className="admin-product-img" />
                            </td>
                            <td className="font-medium text-slate-700">{p.name}</td>
                            <td>{p.category === 'lagi-populer' ? '🔥 Populer' : p.category === 'voucher' ? 'Voucher' : 'Top Up Langsung'}</td>
                            <td>{p.has_cashback ? <span className="admin-status-badge success">Cashback</span> : <span className="admin-status-badge neutral">Reguler</span>}</td>
                            <td>
                              <button onClick={(e) => deleteProduct(p.id, e)} className="admin-action-delete">
                                <Trash2 size={16} /> Hapus
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeMenu === 'banners' && (
            <>
              <div className="admin-page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <h1>Banner Promosi</h1>
                  <p>Kelola banner yang tampil di halaman utama.</p>
                </div>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={uploadBanner} 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                    disabled={uploadingBanner}
                  />
                  <button className="admin-btn-secondary" style={{background: '#4f46e5', color: 'white', border: 'none'}} disabled={uploadingBanner}>
                    {uploadingBanner ? 'Mengupload...' : '+ Upload Banner'}
                  </button>
                </div>
              </div>
              <div className="admin-table-container">
                <div className="admin-table-wrapper" style={{ padding: '20px' }}>
                  {banners.length === 0 && !uploadingBanner ? (
                    <div style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>
                      <ImageIcon size={48} color="#cbd5e1" style={{margin: '0 auto 16px auto', display: 'block'}} />
                      <h3>Belum ada banner</h3>
                      <p>Silakan upload banner promosi pertama Anda.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                      {banners.map(banner => (
                        <div key={banner.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'white', position: 'relative' }}>
                          <img src={banner.image_url} alt="Banner" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                          <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(banner.created_at).toLocaleDateString('id-ID')}</span>
                            <button 
                              onClick={(e) => deleteBanner(banner.id, e)}
                              style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                            >
                              <Trash2 size={14} /> Hapus
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── PROMO MANAGEMENT ─────────────────────────────── */}
          {activeMenu === 'promos' && (
            <>
              <div className="admin-page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div>
                  <h1>Manajemen Promo</h1>
                  <p>Buat dan kelola kode promo untuk semua pengguna.</p>
                </div>
                <button className="admin-add-btn" onClick={() => setShowPromoModal(true)}>
                  <Plus size={16} /> + Tambah Promo
                </button>
              </div>

              {/* Promo Table */}
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>BANNER</th>
                      <th>KODE</th>
                      <th>JUDUL</th>
                      <th>DISKON</th>
                      <th>KATEGORI</th>
                      <th>BERLAKU S/D</th>
                      <th>STATUS</th>
                      <th>AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promos.length === 0 ? (
                      <tr><td colSpan={8} style={{textAlign:'center',padding:'40px',color:'#94a3b8'}}>Belum ada promo. Klik "+ Tambah Promo" untuk membuat.</td></tr>
                    ) : promos.map(promo => (
                      <tr key={promo.id}>
                        <td>
                          {promo.image_url
                            ? <img src={promo.image_url} alt={promo.title} style={{width:60,height:40,objectFit:'cover',borderRadius:8}} />
                            : <div style={{width:60,height:40,background:'#f1f5f9',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem'}}>🎁</div>
                          }
                        </td>
                        <td><code style={{background:'#f1f5f9',padding:'3px 8px',borderRadius:6,fontWeight:700,fontSize:'0.82rem'}}>{promo.code}</code></td>
                        <td style={{fontWeight:600}}>{promo.title}</td>
                        <td>
                          {promo.discount_type === 'percent'
                            ? <span style={{color:'#6366f1',fontWeight:700}}>{promo.discount_value}%</span>
                            : <span style={{color:'#10b981',fontWeight:700}}>Rp {Number(promo.discount_value).toLocaleString('id-ID')}</span>
                          }
                        </td>
                        <td><span style={{background:'#ede9fe',color:'#5b21b6',padding:'3px 10px',borderRadius:100,fontSize:'0.75rem',fontWeight:700}}>{promo.category}</span></td>
                        <td style={{fontSize:'0.82rem',color:'#64748b'}}>
                          {promo.expiry_date ? new Date(promo.expiry_date).toLocaleDateString('id-ID') : '∞ Tidak ada masa'}
                        </td>
                        <td>
                          <button
                            onClick={() => togglePromoActive(promo.id, promo.is_active)}
                            style={{
                              background: promo.is_active ? '#d1fae5' : '#fee2e2',
                              color: promo.is_active ? '#065f46' : '#b91c1c',
                              border:'none', borderRadius:100, padding:'4px 12px',
                              fontSize:'0.75rem', fontWeight:700, cursor:'pointer'
                            }}
                          >
                            {promo.is_active ? '✓ Aktif' : '✗ Nonaktif'}
                          </button>
                        </td>
                        <td>
                          <button
                            className="admin-delete-btn"
                            onClick={(e) => deletePromo(promo.id, e)}
                          >
                            <Trash2 size={14} /> Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Promo Modal */}
              {showPromoModal && (
                <div className="admin-modal-overlay" onClick={() => setShowPromoModal(false)}>
                  <div className="admin-modal" onClick={e => e.stopPropagation()} style={{maxWidth:560}}>
                    <div className="admin-modal-header">
                      <h2>Tambah Promo Baru</h2>
                      <button onClick={() => setShowPromoModal(false)} className="admin-modal-close">✕</button>
                    </div>
                    <form onSubmit={handlePromoSubmit} className="admin-modal-body">
                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label>Kode Promo *</label>
                          <input
                            type="text"
                            placeholder="CONTOH: HEMAT50"
                            value={newPromo.code}
                            onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})}
                            required
                            style={{textTransform:'uppercase',fontWeight:700,letterSpacing:1}}
                          />
                        </div>
                        <div className="admin-form-group">
                          <label>Kategori</label>
                          <select value={newPromo.category} onChange={e => setNewPromo({...newPromo, category: e.target.value})}>
                            {['Diskon','Cashback','Game Spesifik','Pengguna Baru','Flash Sale'].map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="admin-form-group">
                        <label>Judul Promo *</label>
                        <input
                          type="text"
                          placeholder="Contoh: Diskon 20% untuk semua top-up"
                          value={newPromo.title}
                          onChange={e => setNewPromo({...newPromo, title: e.target.value})}
                          required
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Deskripsi</label>
                        <textarea
                          placeholder="Penjelasan singkat tentang promo ini..."
                          value={newPromo.description}
                          onChange={e => setNewPromo({...newPromo, description: e.target.value})}
                          rows={2}
                          style={{width:'100%',padding:'10px',borderRadius:8,border:'1.5px solid #e2e8f0',resize:'vertical',fontFamily:'inherit'}}
                        />
                      </div>
                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label>Tipe Diskon</label>
                          <select value={newPromo.discount_type} onChange={e => setNewPromo({...newPromo, discount_type: e.target.value})}>
                            <option value="percent">Persen (%)</option>
                            <option value="nominal">Nominal (Rp)</option>
                          </select>
                        </div>
                        <div className="admin-form-group">
                          <label>Nilai Diskon</label>
                          <input
                            type="number"
                            min={0}
                            placeholder={newPromo.discount_type === 'percent' ? 'Contoh: 20' : 'Contoh: 10000'}
                            value={newPromo.discount_value}
                            onChange={e => setNewPromo({...newPromo, discount_value: e.target.value})}
                          />
                        </div>
                        <div className="admin-form-group">
                          <label>Berlaku Sampai</label>
                          <input
                            type="date"
                            value={newPromo.expiry_date}
                            onChange={e => setNewPromo({...newPromo, expiry_date: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="admin-form-group">
                        <label>Banner Promo (opsional)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => setNewPromo({...newPromo, file: e.target.files[0]})}
                        />
                        <span style={{fontSize:'0.75rem',color:'#94a3b8'}}>Gambar yang ditampilkan di halaman promo</span>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
                        <input
                          type="checkbox"
                          id="promo_active"
                          checked={newPromo.is_active}
                          onChange={e => setNewPromo({...newPromo, is_active: e.target.checked})}
                        />
                        <label htmlFor="promo_active" style={{fontWeight:600,fontSize:'0.88rem'}}>Aktifkan promo sekarang</label>
                      </div>
                      <div className="admin-modal-footer">
                        <button type="button" onClick={() => setShowPromoModal(false)} className="admin-btn-secondary">Batal</button>
                        <button type="submit" className="admin-btn-primary" disabled={uploadingPromo}>
                          {uploadingPromo ? 'Menyimpan...' : 'Simpan Promo'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}

          {activeMenu === 'users' && (
            <>
              <div className="admin-page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
                <div>
                  <h1>Manajemen Pengguna</h1>
                  <p>Kelola data pelanggan yang terdaftar di Gamora Store.</p>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{background:'#ede9fe',color:'#5b21b6',padding:'6px 16px',borderRadius:100,fontSize:'0.82rem',fontWeight:800}}>
                    👥 {users.length} Total User
                  </span>
                </div>
              </div>

              {/* Stats strip */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:20}}>
                {[
                  { label:'Total User', val: users.length, color:'#6366f1', icon:'👥' },
                  { label:'Punya Coins', val: users.filter(u=>u.coins>0).length, color:'#f59e0b', icon:'⭐' },
                  { label:'Bergabung Hari Ini', val: users.filter(u=>{
                    const d = new Date(u.created_at);
                    const now = new Date();
                    return d.toDateString() === now.toDateString();
                  }).length, color:'#10b981', icon:'🆕' },
                  { label:'Total Coins Beredar', val: users.reduce((s,u)=>s+(u.coins||0),0).toLocaleString('id-ID'), color:'#0ea5e9', icon:'💰' },
                ].map(s => (
                  <div key={s.label} style={{background:'#fff',borderRadius:14,padding:'14px 18px',border:'1px solid #e2e8f0',boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}>
                    <div style={{fontSize:'0.72rem',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:.5,marginBottom:4}}>
                      {s.icon} {s.label}
                    </div>
                    <div style={{fontSize:'1.2rem',fontWeight:800,color:s.color}}>{s.val}</div>
                  </div>
                ))}
              </div>

              <div className="admin-table-container">
                <div className="admin-table-header">
                  <div className="admin-search" style={{width:'100%',maxWidth:'400px'}}>
                    <Search size={18} color="#94a3b8" />
                    <input
                      type="text"
                      placeholder="Cari nama atau email..."
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                    />
                  </div>
                  <span style={{fontSize:'0.82rem',color:'#94a3b8',fontWeight:600}}>
                    {usersLoading ? 'Memuat...' : `${users.length} pengguna`}
                  </span>
                </div>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>PENGGUNA</th>
                        <th>EMAIL</th>
                        <th>PROVIDER TERLINK</th>
                        <th>TRANSAKSI</th>
                        <th>COINS</th>
                        <th>BERGABUNG</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersLoading ? (
                        <tr><td colSpan={7} style={{textAlign:'center',padding:'40px',color:'#94a3b8'}}>Memuat data...</td></tr>
                      ) : users.length === 0 ? (
                        <tr><td colSpan={7} style={{textAlign:'center',padding:'40px',color:'#94a3b8'}}>Belum ada pengguna terdaftar.</td></tr>
                      ) : users
                          .filter(u => {
                            if (!userSearch) return true;
                            const q = userSearch.toLowerCase();
                            return (
                              u.full_name?.toLowerCase().includes(q) ||
                              u.email?.toLowerCase().includes(q)
                            );
                          })
                          .map(u => {
                            const providerIcons = {
                              google:   { icon: 'G', bg: '#ea4335', label: 'Google' },
                              facebook: { icon: 'f', bg: '#1877f2', label: 'Facebook' },
                              twitter:  { icon: 'X', bg: '#000',    label: 'X' },
                              apple:    { icon: '', bg: '#000',    label: 'Apple' },
                              line:     { icon: 'L', bg: '#06c755', label: 'LINE' },
                              email:    { icon: '@', bg: '#6366f1', label: 'Email' },
                            };
                            const providers = u.providers || [];
                            return (
                              <tr key={u.id}>
                                <td>
                                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                                    <img
                                      src={u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name||u.email||'U')}&background=6366f1&color=fff&size=40`}
                                      alt="avatar"
                                      style={{width:36,height:36,borderRadius:'50%',objectFit:'cover',border:'2px solid #e2e8f0',flexShrink:0}}
                                    />
                                    <div>
                                      <div style={{fontWeight:700,fontSize:'0.88rem',color:'#0f172a'}}>
                                        {u.full_name || u.email?.split('@')[0] || 'Pengguna'}
                                      </div>
                                      {u.phone && <div style={{fontSize:'0.72rem',color:'#94a3b8'}}>{u.phone}</div>}
                                    </div>
                                  </div>
                                </td>
                                <td style={{color:'#64748b',fontSize:'0.85rem'}}>{u.email || '-'}</td>
                                <td>
                                  <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                                    {providers.length === 0 ? (
                                      <span style={{fontSize:'0.75rem',color:'#94a3b8'}}>—</span>
                                    ) : providers.map(p => {
                                      const pInfo = providerIcons[p] || { icon: p[0]?.toUpperCase(), bg: '#6366f1', label: p };
                                      return (
                                        <span key={p} title={pInfo.label} style={{
                                          display:'inline-flex',alignItems:'center',justifyContent:'center',
                                          width:26,height:26,borderRadius:'50%',
                                          background:pInfo.bg,color:'#fff',
                                          fontSize:'0.7rem',fontWeight:900,
                                          boxShadow:'0 2px 6px rgba(0,0,0,.2)',
                                          cursor:'default',flexShrink:0
                                        }}>
                                          {pInfo.icon}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </td>
                                <td>
                                  <div style={{fontWeight:700,color:'#0f172a',fontSize:'0.88rem'}}>{u.trxTotal}</div>
                                  <div style={{fontSize:'0.72rem',color:'#22c55e',fontWeight:600}}>{u.trxSuccess} sukses</div>
                                </td>
                                <td>
                                  <span style={{
                                    background: u.coins > 0 ? '#fef3c7' : '#f1f5f9',
                                    color: u.coins > 0 ? '#92400e' : '#94a3b8',
                                    padding:'3px 10px',borderRadius:100,
                                    fontSize:'0.78rem',fontWeight:700
                                  }}>
                                    ⭐ {(u.coins||0).toLocaleString('id-ID')}
                                  </span>
                                </td>
                                <td style={{color:'#64748b',fontSize:'0.82rem'}}>
                                  {new Date(u.created_at).toLocaleDateString('id-ID',{
                                    day:'numeric',month:'short',year:'numeric'
                                  })}
                                </td>
                                <td>
                                  <span style={{
                                    background:'#d1fae5',color:'#065f46',
                                    padding:'3px 10px',borderRadius:100,
                                    fontSize:'0.75rem',fontWeight:700
                                  }}>
                                    ✓ Aktif
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeMenu === 'settings' && (
            <>
              <div className="admin-page-header">
                <h1>Pengaturan Sistem</h1>
                <p>Konfigurasi website, metode pembayaran, dan API.</p>
              </div>
              <div className="admin-table-container" style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>
                <Settings size={48} color="#cbd5e1" style={{margin: '0 auto 16px auto', display: 'block'}} />
                <h3>Konfigurasi Terkunci</h3>
                <p>Hanya Super Admin tingkat server yang dapat mengubah konfigurasi ini.</p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
