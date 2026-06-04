import React, { useState, useRef, useEffect } from 'react';

// ─── Prize Pools ───────────────────────────────────────────────
const MYSTERY_PRIZES = [
  { emoji: '💎', name: '10.000 Diamonds', rarity: 'LEGENDARY', color: '#a78bfa', chance: 1 },
  { emoji: '🎮', name: 'PS5 Console', rarity: 'EPIC', color: '#f59e0b', chance: 2 },
  { emoji: '🎟️', name: 'Voucher Rp 100.000', rarity: 'RARE', color: '#38bdf8', chance: 10 },
  { emoji: '💰', name: 'Cashback 50%', rarity: 'UNCOMMON', color: '#4ade80', chance: 20 },
  { emoji: '⭐', name: '+500 Koin', rarity: 'COMMON', color: '#e2e8f0', chance: 35 },
  { emoji: '🎁', name: '+100 Koin', rarity: 'COMMON', color: '#94a3b8', chance: 32 },
];

const ROULETTE_ITEMS = [
  { emoji: '💎', name: '10K Diamonds', color: '#7c3aed' },
  { emoji: '🎟️', name: 'Voucher 100rb', color: '#2563eb' },
  { emoji: '🏆', name: 'Jackpot x5', color: '#7c3aed' },
  { emoji: '💰', name: 'Cashback 50%', color: '#2563eb' },
  { emoji: '🎮', name: 'PS5 Console', color: '#7c3aed' },
  { emoji: '⭐', name: '+500 Koin', color: '#2563eb' },
  { emoji: '🎁', name: 'Mystery Box', color: '#7c3aed' },
  { emoji: '✨', name: 'Gratis Spin', color: '#2563eb' },
];

const SCRATCH_PRIZES = [
  { emoji: '💎', name: '500 Diamonds', rarity: 'RARE' },
  { emoji: '💰', name: 'Cashback 30%', rarity: 'UNCOMMON' },
  { emoji: '🎟️', name: 'Voucher Rp 25.000', rarity: 'UNCOMMON' },
  { emoji: '⭐', name: '+200 Koin', rarity: 'COMMON' },
  { emoji: '🎁', name: '+50 Koin', rarity: 'COMMON' },
];

function getRandomPrize(prizes) {
  const totalChance = prizes.reduce((a, p) => a + (p.chance || 1), 0);
  let rand = Math.random() * totalChance;
  for (const p of prizes) {
    rand -= (p.chance || 1);
    if (rand <= 0) return p;
  }
  return prizes[prizes.length - 1];
}

// ─── Prize Modal ──────────────────────────────────────────────
function PrizeModal({ prize, onClose, onPlayAgain }) {
  if (!prize) return null;
  const rarityColors = {
    LEGENDARY: '#a78bfa', EPIC: '#f59e0b', RARE: '#38bdf8',
    UNCOMMON: '#4ade80', COMMON: '#94a3b8'
  };
  const color = prize.rarity ? rarityColors[prize.rarity] : '#f59e0b';
  return (
    <div className="prize-modal-overlay" onClick={onClose}>
      <div className="prize-modal" onClick={e => e.stopPropagation()}>
        <div className="prize-modal-glow" style={{ background: `radial-gradient(${color}, transparent 70%)` }} />
        <div className="prize-confetti">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`confetti-piece confetti-${i % 5}`}
              style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 0.5}s` }} />
          ))}
        </div>
        <div className="prize-modal-inner">
          <div className="prize-modal-label">🎉 SELAMAT! KAMU MENDAPAT</div>
          <div className="prize-modal-emoji">{prize.emoji}</div>
          <div className="prize-modal-name">{prize.name}</div>
          {prize.rarity && (
            <div className="prize-modal-rarity" style={{ color, borderColor: color }}>
              ✦ {prize.rarity} ✦
            </div>
          )}
          <div className="prize-modal-actions">
            <button className="prize-modal-btn-secondary" onClick={onClose}>Tutup</button>
            <button className="prize-modal-btn-primary" onClick={onPlayAgain}>Main Lagi!</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mystery Box Game ──────────────────────────────────────────
export function MysteryBoxGame({ coins, onCoinsChange }) {
  const [isOpening, setIsOpening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [prize, setPrize] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const openBox = (cost = 100) => {
    if (coins < cost || isOpening) return;
    setIsOpening(true);
    setIsOpen(false);
    setPrize(null);
    onCoinsChange(-cost);

    setTimeout(() => {
      setIsOpen(true);
      const won = getRandomPrize(MYSTERY_PRIZES);
      setPrize(won);
      setTimeout(() => {
        setIsOpening(false);
        setShowModal(true);
      }, 600);
    }, 1000);
  };

  const reset = () => {
    setIsOpen(false);
    setShowModal(false);
    setPrize(null);
  };

  return (
    <>
      <div className="arcade-game-stage">
        <div className="arcade-stage-header mystery-header">
          <h2>🎁 Mystery Box</h2>
          <p>Klik kotak untuk membukanya dan ungkap hadiahmu!</p>
        </div>
        <div className="mystery-arena">
          <div
            className={`mystery-box-3d ${isOpening ? 'opening' : ''} ${isOpen ? 'opened' : ''}`}
            onClick={() => !isOpening && !isOpen && openBox(100)}
          >
            <div className="mystery-lid">
              <div className="mystery-lid-shine" />
            </div>
            <div className="mystery-body">
              <div className="mystery-ribbon-h" />
              <div className="mystery-ribbon-v" />
              <div className="mystery-glow-effect" />
            </div>
            {isOpen && prize && (
              <div className="mystery-prize-reveal">
                <span>{prize.emoji}</span>
              </div>
            )}
            <div className={`mystery-particles ${isOpening ? 'burst' : ''}`}>
              {[...Array(12)].map((_, i) => (
                <div key={i} className={`particle particle-${i}`} />
              ))}
            </div>
          </div>
          <p className="mystery-hint">
            {isOpening ? '✨ Membuka...' : isOpen ? prize?.name : 'Klik kotak untuk membuka!'}
          </p>
        </div>
        <div className="arcade-stage-actions">
          <button
            className={`arcade-action-btn mystery-action ${coins < 100 || isOpening ? 'disabled' : ''}`}
            onClick={() => !isOpen ? openBox(100) : reset()}
            disabled={coins < 100 || isOpening}
          >
            <span className="action-label">{isOpen ? '🔄 Buka Lagi' : 'Buka 1x'}</span>
            <span className="action-cost">⭐ 100 Koin</span>
          </button>
          <button
            className={`arcade-action-btn mystery-action-premium ${coins < 900 || isOpening ? 'disabled' : ''}`}
            onClick={() => { reset(); setTimeout(() => openBox(900), 100); }}
            disabled={coins < 900 || isOpening}
          >
            <span className="action-badge-new">HEMAT!</span>
            <span className="action-label">Buka 10x</span>
            <span className="action-cost">⭐ 900 Koin</span>
          </button>
        </div>
      </div>
      {showModal && (
        <PrizeModal prize={prize} onClose={() => setShowModal(false)} onPlayAgain={() => { setShowModal(false); reset(); }} />
      )}
    </>
  );
}

// ─── Scratch Card Game ─────────────────────────────────────────
export function ScratchGame({ coins, onCoinsChange }) {
  const canvasRef = useRef(null);
  const [isScratching, setIsScratching] = useState(false);
  const [prize] = useState(() => getRandomPrize(SCRATCH_PRIZES));
  const [scratched, setScratched] = useState(false);
  const [scratchPct, setScratchPct] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [ticketBought, setTicketBought] = useState(false);
  const [serial] = useState(() => Math.floor(Math.random() * 90000) + 10000);
  const lastPos = useRef(null);

  useEffect(() => {
    if (!ticketBought) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw hatching pattern
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    for (let i = -canvas.height; i < canvas.width; i += 12) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + canvas.height, canvas.height);
      ctx.stroke();
    }
    // Draw text
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillStyle = '#334155';
    ctx.textAlign = 'center';
    ctx.fillText('GOSOK DI SINI ✨', canvas.width / 2, canvas.height / 2 + 6);
  }, [ticketBought]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const scratch = (e) => {
    if (!isScratching || scratched || !ticketBought) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    if (lastPos.current) {
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.lineWidth = 40;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
    ctx.fill();
    lastPos.current = pos;

    // Check scratch percentage
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) transparent++;
    }
    const pct = Math.round((transparent / (canvas.width * canvas.height)) * 100);
    setScratchPct(pct);
    if (pct > 55 && !scratched) {
      setScratched(true);
      setTimeout(() => setShowModal(true), 600);
    }
  };

  const buyTicket = () => {
    if (coins < 50) return;
    onCoinsChange(-50);
    setTicketBought(true);
    setScratched(false);
    setScratchPct(0);
    setShowModal(false);
  };

  return (
    <>
      <div className="arcade-game-stage">
        <div className="arcade-stage-header scratch-header">
          <h2>🪄 Gosok & Menang</h2>
          <p>{ticketBought ? `Gosok kartu untuk mengungkap hadiah! (${scratchPct}% tergosok)` : 'Beli tiket dan gosok untuk menangkan hadiah!'}</p>
        </div>
        <div className="scratch-arena">
          <div className="scratch-ticket">
            <div className="scratch-ticket-header">
              <span className="scratch-ticket-logo">GAMORA</span>
              <span className="scratch-ticket-title">LUCKY SCRATCH</span>
              <span className="scratch-ticket-serial">#GCR-{serial}</span>
            </div>
            <div className="scratch-ticket-body">
              <div className="scratch-zone" style={{ position: 'relative' }}>
                {/* Prize underneath */}
                <div className="scratch-prize-under">
                  <span style={{ fontSize: '2.5rem' }}>{prize.emoji}</span>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>{prize.name}</span>
                </div>
                {/* Canvas overlay */}
                {ticketBought && (
                  <canvas
                    ref={canvasRef}
                    width={380}
                    height={120}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'crosshair', borderRadius: 10, touchAction: 'none' }}
                    onMouseDown={e => { setIsScratching(true); lastPos.current = null; }}
                    onMouseMove={scratch}
                    onMouseUp={() => { setIsScratching(false); lastPos.current = null; }}
                    onMouseLeave={() => { setIsScratching(false); lastPos.current = null; }}
                    onTouchStart={e => { e.preventDefault(); setIsScratching(true); lastPos.current = null; }}
                    onTouchMove={e => { e.preventDefault(); scratch(e); }}
                    onTouchEnd={() => { setIsScratching(false); lastPos.current = null; }}
                  />
                )}
                {!ticketBought && (
                  <div className="scratch-surface-new" onClick={buyTicket} style={{ cursor: 'pointer' }}>
                    <div className="scratch-pattern" />
                    <span className="scratch-hint-text">🎫 Beli Tiket Dulu!</span>
                  </div>
                )}
              </div>
              {ticketBought && !scratched && (
                <div style={{ marginTop: '0.8rem', background: '#e0f2fe', borderRadius: 8, padding: '0.4rem 1rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 600 }}>
                    💡 Gosok area di atas dengan mouse atau jari!
                  </span>
                </div>
              )}
            </div>
            <div className="scratch-ticket-footer">
              <span>Valid untuk 1 kali penggunaan</span>
              <span>Min. pembelian Rp 10.000</span>
            </div>
          </div>
        </div>
        <div className="arcade-stage-actions">
          <button
            className={`arcade-action-btn scratch-action ${coins < 50 ? 'disabled' : ''}`}
            onClick={buyTicket}
            disabled={coins < 50}
          >
            <span className="action-label">{ticketBought ? '🔄 Tiket Baru' : 'Beli Tiket'}</span>
            <span className="action-cost">⭐ 50 Koin</span>
          </button>
        </div>
      </div>
      {showModal && (
        <PrizeModal prize={prize} onClose={() => setShowModal(false)} onPlayAgain={buyTicket} />
      )}
    </>
  );
}

// ─── Roulette Game ─────────────────────────────────────────────
export function RouletteGame({ coins, onCoinsChange }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const wheelRef = useRef(null);

  const spin = () => {
    if (isSpinning || coins < 200) return;
    onCoinsChange(-200);
    setIsSpinning(true);
    setShowModal(false);
    setPrize(null);

    const winIndex = Math.floor(Math.random() * ROULETTE_ITEMS.length);
    const segDeg = 360 / ROULETTE_ITEMS.length;
    // Extra full rotations (5-8) plus land on winner segment
    const extraSpins = (5 + Math.floor(Math.random() * 4)) * 360;
    const targetDeg = extraSpins + (360 - winIndex * segDeg - segDeg / 2);
    const newRotation = rotation + targetDeg;

    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setPrize(ROULETTE_ITEMS[winIndex]);
      setShowModal(true);
    }, 5000);
  };

  return (
    <>
      <div className="arcade-game-stage">
        <div className="arcade-stage-header roulette-header">
          <h2>🎡 Lucky Roulette</h2>
          <p>{isSpinning ? '🌀 Roda sedang berputar...' : 'Tekan tombol dan lihat keberuntunganmu!'}</p>
        </div>
        <div className="roulette-arena">
          <div className="roulette-wheel-wrap">
            <div className="roulette-outer-ring">
              <div
                ref={wheelRef}
                className="roulette-wheel-new"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                }}
              >
                {ROULETTE_ITEMS.map((item, i) => (
                  <div
                    key={i}
                    className="roulette-segment"
                    style={{
                      transform: `rotate(${i * 45}deg)`,
                      background: i % 2 === 0
                        ? 'linear-gradient(135deg, #7c3aed, #5b21b6)'
                        : 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                    }}
                  >
                    <div className="roulette-segment-text" style={{ transform: 'rotate(22.5deg)' }}>
                      {item.emoji}
                    </div>
                  </div>
                ))}
                <div className="roulette-hub" onClick={spin} style={{ cursor: isSpinning || coins < 200 ? 'not-allowed' : 'pointer' }}>
                  <div className="roulette-hub-inner">{isSpinning ? '...' : 'PUTAR'}</div>
                </div>
              </div>
              <div className="roulette-marker">▼</div>
            </div>
            <div className="roulette-shadow" />
          </div>
          <div className="roulette-legend">
            {ROULETTE_ITEMS.map((item, i) => (
              <div key={i} className="roulette-legend-item">
                <div className={`legend-dot ${i % 2 === 0 ? 'dot-purple' : 'dot-blue'}`} />
                {item.emoji} {item.name}
              </div>
            ))}
          </div>
        </div>
        <div className="arcade-stage-actions">
          <button
            className={`arcade-action-btn roulette-action ${isSpinning || coins < 200 ? 'disabled' : ''}`}
            onClick={spin}
            disabled={isSpinning || coins < 200}
          >
            <span className="action-label">{isSpinning ? '🌀 Berputar...' : 'Putar Roda'}</span>
            <span className="action-cost">⭐ 200 Koin</span>
          </button>
        </div>
      </div>
      {showModal && (
        <PrizeModal prize={prize} onClose={() => setShowModal(false)} onPlayAgain={spin} />
      )}
    </>
  );
}
