import React, { useState } from 'react';
import { CreditCard, Wallet, Star, Zap, Crown, Gift } from 'lucide-react';
import { toast } from './AlertSystem.jsx';

// 1 Gamora Coin = Rp 1
// Beli Rp X → dapat X coins + bonus
const coinPackages = [
  { id: 1, coins: 5000,   price: 5000,   bonus: 250,   label: '',            icon: '⭐', popular: false },
  { id: 2, coins: 10000,  price: 10000,  bonus: 750,   label: '',            icon: '⭐', popular: false },
  { id: 3, coins: 25000,  price: 25000,  bonus: 2500,  label: '🔥 Terlaris', icon: '💫', popular: true  },
  { id: 4, coins: 50000,  price: 50000,  bonus: 7500,  label: '',            icon: '💎', popular: false },
  { id: 5, coins: 100000, price: 100000, bonus: 20000, label: '👑 Best Value',icon: '👑', popular: false },
  { id: 6, coins: 250000, price: 250000, bonus: 75000, label: '',            icon: '💠', popular: false },
];

const BuyCoinsPage = ({ coins, onCoinsChange }) => {
  const [buying, setBuying] = useState(null);

  const handleBuy = async (pkg) => {
    setBuying(pkg.id);
    await new Promise(r => setTimeout(r, 800)); // simulasi payment
    const total = pkg.coins + pkg.bonus;
    onCoinsChange(total);
    toast.success(`✅ Berhasil! ${total.toLocaleString('id-ID')} Coins (${pkg.coins.toLocaleString('id-ID')} + bonus ${pkg.bonus.toLocaleString('id-ID')}) ditambahkan!`);
    setBuying(null);
  };

  return (
    <div className="buy-coins-page">
      <div className="buy-coins-header">
        <div className="balance-card">
          <div className="balance-info">
            <span className="balance-label">Total Gamora Coin Kamu</span>
            <div className="balance-amount">
              <Star fill="#f59e0b" color="#f59e0b" size={32} />
              <span>{coins.toLocaleString('id-ID')}</span>
            </div>
          </div>
          <div className="balance-icon">
            <Wallet size={48} color="#f59e0b" />
          </div>
        </div>
      </div>

      <div className="buy-coins-content">
        <div className="section-header-simple">
          <h2>⭐ Isi Ulang Gamora Coin</h2>
          <p style={{color:'#64748b'}}>
            1 Gamora Coin = Rp 1. Setiap pembelian mendapat <strong style={{color:'#f59e0b'}}>bonus coins ekstra</strong>!
            Koin digunakan untuk Gacha, Arcade, dan promo spesial.
          </p>
        </div>

        <div className="coin-packages-grid">
          {coinPackages.map(pkg => {
            const total = pkg.coins + pkg.bonus;
            const isBuying = buying === pkg.id;
            const bonusPct = Math.round((pkg.bonus / pkg.coins) * 100);
            return (
              <div className={`coin-card ${pkg.popular ? 'popular' : ''}`} key={pkg.id}>
                {pkg.label && <div className="coin-card-badge">{pkg.label}</div>}
                <div className="coin-icon-large">{pkg.icon}</div>
                <h3>{pkg.coins.toLocaleString('id-ID')} Coin</h3>
                {pkg.bonus > 0 && (
                  <span className="coin-bonus">
                    🎁 +{pkg.bonus.toLocaleString('id-ID')} Bonus ({bonusPct}%)
                  </span>
                )}
                <div className="coin-total">
                  Total: <strong>{total.toLocaleString('id-ID')} Coin</strong>
                </div>
                <div className="coin-price">Rp {pkg.price.toLocaleString('id-ID')}</div>
                <button
                  className="buy-coin-btn"
                  disabled={isBuying}
                  onClick={() => handleBuy(pkg)}
                >
                  {isBuying ? (
                    <><Zap size={16} /> Memproses...</>
                  ) : (
                    <><CreditCard size={16} /> Beli Sekarang</>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Info box */}
        <div style={{
          maxWidth:600, margin:'2rem auto 0', padding:'16px 20px',
          background:'#fffbeb', borderRadius:14, border:'1px solid #fde68a',
          fontSize:'0.85rem', color:'#92400e', lineHeight:1.6
        }}>
          <strong>💡 Cara penggunaan Gamora Coin:</strong><br/>
          • Coin digunakan untuk bermain Gacha & Arcade<br/>
          • Saldo berkurang otomatis saat bertransaksi menggunakan coin<br/>
          • Coin tidak bisa dikembalikan ke uang tunai
        </div>
      </div>
    </div>
  );
};

export default BuyCoinsPage;
