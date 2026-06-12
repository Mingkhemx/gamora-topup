import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, Shield, Clock, CreditCard, Zap, ChevronDown, ChevronUp, Plus, Minus, Phone, ShoppingCart } from 'lucide-react';
import './ProductDetail.css';
import { supabase } from './supabaseClient';
import { toast } from './AlertSystem.jsx';

// ── Paket default per game (fallback kalau belum ada di Supabase) ─
const defaultPackages = {
  'mobile legends': [
    { id: 1,  name: '5 (+1) Diamonds',    price: 1428,    label: '' },
    { id: 2,  name: '12 (+2) Diamonds',   price: 3000,    label: '' },
    { id: 3,  name: '19 (+5) Diamonds',   price: 4999,    label: '' },
    { id: 4,  name: '28 (+7) Diamonds',   price: 7000,    label: '' },
    { id: 5,  name: '55 (+10) Diamonds',  price: 13999,   label: '' },
    { id: 6,  name: '86 (+20) Diamonds',  price: 20000,   label: '🔥 Populer' },
    { id: 7,  name: '172 (+35) Diamonds', price: 40000,   label: '' },
    { id: 8,  name: '257 (+55) Diamonds', price: 60000,   label: '' },
    { id: 9,  name: '344 (+70) Diamonds', price: 79999,   label: '' },
    { id: 10, name: '429 (+86) Diamonds', price: 99000,   label: '' },
    { id: 11, name: '514 (+103) Diamonds',price: 120000,  label: '' },
    { id: 12, name: '600 (+120) Diamonds',price: 139000,  label: '💎 Best Value' },
    { id: 13, name: '706 (+141) Diamonds',price: 163000,  label: '' },
    { id: 14, name: '878 (+176) Diamonds',price: 203000,  label: '' },
    { id: 15, name: '1050 (+210) Diamonds',price: 242000, label: '' },
    { id: 16, name: '2195 (+439) Diamonds',price: 507000, label: '' },
    { id: 17, name: '4829 (+966) Diamonds',price: 1117000,label: '' },
    { id: 18, name: 'Weekly Diamond Pass', price: 21500,  label: '✨ Special' },
    { id: 19, name: 'Twilight Pass',        price: 115000, label: '✨ Special' },
  ],
  'free fire': [
    { id: 1,  name: '5 Diamonds',    price: 1000,  label: '' },
    { id: 2,  name: '12 Diamonds',   price: 2400,  label: '' },
    { id: 3,  name: '50 Diamonds',   price: 9999,  label: '' },
    { id: 4,  name: '70 Diamonds',   price: 13999, label: '🔥 Populer' },
    { id: 5,  name: '140 Diamonds',  price: 27999, label: '' },
    { id: 6,  name: '355 Diamonds',  price: 69999, label: '💎 Best Value' },
    { id: 7,  name: '720 Diamonds',  price: 139999,label: '' },
    { id: 8,  name: '1450 Diamonds', price: 279999,label: '' },
    { id: 9,  name: 'Weekly Membership', price: 29999, label: '✨ Special' },
    { id: 10, name: 'Monthly Membership', price: 109999, label: '✨ Special' },
  ],
  'genshin impact': [
    { id: 1,  name: '60 Genesis Crystals',   price: 15000,  label: '' },
    { id: 2,  name: '300 Genesis Crystals',  price: 75000,  label: '🔥 Populer' },
    { id: 3,  name: '980 Genesis Crystals',  price: 240000, label: '💎 Best Value' },
    { id: 4,  name: '1980 Genesis Crystals', price: 480000, label: '' },
    { id: 5,  name: '3280 Genesis Crystals', price: 780000, label: '' },
    { id: 6,  name: '6480 Genesis Crystals', price: 1560000,label: '' },
    { id: 7,  name: 'Blessing of Welkin Moon', price: 79000, label: '✨ Special' },
    { id: 8,  name: 'Gnostic Hymn',           price: 390000, label: '✨ Special' },
  ],
  'pubg mobile': [
    { id: 1,  name: '60 UC',    price: 14999, label: '' },
    { id: 2,  name: '120 UC',   price: 29999, label: '' },
    { id: 3,  name: '325 UC',   price: 79999, label: '🔥 Populer' },
    { id: 4,  name: '660 UC',   price: 159999,label: '💎 Best Value' },
    { id: 5,  name: '1800 UC',  price: 399999,label: '' },
    { id: 6,  name: '3850 UC',  price: 849999,label: '' },
    { id: 7,  name: 'Royal Pass M-Tier', price: 149999, label: '✨ Special' },
    { id: 8,  name: 'Royal Pass A-Tier', price: 299999, label: '✨ Special' },
  ],
  'honkai star rail': [
    { id: 1, name: '60 Oneiric Shard',   price: 15000,  label: '' },
    { id: 2, name: '300 Oneiric Shard',  price: 75000,  label: '🔥 Populer' },
    { id: 3, name: '980 Oneiric Shard',  price: 240000, label: '💎 Best Value' },
    { id: 4, name: '1980 Oneiric Shard', price: 480000, label: '' },
    { id: 5, name: '3280 Oneiric Shard', price: 780000, label: '' },
    { id: 6, name: 'Express Supply Pass', price: 79000, label: '✨ Special' },
  ],
  'valorant': [
    { id: 1,  name: '475 VP',   price: 65000,  label: '' },
    { id: 2,  name: '1000 VP',  price: 130000, label: '🔥 Populer' },
    { id: 3,  name: '2050 VP',  price: 260000, label: '💎 Best Value' },
    { id: 4,  name: '3650 VP',  price: 455000, label: '' },
    { id: 5,  name: '5350 VP',  price: 650000, label: '' },
    { id: 6,  name: '11000 VP', price: 1300000,label: '' },
  ],
  'clash of clans': [
    { id: 1,  name: '80 Gems',   price: 14000,  label: '' },
    { id: 2,  name: '500 Gems',  price: 79000,  label: '🔥 Populer' },
    { id: 3,  name: '1200 Gems', price: 159000, label: '💎 Best Value' },
    { id: 4,  name: '2500 Gems', price: 319000, label: '' },
    { id: 5,  name: '6500 Gems', price: 799000, label: '' },
    { id: 6,  name: '14000 Gems',price: 1599000,label: '' },
  ],
};

// Ambil paket berdasarkan nama game (case-insensitive)
function getDefaultPackages(gameName) {
  if (!gameName) return [];
  const key = gameName.toLowerCase();
  // Cari exact match dulu
  if (defaultPackages[key]) return defaultPackages[key];
  // Cari partial match
  for (const k of Object.keys(defaultPackages)) {
    if (key.includes(k) || k.includes(key)) return defaultPackages[k];
  }
  return [];
}

const faqItems = [
  { q: 'Bagaimana cara melakukan top up?', a: 'Masukkan ID dan Server game, pilih nominal yang diinginkan, pilih metode pembayaran, dan klik Beli Sekarang.' },
  { q: 'Metode pembayaran apa yang tersedia?', a: 'Kami menerima QRIS, E-Wallet (GoPay, OVO, Dana, ShopeePay, LinkAja), Virtual Account (BCA, BNI, BRI, Mandiri, Permata), dan Minimarket (Alfamart, Indomaret).' },
  { q: 'Berapa lama proses top up?', a: 'Item akan masuk ke akun Anda dalam 1-5 detik setelah pembayaran dikonfirmasi.' },
  { q: 'Apakah top up di sini aman?', a: 'Ya, 100% aman. Kami adalah mitra resmi dari berbagai publisher game.' },
];

export default function ProductDetail({ productId, onBack, onAddToCart, onAddTransaction, userId: propUserId, onBuyNow, currentCoins, onCoinsChange }) {
  const [userId, setUserId] = useState('');
  const [server, setServer] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [qty, setQty] = useState(1);
  const [promoCode, setPromoCode] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('coinpedia');
  const [whatsapp, setWhatsapp] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [openPaymentGroup, setOpenPaymentGroup] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyProcessing, setBuyProcessing] = useState(false);
  const [buySuccess, setBuySuccess] = useState(false);
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();
        if (error) throw error;
        setProduct(data);

        // Coba fetch paket dari Supabase dulu
        const { data: pkgData } = await supabase
          .from('product_packages')
          .select('*')
          .eq('product_id', productId)
          .order('sort_order', { ascending: true });

        if (pkgData && pkgData.length > 0) {
          // Pakai data dari Supabase (admin sudah set custom packages)
          setPackages(pkgData.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            label: p.label || '',
            icon_url: p.icon_url || null,
          })));
        } else {
          // Fallback ke paket default berdasarkan nama game
          setPackages(getDefaultPackages(data?.name));
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const totalPrice = selectedPackage
    ? `Rp ${(selectedPackage.price * qty).toLocaleString('id-ID')}`
    : null;

  return (
    <div className="pd-root">
      {/* HERO BANNER */}
      <div 
        className="pd-hero"
        style={product?.banner_url ? {
          backgroundImage: `url(${product.banner_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : {}}
      >
        {!product?.banner_url && (
          <>
            <div className="pd-hero-overlay" />
            <div className="pd-hero-content">
              <div className="pd-hero-text">
                <p className="pd-topup-label">Top up</p>
                <h1 className="pd-hero-title">{product?.name || 'Loading...'}</h1>
                <p className="pd-hero-desc">
                  {product?.hero_description || 'Top up game favoritmu lebih cepat lebih akurat meskipun event berlangsung'}
                </p>
                <button className="pd-hero-btn">Beli Sekarang!</button>
              </div>
              <div className="pd-hero-art">
                <img src={product?.image_url || "/mlbb.png"} alt={product?.name || 'Hero'} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* GAME INFO BAR */}
      <div className="pd-info-bar">
        <div className="pd-info-left">
          <div className="pd-game-thumb">
            <img src={product?.image_url || "/mlbb.png"} alt={product?.name || 'Game'} />
          </div>
          <div className="pd-game-meta">
            <h2 className="pd-game-name">{product?.name?.toUpperCase() || 'LOADING...'}</h2>
            <p className="pd-game-publisher">{product?.publisher || 'Publisher'}</p>
            <div className="pd-game-badges">
              <span className="pd-badge"><Zap size={12} color="#f0c000" /> Proses Cepat</span>
              <span className="pd-badge"><MessageCircle size={12} color="#4fc3f7" /> Layanan Chat 24/7</span>
              <span className="pd-badge"><Shield size={12} color="#69f0ae" /> Pembayaran Aman</span>
            </div>
          </div>
        </div>
      </div>

      {/* GUARANTEE BAR */}
      <div className="pd-guarantee-bar">
        <div className="pd-guarantee-item"><Shield size={14} /> Jaminan Layanan</div>
        <div className="pd-guarantee-item"><Clock size={14} /> Jaminan Layanan 24 Jam</div>
        <div className="pd-guarantee-item"><CreditCard size={14} /> Pembayaran Aman &amp; Terpercaya</div>
        <div className="pd-guarantee-item"><Zap size={14} /> Proses Cepat &amp; Otomatis</div>
      </div>

      {/* MAIN CONTENT */}
      <div className="pd-main">
        {/* LEFT: STEPS */}
        <div className="pd-steps">

          {/* STEP 1: Data Akun */}
          <div className="pd-step-card">
            <div className="pd-step-header">
              <span className="pd-step-num">1</span>
              <span className="pd-step-title">Masukkan Data Akun</span>
            </div>
            <div className="pd-form-row">
              <div className="pd-form-group">
                <label>ID</label>
                <input
                  type="text"
                  placeholder="Masukkan ID"
                  value={userId}
                  onChange={e => setUserId(e.target.value)}
                  className="pd-input"
                />
              </div>
              <div className="pd-form-group">
                <label>Server</label>
                <input
                  type="text"
                  placeholder="Masukkan Server"
                  value={server}
                  onChange={e => setServer(e.target.value)}
                  className="pd-input"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: Nominal */}
          <div className="pd-step-card">
            <div className="pd-step-header">
              <span className="pd-step-num">2</span>
              <span className="pd-step-title">Pilih Nominal</span>
            </div>
            <div className="pd-packages-grid">
              {packages.length === 0 ? (
                <div style={{gridColumn:'1/-1',textAlign:'center',padding:'24px',color:'#94a3b8'}}>
                  Belum ada paket tersedia.
                </div>
              ) : packages.map(pkg => (
                <div
                  key={pkg.id}
                  className={`pd-pkg-card ${selectedPackage?.id === pkg.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  {pkg.label && <span className="pd-pkg-label">{pkg.label}</span>}
                  <div className="pd-pkg-icon">
                    {pkg.icon_url
                      ? <img src={pkg.icon_url} alt={pkg.name} style={{width:32,height:32,objectFit:'contain'}} />
                      : <span>💎</span>
                    }
                  </div>
                  <div className="pd-pkg-diamonds">{pkg.name}</div>
                  <div className="pd-pkg-price">Rp {Number(pkg.price).toLocaleString('id-ID')}</div>
                  <button className="pd-pkg-btn">
                    <ShoppingCart size={12} /> Tambah
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 3: Jumlah */}
          <div className="pd-step-card">
            <div className="pd-step-header">
              <span className="pd-step-num">3</span>
              <span className="pd-step-title">Masukkan Jumlah Pembelian</span>
            </div>
            <div className="pd-qty-row">
              <input
                type="number"
                value={qty}
                onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="pd-input pd-qty-input"
                min="1"
              />
              <button className="pd-qty-btn" onClick={() => setQty(q => q + 1)}><Plus size={16} /></button>
              <button className="pd-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}><Minus size={16} /></button>
            </div>
          </div>

          {/* STEP 4: Promo */}
          <div className="pd-step-card">
            <div className="pd-step-header">
              <span className="pd-step-num">4</span>
              <span className="pd-step-title">Kode Promo</span>
            </div>
            <div className="pd-promo-row">
              <input
                type="text"
                placeholder="Ketik Kode Promo Kamu"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
                className="pd-input pd-promo-input"
              />
              <button className="pd-promo-btn">Gunakan</button>
            </div>
            <button className="pd-promo-avail">🏷️ Pakai Promo Yang Tersedia</button>
          </div>

          {/* STEP 5: Pembayaran */}
          <div className="pd-step-card">
            <div className="pd-step-header">
              <span className="pd-step-num">5</span>
              <span className="pd-step-title">Pilih Pembayaran</span>
            </div>
            <div className="pd-payment-list">
              {/* Coinpedia */}
              <div
                className={`pd-payment-item ${selectedPayment === 'coinpedia' ? 'selected' : ''}`}
                onClick={() => setSelectedPayment('coinpedia')}
              >
                <div className="pd-payment-left">
                  <div className="pd-pay-icon">🪙</div>
                  <div className="pd-pay-info">
                    <span className="pd-pay-name">Coinpedia</span>
                    <span className="pd-pay-desc">Promo: 0,00 → 0pt per rp1</span>
                  </div>
                </div>
                <span className="pd-pay-best">BEST PAY!</span>
              </div>
              {/* QRIS */}
              <div
                className={`pd-payment-item ${selectedPayment === 'qris' ? 'selected' : ''}`}
                onClick={() => setSelectedPayment('qris')}
              >
                <div className="pd-payment-left">
                  <div className="pd-pay-icon">
                    <img src="/payment/qris.png" alt="QRIS" />
                  </div>
                  <div className="pd-pay-info">
                    <span className="pd-pay-name">QRIS (All Payment Method)</span>
                    <span className="pd-pay-desc">Harga: Flat Price</span>
                  </div>
                </div>
                <span className="pd-pay-flat">FLAT PRICE</span>
              </div>
              {/* E-Wallet */}
              <div
                className="pd-payment-group"
                onClick={() => setOpenPaymentGroup(openPaymentGroup === 'ewallet' ? null : 'ewallet')}
              >
                <span className="pd-pay-group-name">E-Wallet</span>
                {openPaymentGroup === 'ewallet' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {openPaymentGroup === 'ewallet' && (
                <div className="pd-pay-sub-list">
                  {['GoPay', 'OVO', 'Dana', 'LinkAja', 'ShopeePay'].map(m => (
                    <div key={m} className={`pd-payment-item ${selectedPayment === m ? 'selected' : ''}`} onClick={() => setSelectedPayment(m)}>
                      <div className="pd-payment-left">
                        <div className="pd-pay-icon">
                          <img src={`/payment/${m === 'ShopeePay' ? 'shopepay' : m.toLowerCase().replace(' ', '')}.png`} alt={m} />
                        </div>
                        <span className="pd-pay-name">{m}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Virtual Account */}
              <div
                className="pd-payment-group"
                onClick={() => setOpenPaymentGroup(openPaymentGroup === 'va' ? null : 'va')}
              >
                <span className="pd-pay-group-name">Virtual Account</span>
                {openPaymentGroup === 'va' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {openPaymentGroup === 'va' && (
                <div className="pd-pay-sub-list">
                  {['BCA', 'Mandiri', 'BNI', 'BRI', 'Permata'].map(m => (
                    <div key={m} className={`pd-payment-item ${selectedPayment === m ? 'selected' : ''}`} onClick={() => setSelectedPayment(m)}>
                      <div className="pd-payment-left">
                        <div className="pd-pay-icon">
                          <img src={`/payment/${m.toLowerCase()}.png`} alt={m} />
                        </div>
                        <span className="pd-pay-name">VA {m}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Convenience Store */}
              <div
                className="pd-payment-group"
                onClick={() => setOpenPaymentGroup(openPaymentGroup === 'cs' ? null : 'cs')}
              >
                <span className="pd-pay-group-name">Convenience Store</span>
                {openPaymentGroup === 'cs' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {openPaymentGroup === 'cs' && (
                <div className="pd-pay-sub-list">
                  {['Alfamart', 'Indomaret'].map(m => (
                    <div key={m} className={`pd-payment-item ${selectedPayment === m ? 'selected' : ''}`} onClick={() => setSelectedPayment(m)}>
                      <div className="pd-payment-left">
                        <div className="pd-pay-icon">
                          <img src={`/payment/${m.toLowerCase()}.png`} alt={m} />
                        </div>
                        <span className="pd-pay-name">{m}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* STEP 6: Detail Kontak */}
          <div className="pd-step-card">
            <div className="pd-step-header">
              <span className="pd-step-num">6</span>
              <span className="pd-step-title">Detail Kontak</span>
            </div>
            <div className="pd-form-group">
              <label>No. WhatsApp</label>
              <div className="pd-wa-input-row">
                <div className="pd-wa-flag">🇮🇩 +62</div>
                <input
                  type="text"
                  placeholder="Masukkan Server"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  className="pd-input pd-wa-input"
                />
              </div>
              <p className="pd-input-note">*Nomor ini akan WhatsApp/telepon kita jika masalah</p>
              <div className="pd-wa-tip">
                ℹ️ Pastikan nomor WhatsApp benar, agar kami bisa menghubungi jika transaksi bermasalah. Tulis tanpa angka 0 di depan. Contoh: 8xxxxxxx
              </div>
            </div>
          </div>

          {/* DESKRIPSI */}
          <div className="pd-desc-card">
            <h3 className="pd-desc-title">Deskripsi {product?.name || 'Game'}</h3>
            <p className="pd-desc-text" style={{whiteSpace: 'pre-line'}}>
              {product?.description || `Gamora mempersembahkan penawaran istimewa untuk para gamers sejati! Kami hadir dengan layanan Top Up resmi dan 100% legal untuk ${product?.name || 'Game ini'}.
              
              Top Up ${product?.name || 'Game'}, Aman, Murah, & Terpercaya.
              Berikut adalah langkah-langkah sederhana untuk Top Up:
              1. Masukkan Data Akun (Pastikan data yang Anda masukkan sudah benar dan lengkap)
              2. Pilih Nominal (Kami menyediakan berbagai pilihan nominal)
              3. Pilih Metode Pembayaran (Kenyamanan Anda adalah prioritas kami)
              4. Masukkan Kode Promo Jika Ada
              5. Masukkan Nomor WhatsApp yang Valid
              6. Klik Beli Sekarang & Lakukan Pembayaran
              7. Item Akan Masuk Otomatis ke Akun Anda`}
            </p>
          </div>

          {/* FAQ */}
          <div className="pd-faq-section">
            <h3 className="pd-faq-heading">Kamu Punya Pertanyaan?</h3>
            {faqItems.map((item, i) => (
              <div className="pd-faq-item" key={i}>
                <div className="pd-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{item.q}</span>
                  {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {openFaq === i && <div className="pd-faq-a">{item.a}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: SIDEBAR */}
        <div className="pd-sidebar">
          {/* Rating */}
          <div className="pd-sidebar-card">
            <p className="pd-rating-label">Ulasan dan rating:</p>
            <div className="pd-rating-row">
              <span className="pd-rating-score">4.99</span>
              <div className="pd-stars">
                {[1,2,3,4,5].map(s => <Star key={s} size={22} fill="#f0c000" color="#f0c000" />)}
              </div>
            </div>
            <p className="pd-rating-count">Berdasarkan total 21.72jt rating</p>
          </div>

          {/* Butuh Bantuan */}
          <div className="pd-sidebar-card pd-bantuan-card">
            <div className="pd-bantuan-row">
              <MessageCircle size={22} color="#f0c000" />
              <div>
                <p className="pd-bantuan-title">Butuh Bantuan?</p>
                <p className="pd-bantuan-sub">Kamu bisa hubungi admin disini.</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="pd-sidebar-card pd-order-summary">
            {selectedPackage ? (
              <div className="pd-order-detail">
                <div className="pd-order-row">
                  <span className="pd-order-label">Produk</span>
                  <span className="pd-order-val">{selectedPackage.name}</span>
                </div>
                <div className="pd-order-row">
                  <span className="pd-order-label">Qty</span>
                  <span className="pd-order-val">x{qty}</span>
                </div>
                <div className="pd-order-divider" />
                <div className="pd-order-row pd-order-total">
                  <span>Total</span>
                  <span>{totalPrice}</span>
                </div>
              </div>
            ) : (
              <p className="pd-order-empty">Belum ada item produk yang dipilih.</p>
            )}
            {/* Success state */}
            {buySuccess && (
              <div style={{
                background:'#d1fae5', border:'1.5px solid #6ee7b7',
                borderRadius:14, padding:'16px', textAlign:'center',
                marginBottom:12
              }}>
                <div style={{fontSize:'2rem',marginBottom:8}}>✅</div>
                <div style={{fontWeight:800,color:'#065f46',fontSize:'0.95rem'}}>
                  Pembayaran Berhasil!
                </div>
                <div style={{fontSize:'0.8rem',color:'#047857',marginTop:4}}>
                  {selectedPackage?.diamonds} akan masuk ke akun dalam 1–5 detik.
                </div>
                <button
                  onClick={() => { setBuySuccess(false); setSelectedPackage(null); setUserId(''); }}
                  style={{
                    marginTop:12, padding:'7px 20px',
                    background:'#059669', color:'#fff',
                    border:'none', borderRadius:8,
                    fontWeight:700, fontSize:'0.82rem',
                    cursor:'pointer', fontFamily:'inherit'
                  }}
                >
                  Beli Lagi
                </button>
              </div>
            )}

            <div className="pd-order-actions">
              <button
                className="pd-cart-btn"
                disabled={!selectedPackage || buySuccess}
                onClick={() => {
                  if (!userId.trim()) {
                    toast.warning('⚠ Masukkan ID akun Game terlebih dahulu!');
                    document.querySelector('.pd-input[placeholder="Masukkan ID"]')?.focus();
                    return;
                  }
                  if (!server.trim()) {
                    toast.warning('⚠ Masukkan Server terlebih dahulu!');
                    document.querySelector('.pd-input[placeholder="Masukkan Server"]')?.focus();
                    return;
                  }
                  if (!selectedPackage) return toast.warning('Pilih nominal terlebih dahulu.');
                  onAddToCart({
                    id: Date.now(),
                    game: product?.name || 'Game',
                    package: selectedPackage.name,
                    qty: qty,
                    price: `Rp ${Number(selectedPackage.price).toLocaleString('id-ID')}`,
                    totalPrice: totalPrice,
                    image: product?.image_url || '/mlbb.png'
                  });
                  toast.success('Berhasil ditambahkan ke keranjang!');
                }}
              >
                🛒 Masukkan Keranjang
              </button>
              <button
                className="pd-order-btn"
                disabled={!selectedPackage || !selectedPayment || buyProcessing}
                onClick={async () => {
                  if (!selectedPackage) return toast.warning('Pilih nominal terlebih dahulu.');
                  if (!userId.trim()) {
                    toast.warning('⚠ Masukkan ID akun Game terlebih dahulu!');
                    document.querySelector('.pd-input[placeholder="Masukkan ID"]')?.focus();
                    return;
                  }
                  if (!server.trim()) {
                    toast.warning('⚠ Masukkan Server terlebih dahulu!');
                    document.querySelector('.pd-input[placeholder="Masukkan Server"]')?.focus();
                    return;
                  }
                  if (!selectedPayment) return toast.warning('Pilih metode pembayaran terlebih dahulu.');
                  
                  const totalPriceNum = selectedPackage.price * qty;
                  if (selectedPayment === 'coinpedia') {
                    if (currentCoins < totalPriceNum) {
                      return toast.error('Koin Gamora Anda tidak mencukupi untuk pembelian ini!');
                    }
                  }

                  setBuyProcessing(true);
                  try {
                    // Simulasi proses 1.5 detik
                    await new Promise(r => setTimeout(r, 1500));
                    
                    // Kurangi koin jika pakai coinpedia
                    if (selectedPayment === 'coinpedia' && onCoinsChange) {
                      await onCoinsChange(-totalPriceNum);
                    }

                    // Simpan transaksi ke Supabase
                    if (onAddTransaction) {
                      await onAddTransaction({
                        game: product?.name || 'Game',
                        item_name: selectedPackage.name,
                        price: totalPriceNum,
                        status: 'success',
                        image_url: product?.image_url || null,
                      });
                    }
                    setBuySuccess(true);
                    toast.success(`Berhasil! ${selectedPackage.name} untuk ${product?.name || ''} sedang diproses. 🎉`);
                  } catch (err) {
                    toast.error('Gagal memproses: ' + err.message);
                  } finally {
                    setBuyProcessing(false);
                  }
                }}
              >
                {buyProcessing ? '⏳ Memproses...' : buySuccess ? '✓ Berhasil!' : '⚡ Beli Sekarang'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
