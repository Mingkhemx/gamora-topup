import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, Shield, Clock, CreditCard, Zap, ChevronDown, ChevronUp, Plus, Minus, Phone, ShoppingCart } from 'lucide-react';
import './ProductDetail.css';
import { supabase } from './supabaseClient';
import { toast } from './AlertSystem.jsx';

const mlbbPackages = [
  { id: 1, diamonds: '5 (+1)', total: '6', price: 'Rp 1.428', label: '' },
  { id: 2, diamonds: '12 (+2)', total: '14', price: 'Rp 3.000', label: '' },
  { id: 3, diamonds: '19 (+5)', total: '24', price: 'Rp 4.999', label: '' },
  { id: 4, diamonds: '28 (+7)', total: '35', price: 'Rp 7.000', label: '' },
  { id: 5, diamonds: '55 (+10)', total: '65', price: 'Rp 13.999', label: '' },
  { id: 6, diamonds: '86 (+20)', total: '106', price: 'Rp 20.000', label: '' },
  { id: 7, diamonds: '172 (+35)', total: '207', price: 'Rp 40.000', label: '' },
  { id: 8, diamonds: '257 (+55)', total: '312', price: 'Rp 60.000', label: '' },
  { id: 9, diamonds: '344 (+70)', total: '414', price: 'Rp 79.999', label: '' },
  { id: 10, diamonds: '429 (+86)', total: '515', price: 'Rp 99.000', label: '' },
  { id: 11, diamonds: '514 (+103)', total: '617', price: 'Rp 120.000', label: '' },
  { id: 12, diamonds: '600 (+120)', total: '720', price: 'Rp 139.000', label: '' },
  { id: 13, diamonds: '706 (+141)', total: '847', price: 'Rp 163.000', label: '' },
  { id: 14, diamonds: '878 (+176)', total: '1054', price: 'Rp 203.000', label: '' },
  { id: 15, diamonds: '963 (+193)', total: '1156', price: 'Rp 222.000', label: '' },
  { id: 16, diamonds: '1050 (+210)', total: '1260', price: 'Rp 242.000', label: '' },
  { id: 17, diamonds: '1195 (+239)', total: '1434', price: 'Rp 276.000', label: '' },
  { id: 18, diamonds: '1412 (+283)', total: '1695', price: 'Rp 326.000', label: '' },
  { id: 19, diamonds: '2195 (+439)', total: '2634', price: 'Rp 507.000', label: '' },
  { id: 20, diamonds: '2901 (+580)', total: '3481', price: 'Rp 671.000', label: '' },
  { id: 21, diamonds: '3688 (+738)', total: '4426', price: 'Rp 853.000', label: '' },
  { id: 22, diamonds: '4829 (+966)', total: '5795', price: 'Rp 1.117.000', label: '' },
  { id: 23, diamonds: '5532 (+1106)', total: '6638', price: 'Rp 1.280.000', label: '' },
  { id: 24, diamonds: 'Weekly Diamond Pass', total: 'WDP', price: 'Rp 21.500', label: 'Special' },
  { id: 25, diamonds: 'Twilight Pass', total: 'TP', price: 'Rp 115.000', label: 'Special' },
];

const paymentMethods = {
  coinpedia: { name: 'Coinpedia', desc: 'Promo: 0,00 → 0pt per rp1', isBest: true, icon: '🪙' },
  qris: {
    name: 'QRIS (All Payment Method)',
    desc: 'Harga: 0,00 → 0pt per rp1',
    isBest: false,
    icon: '📱',
    subIcons: ['QRIS']
  }
};

const faqItems = [
  { q: 'Cara Top Up ML di Takapedia?', a: 'Masukkan ID dan Server, pilih nominal diamond, pilih metode pembayaran, masukkan nomor WhatsApp, dan klik Pesan Sekarang.' },
  { q: 'Metode Pembayaran untuk Top Up ML di Takapedia?', a: 'Kami menerima Coinpedia, QRIS, E-Wallet (GoPay, OVO, Dana), Virtual Account (BCA, Mandiri, BNI, BRI), dan Convenience Store.' },
  { q: 'Mengapa Harus Top Up ML di Takapedia?', a: 'Takapedia menawarkan harga murah, proses otomatis, layanan 24/7, dan pembayaran yang aman & terpercaya.' },
];

export default function ProductDetail({ productId, onBack, onAddToCart, onAddTransaction, userId: propUserId, onBuyNow }) {
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
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const totalPrice = selectedPackage
    ? `Rp ${(parseInt(selectedPackage.price.replace(/\D/g, '')) * qty).toLocaleString('id-ID')}`
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
              {mlbbPackages.map(pkg => (
                <div
                  key={pkg.id}
                  className={`pd-pkg-card ${selectedPackage?.id === pkg.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  {pkg.label && <span className="pd-pkg-label">{pkg.label}</span>}
                  <div className="pd-pkg-icon">💎</div>
                  <div className="pd-pkg-diamonds">{pkg.diamonds} Diamonds</div>
                  <div className="pd-pkg-price">{pkg.price}</div>
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
                  <span className="pd-order-val">{selectedPackage.diamonds} Diamonds</span>
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
                disabled={!selectedPackage}
                onClick={() => {
                  onAddToCart({
                    id: Date.now(),
                    game: product?.name || 'Game',
                    package: selectedPackage.diamonds,
                    qty: qty,
                    price: selectedPackage.price,
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
                  if (!selectedPayment) return toast.warning('Pilih metode pembayaran terlebih dahulu.');
                  setBuyProcessing(true);
                  try {
                    // Simulasi proses 1.5 detik
                    await new Promise(r => setTimeout(r, 1500));
                    // Simpan transaksi ke Supabase
                    if (onAddTransaction) {
                      await onAddTransaction({
                        game: product?.name || 'Game',
                        item_name: selectedPackage.diamonds,
                        price: parseInt(selectedPackage.price.replace(/\D/g, '')),
                        status: 'success',
                        image_url: product?.image_url || null,
                      });
                    }
                    setBuySuccess(true);
                    toast.success(`Berhasil! ${selectedPackage.diamonds} ${product?.name || ''} sedang diproses. 🎉`);
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
