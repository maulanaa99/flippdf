# Product Requirements Document

## Buku Yasin Digital dengan Tampilan Flipbook

**Versi:** 2.0 — Revisi sesuai kebutuhan buku Yasin digital  
**Tanggal:** 24 September 2026  
**Jenis solusi:** Satu publikasi web dari PDF buku Yasin  
**Pembaca:** Masyarakat yang menerima tautan atau QR code  
**Akses pembaca:** Tanpa akun, melalui browser internet

PRD ini menetapkan kebutuhan untuk menerbitkan satu buku Yasin dari PDF sebagai bacaan digital yang dapat dibuka kapan saja melalui tautan web. Fokus produk adalah pengalaman membaca yang menyerupai buku dengan efek membalik halaman, nyaman di ponsel dan komputer, serta mudah dibagikan. Dokumen ini tidak mencakup pembuatan platform flipbook umum.

## 1. Tujuan

Menyediakan buku Yasin digital yang terasa seperti membuka buku, tetapi dapat dibaca melalui browser dari berbagai perangkat dan lokasi. Pengguna cukup membuka tautan atau memindai QR code; tidak perlu mengunduh aplikasi.

## 2. Ruang Lingkup

### Termasuk

- Menggunakan PDF buku Yasin yang disediakan sebagai sumber isi.
- Menampilkan halaman PDF dalam pembaca flipbook HTML5 dengan efek balik halaman.
- Mendukung layar ponsel, tablet, dan komputer; tata letak menyesuaikan ukuran layar.
- Menyediakan navigasi halaman, tombol sebelumnya/berikutnya, daftar thumbnail, dan zoom.
- Menyediakan mode geser atau scroll sebagai cara baca alternatif di ponsel.
- Menerbitkan satu tautan web yang dapat diakses publik dan satu QR code untuk tautan tersebut.
- Memuat sampul, judul publikasi, serta ikon berbagi/salin tautan yang sederhana.
- Menyediakan akses admin terbatas untuk mengunggah atau mengganti PDF dan memeriksa tampilan sebelum publikasi.

### Tidak termasuk

- Layanan umum untuk membuat banyak flipbook oleh banyak pengguna.
- Akun pembaca, komentar, catatan, profil, atau forum.
- Editor isi PDF, penerjemahan, OCR untuk mengubah teks, atau pengubahan ayat/doa.
- Fitur multimedia, iklan, toko, monetisasi, dan analitik pembaca yang rinci.
- Aplikasi iOS/Android dan membaca offline pada tahap awal.

## 3. Pengguna dan Alur

| Pengguna | Kebutuhan |
|---|---|
| Pembaca | Membuka tautan/QR, membaca halaman, memperbesar teks/gambar, dan berpindah halaman dengan mudah. |
| Admin/pengelola | Mengunggah PDF final, melihat pratinjau, menerbitkan, dan mengganti file bila ada revisi resmi. |

**Alur pembaca:** pindai QR atau buka tautan → halaman sampul tampil → balik/geser halaman atau pilih nomor halaman → tutup browser kapan saja. Tautan yang sama tetap digunakan saat PDF diperbarui.

## 4. Persyaratan Produk

| ID | Kebutuhan | Prioritas | Kriteria penerimaan |
|---|---|---:|---|
| YAS-01 | Publikasi PDF | P0 | Admin dapat mengunggah PDF dan melihat pratinjau sebelum menerbitkan. |
| YAS-02 | Tampilan buku | P0 | Halaman dapat dibalik dengan animasi halus pada browser desktop dan mobile. |
| YAS-03 | Navigasi | P0 | Pembaca dapat maju/mundur, membuka halaman tertentu, melihat total halaman, dan memakai thumbnail. |
| YAS-04 | Pembacaan mobile | P0 | Konten muat pada layar ponsel; kontrol mudah disentuh; tersedia mode geser/scroll dan zoom. |
| YAS-05 | Tautan publik | P0 | Pembaca tidak perlu login; tautan dapat dibuka dari browser modern melalui internet. |
| YAS-06 | QR code | P0 | QR mengarah ke tautan publik yang benar dan dapat diunduh untuk dicetak/dibagikan. |
| YAS-07 | Keutuhan isi | P0 | PDF ditampilkan tanpa mengubah teks, urutan halaman, harakat, atau tata letak sumber. |
| YAS-08 | Penggantian PDF | P1 | Admin dapat mengganti PDF setelah revisi disetujui; tautan publik tidak berubah. |
| YAS-09 | Performa | P1 | Sampul tampil dahulu, halaman lain dimuat bertahap; pembaca melihat indikator saat halaman sedang dimuat. |

## 5. Persyaratan Kualitas

| Area | Kebutuhan |
|---|---|
| Ketersediaan | Tautan publik harus dapat diakses kapan saja dengan hosting yang terus aktif dan pemantauan dasar. |
| Kecepatan | Halaman pertama dimuat lebih dahulu; gambar halaman berikutnya dimuat bertahap untuk mengurangi waktu tunggu. |
| Kompatibilitas | Mendukung versi terbaru Chrome, Safari, Edge, dan Firefox pada ponsel, tablet, serta komputer. |
| Keamanan | Admin memakai autentikasi; hanya admin yang dapat mengganti dokumen; koneksi menggunakan HTTPS. |
| Keutuhan dokumen | Simpan PDF asli sebagai sumber; validasi jumlah halaman dan cek sampel halaman sebelum tayang. |
| Aksesibilitas | Tombol memiliki label jelas; kontrol utama bisa digunakan dengan keyboard; hormati pengaturan reduced motion bila tersedia. |

## 6. Aturan Konten dan Akses

- Publikasi dapat dibuka siapa saja yang memiliki tautan; tidak dibutuhkan akun pembaca.
- PDF final menjadi sumber resmi tampilan. Sistem tidak melakukan OCR atau koreksi otomatis pada isi.
- Penggantian file dilakukan hanya setelah pengelola memastikan versi baru benar.
- Sebelum menerbitkan, admin memastikan izin penggunaan dan distribusi PDF sudah tersedia.
- Gunakan satu URL tetap agar QR cetak tidak perlu diganti ketika PDF diperbarui.

## 7. Ukuran Keberhasilan

| Metrik | Sasaran pilot |
|---|---|
| Keberhasilan membuka tautan | ≥ 99% pada uji browser/perangkat yang didukung |
| Kejelasan pengalaman baca | Pengguna uji dapat membuka, mengganti halaman, dan zoom tanpa bantuan |
| Konsistensi isi | Tidak ada halaman hilang, tertukar, atau berubah dibanding PDF sumber |
| Kesiapan berbagi | QR dan tautan berhasil membuka publikasi dari ponsel di luar jaringan pengelola |

## 8. Skenario Uji Sebelum Publikasi

1. Bandingkan jumlah halaman flipbook dengan jumlah halaman PDF.
2. Periksa sampul, halaman awal, beberapa halaman tengah, dan halaman terakhir; pastikan teks dan harakat tetap terbaca.
3. Uji balik halaman, geser, zoom, thumbnail, dan navigasi nomor halaman.
4. Buka tautan dan QR pada Android/iPhone serta komputer tanpa login.
5. Uji jaringan lambat untuk memastikan indikator pemuatan tampil dan halaman tidak rusak.
6. Ganti PDF melalui admin dan pastikan URL serta QR tetap sama.

## 9. Keputusan Implementasi yang Perlu Dikonfirmasi

- Lokasi hosting dan domain/URL publik untuk buku Yasin.
- File PDF final yang akan menjadi sumber publikasi.
- Nama atau logo yang ingin ditampilkan pada sampul/halaman publikasi.
- Apakah tautan memang boleh diakses publik oleh siapa pun yang memilikinya.
