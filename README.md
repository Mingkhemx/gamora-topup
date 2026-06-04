<div align="center">

<img src="public/logo.png" alt="Gamora Store Logo" width="100" />

# 🎮 Gamora Store

### Platform Top-Up Game Terdepan di Asia Tenggara

[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/License-Private-red?style=flat-square)](.)

> Top up game favoritmu dengan harga terbaik, proses instan, dan 100% aman.

</div>

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🔐 **Auth Multi-Platform** | Login via Google, Facebook, LINE, X, Apple, atau Email |
| 🛒 **Keranjang & Checkout** | Cart dengan halaman payment lengkap |
| ⚡ **Beli Sekarang** | Checkout instan langsung dari halaman produk |
| 🎰 **Gamora Arcade** | Mystery Box, Scratch Card, Roulette dengan Gamora Coins |
| 🎁 **Sistem Promo** | Kode promo dengan diskon % atau nominal langsung |
| 💰 **Gamora Coins** | Saldo coins per-akun tersimpan di database |
| 📊 **Admin Dashboard** | Manajemen produk, banner, promo, transaksi & pengguna |
| 🌏 **Multi Bahasa** | ID, EN, MY, SG, TH, PH |
| 🔔 **Custom Alert System** | Toast notification & dialog konfirmasi tanpa browser alert |
| 📱 **Responsive** | Optimal di desktop dan mobile |

---

## 🛠 Tech Stack

```
Frontend   : React 19 + Vite 8
Styling    : CSS Modules + Custom Design System
Icons      : Lucide React
Backend    : Supabase (PostgreSQL + Auth + Storage + Realtime)
Auth       : Supabase Auth (OAuth 2.0 PKCE Flow)
Storage    : Supabase Storage (banners, products)
```

---

## 📁 Struktur Proyek

```
topup-gamora/
├── public/
│   ├── payment/          # Logo metode pembayaran
│   ├── logo.png          # Logo utama
│   └── logo-header.png   # Logo header
├── src/
│   ├── App.jsx           # Root component + routing + auth
│   ├── main.jsx          # Entry point + AlertProvider
│   ├── i18n.js           # Translations (6 bahasa)
│   ├── supabaseClient.js # Supabase client config
│   ├── index.css         # Global styles
│   │
│   ├── AdminDashboard.jsx   # Dashboard admin lengkap
│   ├── AlertSystem.jsx      # Custom toast & dialog system
│   ├── ArcadeGames.jsx      # Mini games (gacha)
│   ├── AuthModal.jsx        # Modal login/register
│   ├── BuyCoinsPage.jsx     # Halaman top-up coins
│   ├── CartDrawer.jsx       # Drawer keranjang belanja
│   ├── LiveChat.jsx         # Widget live chat
│   ├── PaymentPage.jsx      # Halaman checkout/pembayaran
│   ├── ProductDetail.jsx    # Detail produk + order
│   └── UserProfile.jsx      # Halaman profil pengguna
└── package.json
```

---

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js 18+
- Akun Supabase

### 1. Clone & Install

```bash
git clone <repo-url>
cd topup-gamora
npm install
```

### 2. Konfigurasi Environment

Buat file `.env` di root project:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Setup Database Supabase

Jalankan SQL berikut di **Supabase SQL Editor**:

```sql
-- Tabel profiles
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  avatar_url text,
  email text,
  phone text,
  coins integer DEFAULT 0,
  role text DEFAULT 'user',
  providers text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabel transaksi
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  game text NOT NULL,
  item_name text NOT NULL,
  price numeric DEFAULT 0,
  status text DEFAULT 'pending',
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Tabel promo
CREATE TABLE public.promos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  discount_type text DEFAULT 'percent',
  discount_value numeric DEFAULT 0,
  expiry_date timestamptz,
  image_url text,
  category text DEFAULT 'Diskon',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabel gacha history
CREATE TABLE public.gacha_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_type text NOT NULL,
  bet_amount integer DEFAULT 0,
  win_amount integer DEFAULT 0,
  prize_name text,
  result text DEFAULT 'lose',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS semua tabel
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gacha_history ENABLE ROW LEVEL SECURITY;
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173)

### 5. Build Production

```bash
npm run build
```

---

## 🔑 Admin Dashboard

Akses admin di `/admin` — login menggunakan akun Supabase dengan role `admin`.

Untuk set akun sebagai admin:
```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
```

Fitur admin:
- 📊 Dashboard dengan statistik real-time
- 📦 Manajemen produk (CRUD + upload gambar)
- 🖼 Manajemen banner halaman utama
- 🎁 Manajemen kode promo
- 💳 Monitoring semua transaksi + ekspor CSV
- 👥 Manajemen pengguna + provider info

---

## 🌏 Bahasa yang Didukung

| Kode | Bahasa |
|------|--------|
| ID | Bahasa Indonesia |
| EN | English |
| MY | Bahasa Malaysia |
| SG | Singapore English |
| TH | ภาษาไทย (Thai) |
| PH | Filipino |

---

## 💳 Metode Pembayaran

- **Transfer Bank**: BCA, BNI, BRI, Mandiri, Permata Virtual Account
- **E-Wallet**: GoPay, OVO, DANA, ShopeePay, LinkAja
- **Minimarket**: Alfamart, Indomaret
- **QRIS**: Semua bank & e-wallet

---

## 📸 Screenshot

| Halaman | Deskripsi |
|---------|-----------|
| 🏠 Beranda | Grid produk game populer dengan banner carousel |
| 🎮 Produk Detail | Step-by-step order dengan pilihan paket & pembayaran |
| 💳 Payment | Checkout dengan kode promo & multiple metode |
| 👤 Profile | Data akun, riwayat transaksi, pusat akun |
| 🎰 Gacha | Arcade games dengan Gamora Coins |
| ⚙️ Admin | Dashboard lengkap dengan statistik & manajemen |

---

## 📄 Lisensi

Proyek ini bersifat **private** dan hak cipta dilindungi.

---

<div align="center">

### 🙌 Tim Pengembang

<br/>

**Powered by** [MigwaraDev](https://github.com/migwara) &nbsp;|&nbsp; **Supported by** Vinxzz

<br/>

*Built with ❤️ using React + Supabase*

<br/>

© 2026 Gamora Store. All rights reserved.

</div>
