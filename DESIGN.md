# Panduan Desain: Buku Yasin Digital

> Arah visual dan karakter desain Buku Yasin Digital sesuai panduan antislop-ui.

## 1. Identitas & Karakter
- **Produk:** Publikasi digital Surat Yasin, Tahlil, dan Doa berbasis web dengan pembaca flipbook interaktif.
- **Audiens:** Masyarakat umum, jemaah tahlil, dan keluarga yang membaca melalui smartphone maupun komputer secara instan tanpa perlu login.
- **Karakter:** Khidmat, tenang, bersih, bersahaja, menghormati naskah suci, dan nyaman dibaca dalam durasi panjang.

## 2. Dials (Tingkat Ketegasan)
- **ENERGY:** 1 (Calm, hening, tanpa elemen yang berteriak atau mengganggu kekhusyukan membaca)
- **RHYTHM:** 2 (Balanced, fokus penuh pada lembaran buku dengan bilah kontrol yang rapi dan terukur)
- **MOTION:** 1 (Motion bertujuan fungsional: animasi balik halaman yang natural, transisi modal yang lembut, tanpa efek loop berulang)

## 3. Palet Warna
- **Latar Belakang Dasar (Canvas):** `#F7F4EE` (Parchment hangat, teduh di mata saat membaca ayat)
- **Warna Identitas Utama (Deep Slate Green):** `#162E24` (Warna hijau zaitun tua/islami klasik, teduh dan bermartabat)
- **Warna Teks Utama (Deep Ink):** `#1A1E1C` (Kontras tinggi memenuhi standar WCAG AA terhadap latar kertas)
- **Aksen Tunggal (Muted Brass Gold):** `#B88B4A` (Digunakan secara hemat untuk penanda halaman aktif, garis batas halus, dan ikon fokus)
- **Border & Pembatas (Subtle Stone):** `#E0D7C9`
- **Surface / Kontainer UI:** `#FFFFFF` dan `#F0EAE1`

## 4. Tipografi
- **Teks Arab:** Font Naskh/Amiri dengan perataan tengah dan ruang antar baris yang lega agar harakat terbaca jelas.
- **Judul & Ornamen:** Serif klasik (Cinzel / Amiri) untuk judul bab dan sampul.
- **Antarmuka & Kontrol:** Sans-serif humanis (Plus Jakarta Sans) untuk tombol, nomor halaman, dan dialog agar jelas terbaca pada layar sentuh ponsel.

## 5. Tata Letak & Motif Identitas
- **Motif Identitas:** Bingkai garis ganda berujung sudut geometris bersahaja (Islamic classic border) pada halaman sampul dan buku.
- **Fokus Tunggal:** Halaman buku selalu menjadi pusat perhatian utama.
- **Reflow Responsif:**
  - Desktop: Mode dua halaman berdampingan (spread) seperti membuka buku fisik.
  - Mobile: Mode satu halaman adaptif dengan opsi beralih antara flipbook dan scroll vertikal.
- **Ukuran Sentuh:** Tombol kontrol minimal 44x44px dengan ruang antar tombol yang cukup.
