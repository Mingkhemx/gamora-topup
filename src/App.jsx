import React, { useState } from 'react';
import { 
  Search, Bell, Gamepad2, MessageSquare, Settings, Gift, Star, 
  Zap, Ticket, BarChart3, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Camera, Globe, Video, ShoppingCart
} from 'lucide-react';
import './index.css';

function App() {
  const [faqOpen, setFaqOpen] = useState(0);
  const [activeTab, setActiveTab] = useState('lagi-populer');
  const [currentPage, setCurrentPage] = useState('beranda');

  const transactions = [
    { id: 'TRX-102938', date: '27 Mei 2026, 14:30', game: 'Mobile Legends', item: '86 Diamonds', price: 'Rp 28.500', status: 'Sukses' },
    { id: 'TRX-102939', date: '26 Mei 2026, 09:15', game: 'Free Fire', item: '140 Diamonds', price: 'Rp 20.000', status: 'Sukses' },
    { id: 'TRX-102940', date: '25 Mei 2026, 20:45', game: 'Genshin Impact', item: 'Welkin Moon', price: 'Rp 79.000', status: 'Pending' },
    { id: 'TRX-102941', date: '20 Mei 2026, 11:20', game: 'PUBG Mobile', item: '600 UC', price: 'Rp 150.000', status: 'Gagal' },
  ];

  const promos = [
    { id: 1, title: "Cashback 50% Pakai GoPay", desc: "Nikmati cashback hingga Rp 50.000 untuk top up semua game.", code: "GOPAYGAMING", exp: "31 Mei 2026", type: "Cashback", img: "/hero_bg.png" },
    { id: 2, title: "Diskon 20% MLBB", desc: "Top up Weekly Diamond Pass MLBB diskon 20% tanpa minimum pembelian.", code: "MLBBHEMAT", exp: "28 Mei 2026", type: "Diskon", img: "/mlbb.png" },
    { id: 3, title: "Bonus Genshin Impact", desc: "Beli Blessing of the Welkin Moon dapat ekstra 60 Genesis Crystals.", code: "GENSHINBONUS", exp: "15 Jun 2026", type: "Game Spesifik", img: "/genshin.png" },
    { id: 4, title: "Promo Pengguna Baru", desc: "Potongan langsung Rp 10.000 untuk transaksi pertamamu di GamerCredits.", code: "NEWGAMER", exp: "Tidak ada masa", type: "Pengguna Baru", img: "/pubg.png" },
    { id: 5, title: "Cashback OVO 30%", desc: "Bayar pakai OVO dapat cashback points maksimal 30.000 OVO Points.", code: "OVOJUARA", exp: "30 Mei 2026", type: "Cashback", img: "/ff.png" },
    { id: 6, title: "Diskon Akhir Bulan", desc: "Diskon 10% untuk semua produk Voucher Digital.", code: "PAYDAY", exp: "1 Jun 2026", type: "Diskon", img: "/hero_bg.png" },
  ];

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

  return (
    <>
      {/* HEADER */}
      <header className="header">
        <div className="header-left">
          <div className="logo">GamerCredits</div>
          <div className="search-bar">
            <Search size={18} color="#94a3b8" />
            <input type="text" placeholder="Cari game..." />
          </div>
        </div>
        <div className="header-right">
          <nav className="nav-links">
            <a href="#" className={currentPage === 'beranda' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentPage('beranda'); window.scrollTo(0,0); }}>Beranda</a>
            <a href="#" className={currentPage === 'transaksi' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentPage('transaksi'); window.scrollTo(0,0); }}>Transaksi</a>
            <a href="#" className={currentPage === 'promo' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentPage('promo'); window.scrollTo(0,0); }}>Promo</a>
            <a href="#" className={currentPage === 'gacha' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentPage('gacha'); window.scrollTo(0,0); }}>Gacha</a>
          </nav>
          <div className="header-divider"></div>
          <button className="icon-btn"><ShoppingCart size={20} /></button>
          <button className="btn-outline">Masuk/Daftar</button>
        </div>
      </header>

      {currentPage === 'beranda' && (
      <main>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="promo-badge">
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#00e5ff' }}></div>
            HOT PROMO: UP TO 50% CASHBACK
          </div>
          <h1>Level Up Your Digital Arsenal</h1>
          <p>
            Top up gems, diamonds, and vouchers instantly with the most secure gaming payment gateway in the ecosystem.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary">Top Up Now</button>
            <button className="btn-outline">Lihat Promo</button>
          </div>
        </div>

        {/* Floating Right Menu */}
        <div className="floating-menu">
          <button className="active"><Gamepad2 size={24} /></button>
          <button><MessageSquare size={24} /></button>
          <button><Settings size={24} /></button>
          <button><Gift size={24} /></button>
          <button><Star size={24} /></button>
        </div>
      </section>

      {/* FLASH SALE */}
      <section className="section">
        <div className="section-header">
          <div className="section-title">
            <h2><Zap color="#ff3366" /> Penawaran Terbatas</h2>
          </div>
          <div className="countdown">
            Berakhir dalam: 
            <span className="time-box">02</span> : 
            <span className="time-box">45</span> : 
            <span className="time-box">12</span>
          </div>
        </div>
        
        <div className="grid-4">
          <div className="game-card">
            <div className="card-img-wrapper">
              <img src="/mlbb.png" alt="Mobile Legends" />
              <div className="discount-badge">-20%</div>
            </div>
            <div className="card-body">
              <h3>Mobile Legends Diamonds</h3>
              <div className="price-strike">Rp 100.000</div>
              <div className="price-final">Rp 80.000</div>
              <button className="btn-buy">Beli Sekarang</button>
            </div>
          </div>
          
          <div className="game-card">
            <div className="card-img-wrapper">
              <img src="/genshin.png" alt="Genshin Impact" />
              <div className="discount-badge">-15%</div>
            </div>
            <div className="card-body">
              <h3>Genshin Primogems</h3>
              <div className="price-strike">Rp 150.000</div>
              <div className="price-final">Rp 127.500</div>
              <button className="btn-buy">Beli Sekarang</button>
            </div>
          </div>

          <div className="game-card">
            <div className="card-img-wrapper">
              <img src="/pubg.png" alt="PUBG Mobile" />
              <div className="discount-badge">-30%</div>
            </div>
            <div className="card-body">
              <h3>PUBG UC Global</h3>
              <div className="price-strike">Rp 50.000</div>
              <div className="price-final">Rp 35.000</div>
              <button className="btn-buy">Beli Sekarang</button>
            </div>
          </div>

          <div className="game-card">
            <div className="card-img-wrapper">
              <img src="/ff.png" alt="Free Fire" />
              <div className="discount-badge">-10%</div>
            </div>
            <div className="card-body">
              <h3>Free Fire Diamonds</h3>
              <div className="price-strike">Rp 40.000</div>
              <div className="price-final">Rp 36.000</div>
              <button className="btn-buy">Beli Sekarang</button>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER TABS */}
      <div className="filter-tabs">
        <button className={`filter-pill ${activeTab === 'lagi-populer' ? 'active' : ''}`} onClick={(e) => handleTabClick(e, 'lagi-populer')}>🔥 Lagi Populer</button>
        <button className={`filter-pill ${activeTab === 'voucher' ? 'active' : ''}`} onClick={(e) => handleTabClick(e, 'voucher')}>Voucher</button>
        <button className={`filter-pill ${activeTab === 'top-up-langsung' ? 'active' : ''}`} onClick={(e) => handleTabClick(e, 'top-up-langsung')}>Top Up Langsung</button>
        <button className="filter-pill">🌟 Baru Rilis</button>
        <button className="filter-pill">Top Up Login</button>
        <button className="filter-pill">Pulsa</button>
        <button className="filter-pill">Entertainment</button>
      </div>

      {/* LAGI POPULER */}
      <section id="lagi-populer" className="simple-grid-section">
        <div className="section-header-simple">
          <h2>🔥 Lagi Populer</h2>
        </div>
        <div className="grid-5">
          {[1,2,3,4,5,6,7,8,9,10].map((item, i) => (
            <div className="simple-card" key={`pop-${i}`}>
              <div className="simple-card-img">
                <img src={i % 2 === 0 ? "/mlbb.png" : i % 3 === 0 ? "/genshin.png" : "/pubg.png"} alt="Game" />
                {i < 4 && <div className="cashback-pill">💰 CASHBACK</div>}
              </div>
              <h4>{i % 2 === 0 ? "Mobile Legends" : i % 3 === 0 ? "Genshin Impact" : "PUBG Mobile"}</h4>
            </div>
          ))}
        </div>
        <div className="load-more">
          <button>Tampilkan lebih banyak</button>
        </div>
      </section>

      {/* VOUCHER */}
      <section id="voucher" className="simple-grid-section">
        <div className="section-header-simple">
          <h2>Voucher</h2>
        </div>
        <div className="grid-5">
          {[1,2,3,4,5,6,7,8,9,10].map((item, i) => (
            <div className="simple-card" key={`vou-${i}`}>
              <div className="simple-card-img">
                <img src={i % 2 === 0 ? "/pubg.png" : i % 3 === 0 ? "/ff.png" : "/genshin.png"} alt="Game" />
              </div>
              <h4>{i % 2 === 0 ? "Voucher PUBG" : i % 3 === 0 ? "Garena Shells" : "Google Play"}</h4>
            </div>
          ))}
        </div>
        <div className="load-more">
          <button>Tampilkan lebih banyak</button>
        </div>
      </section>

      {/* TOP UP LANGSUNG */}
      <section id="top-up-langsung" className="simple-grid-section">
        <div className="section-header-simple">
          <h2>Top Up Langsung</h2>
        </div>
        <div className="grid-5">
          {[1,2,3,4,5,6,7,8,9,10].map((item, i) => (
            <div className="simple-card" key={`tul-${i}`}>
              <div className="simple-card-img">
                <img src={i % 2 === 0 ? "/ff.png" : i % 3 === 0 ? "/mlbb.png" : "/pubg.png"} alt="Game" />
                {i < 2 && <div className="cashback-pill">💰 CASHBACK</div>}
              </div>
              <h4>{i % 2 === 0 ? "Free Fire Global" : i % 3 === 0 ? "Honor of Kings" : "AFK Journey"}</h4>
            </div>
          ))}
        </div>
        <div className="load-more">
          <button>Tampilkan lebih banyak</button>
        </div>
      </section>


      {/* TESTIMONIALS */}
      <section className="section">
        <div className="section-header">
          <div className="section-title">
            <h2>Apa Kata Gamer?</h2>
            <p>Lebih dari 1 juta transaksi sukses diproses setiap bulannya.</p>
          </div>
          <div className="nav-arrows">
            <button className="arrow-btn"><ChevronLeft size={20} /></button>
            <button className="arrow-btn"><ChevronRight size={20} /></button>
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
              <h2>Pertanyaan Populer</h2>
              <p>Butuh bantuan? Berikut adalah beberapa jawaban untuk pertanyaan yang paling sering diajukan.</p>
            </div>
          </div>

          <div className="faq-list">
            <div className="faq-item">
              <div className="faq-question" onClick={() => toggleFaq(0)}>
                Bagaimana cara top up di GamerCredits?
                {faqOpen === 0 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              {faqOpen === 0 && (
                <div className="faq-answer">
                  Sangat mudah! Pilih game yang ingin di top-up, masukkan ID User / UID Anda, pilih nominal yang diinginkan, pilih metode pembayaran, dan lakukan pembayaran. Sistem kami akan memproses pesanan Anda secara otomatis dalam hitungan detik.
                </div>
              )}
            </div>

            <div className="faq-item">
              <div className="faq-question" onClick={() => toggleFaq(1)}>
                Berapa lama proses transaksi hingga masuk ke akun?
                {faqOpen === 1 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              {faqOpen === 1 && (
                <div className="faq-answer">
                  Umumnya, transaksi diproses secara real-time dan masuk ke akun Anda dalam waktu 1-3 detik setelah pembayaran terkonfirmasi.
                </div>
              )}
            </div>

            <div className="faq-item">
              <div className="faq-question" onClick={() => toggleFaq(2)}>
                Metode pembayaran apa saja yang tersedia?
                {faqOpen === 2 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              {faqOpen === 2 && (
                <div className="faq-answer">
                  Kami menerima berbagai metode pembayaran termasuk QRIS, E-Wallet (OVO, GoPay, Dana, LinkAja), Virtual Account (BCA, Mandiri, BNI, BRI), serta pembayaran melalui minimarket.
                </div>
              )}
            </div>

            <div className="faq-item">
              <div className="faq-question" onClick={() => toggleFaq(3)}>
                Apakah layanan GamerCredits aman dan legal?
                {faqOpen === 3 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              {faqOpen === 3 && (
                <div className="faq-answer">
                  Ya, 100% aman dan legal. Kami adalah partner resmi dari berbagai publisher game, sehingga semua transaksi terjamin keamanannya dan tidak akan menyebabkan akun Anda terkena banned.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
      </main>
      )}

      {currentPage === 'transaksi' && (
        <main className="page-container">
          <div className="transaction-wrapper">
            <h2 className="page-title">Riwayat Transaksi</h2>
            
            <div className="transaction-list">
              {transactions.map((trx, idx) => (
                <div className="trx-card" key={idx}>
                  <div className="trx-header">
                    <span className="trx-date">{trx.date}</span>
                    <span className={`trx-status status-${trx.status.toLowerCase()}`}>{trx.status}</span>
                  </div>
                  <div className="trx-body">
                    <div className="trx-info">
                      <h4>{trx.game}</h4>
                      <p>{trx.item}</p>
                      <span className="trx-id">ID: {trx.id}</span>
                    </div>
                    <div className="trx-price">
                      {trx.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {currentPage === 'promo' && (
        <main className="page-container">
          <div className="promo-wrapper">
            <h2 className="page-title">Promo Spesial Untukmu</h2>

            <div className="promo-grid">
              {promos.map((promo) => (
                <div className="promo-card" key={promo.id}>
                  <div className="promo-card-image">
                    <img src={promo.img} alt={promo.title} />
                  </div>
                  <div className="promo-card-content">
                    <div className="promo-card-top">
                      <span className="promo-type">{promo.type}</span>
                      <h3>{promo.title}</h3>
                      <p>{promo.desc}</p>
                    </div>
                    <div className="promo-card-bottom">
                    <div className="promo-code-box">
                      <span className="promo-code-label">Kode Promo:</span>
                      <span className="promo-code-text">{promo.code}</span>
                    </div>
                    <div className="promo-actions">
                      <span className="promo-exp">Berlaku s/d: <strong>{promo.exp}</strong></span>
                      <button className="btn-primary" style={{padding: '0.4rem 1rem', fontSize: '0.85rem'}}>Salin</button>
                    </div>
                  </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {currentPage === 'gacha' && (
        <main className="page-container">
          <div className="gacha-wrapper">
            
            <div className="gacha-header">
              <h2 className="page-title" style={{marginBottom: '0.5rem'}}>Kejutan Gacha Bulanan!</h2>
              <p>Buka kotak misteri dan menangkan hingga 10.000 Diamonds gratis.</p>
              <div className="user-coins">
                <Star size={20} color="#f59e0b" fill="#f59e0b" />
                <span>Koin Kamu: <strong>1,250</strong></span>
              </div>
            </div>

            <div className="gacha-main">
              <div className="gacha-chest-container">
                <div className="gacha-glow"></div>
                <div className="gacha-chest">
                  <Gift size={64} color="#ffffff" />
                </div>
              </div>

              <div className="gacha-actions">
                <button className="btn-gacha">Buka 1x <span>(100 Koin)</span></button>
                <button className="btn-gacha btn-gacha-premium">Buka 10x <span>(900 Koin)</span></button>
              </div>
            </div>

            <div className="gacha-prizes">
              <h3>Daftar Hadiah Utama</h3>
              <div className="prize-grid">
                <div className="prize-card grand-prize">
                  <div className="prize-icon">💎</div>
                  <h4>10.000 Diamonds</h4>
                  <p>Grand Prize (0.01%)</p>
                </div>
                <div className="prize-card">
                  <div className="prize-icon">🎮</div>
                  <h4>PS5 Console</h4>
                  <p>Rare (0.05%)</p>
                </div>
                <div className="prize-card">
                  <div className="prize-icon">🎟️</div>
                  <h4>Voucher Rp 100rb</h4>
                  <p>Epic (5%)</p>
                </div>
                <div className="prize-card">
                  <div className="prize-icon">💰</div>
                  <h4>Cashback 50%</h4>
                  <p>Normal (20%)</p>
                </div>
              </div>
            </div>

          </div>
        </main>
      )}

      {/* FOOTER */}
      <footer>
        <div className="footer-top">
          <div className="footer-col">
            <div className="logo" style={{ fontSize: '1.5rem', display: 'inline-block' }}>GamerCredits</div>
            <p>
              Solusi top-up game tercepat, termurah, dan terpercaya di Indonesia. Membangun ekosistem gaming yang lebih baik untuk semua.
            </p>
            <div className="social-links">
              <a href="#"><Camera size={20} /></a>
              <a href="#"><Globe size={20} /></a>
              <a href="#"><Video size={20} /></a>
            </div>
          </div>
          
          <div className="footer-col">
            <h4>Layanan Kami</h4>
            <ul>
              <li><a href="#">Top Up Game</a></li>
              <li><a href="#">Voucher Digital</a></li>
              <li><a href="#">Beli Pulsa</a></li>
              <li><a href="#">Gacha Reward</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>Perusahaan</h4>
            <ul>
              <li><a href="#">Tentang Kami</a></li>
              <li><a href="#">Syarat & Ketentuan</a></li>
              <li><a href="#">Kebijakan Privasi</a></li>
              <li><a href="#">Hubungi Kami</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>Metode Pembayaran</h4>
            <div className="payment-methods">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="payment-box"></div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          &copy; 2024 GamerCredits Ecosystem. Built for performance.
        </div>
      </footer>
    </>
  );
}

export default App;
