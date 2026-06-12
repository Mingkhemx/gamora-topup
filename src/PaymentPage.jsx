import React, { useState } from 'react';
import { ChevronLeft, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { supabase } from './supabaseClient';
import { toast } from './AlertSystem.jsx';
import './PaymentPage.css';

const paymentMethods = [
  {
    group: 'Gamora Coins',
    methods: [
      { id: 'coins', name: 'Gamora Coins', img: null, emoji: '⭐', fee: 0, isCoins: true },
    ]
  },
  {
    group: 'Transfer Bank',
    methods: [
      { id: 'bca',     name: 'BCA Virtual Account',           img: '/payment/bca.png',      fee: 0 },
      { id: 'bni',     name: 'BNI Virtual Account',           img: '/payment/bni.png',      fee: 0 },
      { id: 'bri',     name: 'BRI Virtual Account',           img: '/payment/bri.png',      fee: 0 },
      { id: 'mandiri', name: 'Mandiri Virtual Account',       img: '/payment/mandiri.png',  fee: 0 },
      { id: 'permata', name: 'Permata Virtual Account',       img: '/payment/permata.png',  fee: 0 },
    ]
  },
  {
    group: 'E-Wallet',
    methods: [
      { id: 'gopay',    name: 'GoPay',      img: '/payment/gopay.png',    fee: 0 },
      { id: 'ovo',      name: 'OVO',        img: '/payment/ovo.png',      fee: 0 },
      { id: 'dana',     name: 'DANA',       img: '/payment/dana.png',     fee: 0 },
      { id: 'shopeepay',name: 'ShopeePay',  img: '/payment/shopepay.png', fee: 0 },
      { id: 'linkaja',  name: 'LinkAja',    img: '/payment/linkaja.png',  fee: 0 },
    ]
  },
  {
    group: 'Minimarket',
    methods: [
      { id: 'alfamart',  name: 'Alfamart',  img: '/payment/alfamart.png',  fee: 2500 },
      { id: 'indomaret', name: 'Indomaret', img: '/payment/indomaret.png', fee: 2500 },
    ]
  },
  {
    group: 'QRIS',
    methods: [
      { id: 'qris', name: 'QRIS (Semua Bank & E-Wallet)', img: '/payment/qris.png', fee: 0 },
    ]
  },
];

export default function PaymentPage({ cartItems, user, onBack, onSuccess, addTransaction, coins, onCoinsChange }) {
  // Pre-select payment method jika sudah dipilih dari ProductDetail
  const preSelected = cartItems.length === 1 && cartItems[0].paymentMethod
    ? cartItems[0].paymentMethod.toLowerCase()
    : null;

  const [selectedMethod, setSelectedMethod] = useState(preSelected);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState('choose');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);

  const subtotal = cartItems.reduce((s, item) => s + parseInt(item.price.replace(/\D/g, '')) * item.qty, 0);
  const fee = selectedMethod ? (paymentMethods.flatMap(g => g.methods).find(m => m.id === selectedMethod)?.fee || 0) : 0;
  const discount = promoApplied ? (promoApplied.discount_type === 'percent'
    ? Math.round(subtotal * promoApplied.discount_value / 100)
    : promoApplied.discount_value) : 0;
  const total = subtotal + fee - discount;

  const applyPromo = async () => {
    if (!promoCode.trim()) return toast.warning('Masukkan kode promo terlebih dahulu.');
    const { data, error } = await supabase
      .from('promos')
      .select('*')
      .eq('code', promoCode.toUpperCase())
      .eq('is_active', true)
      .single();
    if (error || !data) return toast.error('Kode promo tidak valid atau sudah kadaluarsa.');
    if (data.expiry_date && new Date(data.expiry_date) < new Date()) return toast.error('Kode promo sudah kadaluarsa.');
    setPromoApplied(data);
    toast.success(`Promo "${data.title}" berhasil diterapkan!`);
  };

  const handlePay = async () => {
    if (!selectedMethod) return toast.warning('Pilih metode pembayaran terlebih dahulu.');

    // Validasi coins jika pakai Gamora Coins
    if (selectedMethod === 'coins') {
      if ((coins || 0) < total) {
        toast.error(`Coins tidak cukup! Kamu punya ${(coins||0).toLocaleString('id-ID')} Coins, butuh ${total.toLocaleString('id-ID')} Coins.`);
        return;
      }
    }

    setProcessing(true);
    setStep('confirm');
    await new Promise(r => setTimeout(r, 2000));
    try {
      // Kurangi coins jika bayar pakai coins
      if (selectedMethod === 'coins' && onCoinsChange) {
        onCoinsChange(-total); // delta negatif = kurangi
      }

      for (const item of cartItems) {
        if (addTransaction) {
          await addTransaction({
            game: item.game || 'Unknown Game',
            item_name: `${item.package} Diamonds`,
            price: parseInt(item.price.replace(/\D/g, '')) * item.qty,
            status: 'success',
            image_url: item.image || null,
          });
        }
      }
      setStep('success');
    } catch (err) {
      toast.error('Gagal memproses pembayaran: ' + err.message);
      setStep('choose');
    } finally {
      setProcessing(false);
    }
  };

  // ── STEP: SUCCESS ────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="pay-root">
        <div className="pay-success-wrap">
          <div className="pay-success-icon">
            <CheckCircle2 size={56} color="#22c55e" />
          </div>
          <h2 className="pay-success-title">Pembayaran Berhasil!</h2>
          <p className="pay-success-sub">Transaksimu sedang diproses. Item akan masuk ke akunmu dalam 1–5 detik.</p>
          <div className="pay-success-summary">
            {cartItems.map(item => (
              <div key={item.id} className="pay-success-item">
                <img src={item.image || '/mlbb.png'} alt={item.game} />
                <div>
                  <div className="pay-success-game">{item.game}</div>
                  <div className="pay-success-pkg">{item.package} Diamonds × {item.qty}</div>
                </div>
                <div className="pay-success-price">{item.price}</div>
              </div>
            ))}
          </div>
          <div className="pay-success-total">
            Total Dibayar: <strong>Rp {total.toLocaleString('id-ID')}</strong>
          </div>
          <button className="pay-btn-primary" onClick={onSuccess} style={{marginTop:24}}>
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  // ── STEP: CONFIRM (processing) ───────────────────────────
  if (step === 'confirm') {
    return (
      <div className="pay-root">
        <div className="pay-success-wrap">
          <div className="pay-processing-icon">
            <Clock size={48} color="#6366f1" className="pay-spin" />
          </div>
          <h2 className="pay-success-title">Memproses Pembayaran...</h2>
          <p className="pay-success-sub">Mohon tunggu, jangan tutup halaman ini.</p>
        </div>
      </div>
    );
  }

  // ── STEP: CHOOSE ────────────────────────────────────────
  return (
    <div className="pay-root">
      {/* Header */}
      <div className="pay-header">
        <button className="pay-back-btn" onClick={onBack}>
          <ChevronLeft size={20} /> Kembali
        </button>
        <h2 className="pay-header-title">Pembayaran</h2>
      </div>

      <div className="pay-body">
        {/* LEFT: Order summary + promo */}
        <div className="pay-left">
          <div className="pay-card">
            <h3 className="pay-card-title">🛒 Ringkasan Pesanan</h3>
            <div className="pay-order-list">
              {cartItems.map(item => (
                <div key={item.id} className="pay-order-row">
                  <img src={item.image || '/mlbb.png'} alt={item.game} className="pay-order-img" />
                  <div className="pay-order-info">
                    <div className="pay-order-game">{item.game}</div>
                    <div className="pay-order-pkg">{item.package} Diamonds × {item.qty}</div>
                  </div>
                  <div className="pay-order-price">{item.price}</div>
                </div>
              ))}
            </div>

            {/* Promo code */}
            <div className="pay-promo-row">
              <input
                type="text"
                className="pay-promo-input"
                placeholder="Kode Promo (opsional)"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value.toUpperCase())}
              />
              <button className="pay-promo-btn" onClick={applyPromo}>Pakai</button>
            </div>
            {promoApplied && (
              <div className="pay-promo-applied">
                ✓ {promoApplied.title} — Hemat Rp {discount.toLocaleString('id-ID')}
                <button onClick={() => { setPromoApplied(null); setPromoCode(''); }}>✕</button>
              </div>
            )}

            {/* Price breakdown */}
            <div className="pay-price-breakdown">
              <div className="pay-price-row">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              {discount > 0 && (
                <div className="pay-price-row discount">
                  <span>Diskon Promo</span>
                  <span>-Rp {discount.toLocaleString('id-ID')}</span>
                </div>
              )}
              {fee > 0 && (
                <div className="pay-price-row">
                  <span>Biaya Admin</span>
                  <span>+Rp {fee.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="pay-price-row total">
                <span>Total</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          <div className="pay-secure-note">
            <ShieldCheck size={15} color="#22c55e" />
            Pembayaran 100% aman & terenkripsi
          </div>
        </div>

        {/* RIGHT: Payment methods */}
        <div className="pay-right">
          <div className="pay-card">
            <h3 className="pay-card-title">💳 Metode Pembayaran</h3>
            {paymentMethods.map(group => (
              <div key={group.group} className="pay-method-group">
                <div className="pay-method-group-label">{group.group}</div>
                {group.methods.map(m => (
                  <label key={m.id} className={`pay-method-row ${selectedMethod === m.id ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value={m.id}
                      checked={selectedMethod === m.id}
                      onChange={() => setSelectedMethod(m.id)}
                    />
                    <div className="pay-method-logo">
                      {m.img
                        ? <img src={m.img} alt={m.name} />
                        : <span style={{fontSize:'1.4rem'}}>{m.emoji}</span>
                      }
                    </div>
                    <div className="pay-method-info">
                      <div className="pay-method-name">
                        {m.name}
                        {m.isCoins && <span style={{marginLeft:8,fontSize:'0.75rem',color:'#6366f1',fontWeight:700}}>
                          Saldo: ⭐ {(coins||0).toLocaleString('id-ID')}
                        </span>}
                      </div>
                      {m.fee > 0 && <div className="pay-method-fee">+Rp {m.fee.toLocaleString('id-ID')} admin</div>}
                      {m.isCoins && (coins||0) < total && (
                        <div style={{fontSize:'0.72rem',color:'#ef4444',fontWeight:600}}>
                          ⚠ Coins tidak cukup
                        </div>
                      )}
                    </div>
                    {selectedMethod === m.id && <CheckCircle2 size={18} color="#6366f1" />}
                  </label>
                ))}
              </div>
            ))}
          </div>

          <button
            className={`pay-btn-primary ${!selectedMethod ? 'disabled' : ''}`}
            onClick={handlePay}
            disabled={!selectedMethod || processing}
          >
            Bayar Rp {total.toLocaleString('id-ID')}
          </button>
        </div>
      </div>
    </div>
  );
}
