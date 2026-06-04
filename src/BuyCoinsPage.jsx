import React from 'react';
import { CreditCard, Wallet, Star } from 'lucide-react';

const BuyCoinsPage = ({ coins, onCoinsChange }) => {
  const packages = [
    { amount: 100, price: 5000, bonus: 0, popular: false },
    { amount: 500, price: 25000, bonus: 50, popular: false },
    { amount: 1200, price: 50000, bonus: 200, popular: true },
    { amount: 3000, price: 100000, bonus: 500, popular: false },
    { amount: 6500, price: 200000, bonus: 1500, popular: false },
    { amount: 15000, price: 400000, bonus: 5000, popular: false },
  ];

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
          <p style={{color: '#64748b'}}>Pilih nominal Gamora Coin yang ingin kamu isi ulang. Koin dapat digunakan untuk bermain Gacha dan Arcade.</p>
        </div>
        
        <div className="coin-packages-grid">
          {packages.map((pkg, idx) => (
            <div className={`coin-card ${pkg.popular ? 'popular' : ''}`} key={idx}>
              {pkg.popular && <div className="coin-card-badge">Paling Laris</div>}
              <div className="coin-icon-large">⭐</div>
              <h3>{pkg.amount} Koin</h3>
              {pkg.bonus > 0 && <span className="coin-bonus">+ Bonus {pkg.bonus} Koin!</span>}
              <div className="coin-price">Rp {pkg.price.toLocaleString('id-ID')}</div>
              <button 
                className="buy-coin-btn"
                onClick={() => {
                  onCoinsChange(pkg.amount + pkg.bonus);
                  alert(`Berhasil membeli ${pkg.amount + pkg.bonus} Koin! Koin kamu sekarang bertambah.`);
                }}
              >
                <CreditCard size={18} />
                Beli Sekarang
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BuyCoinsPage;
