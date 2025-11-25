export const helpCategories = {
  akun: {
    title: "Akun & Keamanan",
    items: [
      {
        slug: "lupa-password",
        title: "Lupa Password",
        summary: "Cara reset password jika kamu lupa password akun KOJE24.",
        content: `
## Cara Mengatasi Lupa Password
1. Buka halaman login KOJE24.
2. Klik **"Lupa Password"**.
3. Masukkan email yang terdaftar.
4. Cek email dan klik link reset password.
5. Buat password baru.

Jika email tidak masuk: cek spam atau hubungi Admin KOJE24.
`
      },
      {
        slug: "ganti-email",
        title: "Ganti Email Akun",
        summary: "Panduan mengganti email lama dengan email baru.",
        content: `
## Cara Mengganti Email Akun KOJE24
1. Login ke akun KOJE24 kamu.
2. Buka menu **Profil → Pengaturan Akun**.
3. Masukkan email baru.
4. Verifikasi email baru melalui link yang dikirimkan.

Jika kesulitan, admin bisa bantu migrasi akunmu. 
`
      },
      {
        slug: "akun-terkunci",
        title: "Akun Terkunci",
        summary: "Akunmu terkunci karena salah password berulang? Ini solusinya.",
        content: `
## Mengatasi Akun Terkunci
Akun terkunci terjadi jika 5 kali salah password.

Cara membuka:
1. Tunggu 10 menit dan coba login kembali.
2. Jika masih terkunci, lakukan reset password.
3. Jika gagal, hubungi Admin KOJE24 untuk verifikasi manual.
`
      },
      {
        slug: "verifikasi-email",
        title: "Verifikasi Email",
        summary: "Belum dapat email verifikasi? Ikuti langkah berikut.",
        content: `
## Solusi Email Verifikasi Tidak Masuk
1. Cek folder **Spam / Junk / Promotions**.
2. Klik "Kirim Ulang Email Verifikasi".
3. Pastikan email kamu aktif.
4. Jika tidak muncul juga, hubungi Admin KOJE24.

`
      },
      {
        slug: "hapus-akun",
        title: "Hapus Akun Permanen",
        summary: "Cara menghapus akun KOJE24 secara permanen.",
        content: `
## Cara Hapus Akun
1. Kirim permintaan penghapusan akun melalui Admin.
2. Data pesanan & histori akan dihapus permanen.
3. Proses 1×24 jam.

Catatan: Aksi ini tidak dapat dibatalkan.
`
      },
    ],
  },

  pesanan: {
    title: "Pesanan",
    items: [
      {
        slug: "cek-status",
        title: "Cara Cek Status Pesanan",
        summary: "Lihat apakah pesananmu sedang diproses, dikirim, atau selesai.",
        content: `
## Cara Cek Status Pesanan
1. Buka halaman keranjang atau menu Riwayat Pesanan.
2. Temukan pesanan yang ingin kamu cek.
3. Status yang muncul:
   - Diproses
   - Siap Dikirim
   - Dalam Pengiriman
   - Selesai

Jika status tidak berubah, hubungi Admin KOJE24.
`
      },
      {
        slug: "ubah-alamat",
        title: "Ubah Alamat Setelah Checkout",
        summary: "Bisa ubah alamat? Bisa, tapi ada syaratnya.",
        content: `
## Cara Mengubah Alamat Setelah Checkout
1. Jika pesanan **belum diproses**, masih bisa diubah.
2. Chat Admin KOJE24 secepat mungkin.
3. Jika pesanan sudah dikirim, alamat **tidak bisa diubah**.

Saran: Pastikan alamat lengkap & nomor HP aktif.
`
      },
      {
        slug: "double-order",
        title: "Pesanan Terkirim Dua Kali",
        summary: "Kamu checkout dua kali tanpa sengaja? Begini solusinya.",
        content: `
## Solusi Pesanan Tergandakan
1. Jangan panik — ini bisa dibatalkan.
2. Chat Admin KOJE24 dengan menyebutkan nomor pesanan.
3. Pilih:
   - Refund penuh
   - Tukar ke varian lain
   - Jadwalkan untuk hari berikutnya

`
      },
      {
        slug: "pesanan-tidak-masuk",
        title: "Pesanan Tidak Muncul di Sistem",
        summary: "Sudah bayar tapi pesanan tidak muncul?",
        content: `
## Jika Pesanan Tidak Muncul
1. Screenshot bukti pembayaran.
2. Chat Admin KOJE24.
3. Pesanan akan dibuatkan manual sesuai data pembayaran.

`
      },
      {
        slug: "ubah-jadwal-kirim",
        title: "Ubah Jadwal Kirim",
        summary: "Mau geser jadwal kirim? Bisa!",
        content: `
## Cara Mengubah Jadwal Kirim
1. Chat Admin KOJE24 sebelum jam 22.00.
2. Jadwal bisa dipindah ke hari berikutnya.
3. Untuk pesanan langganan, bisa dijadwalkan mingguan.

`
      },
    ],
  },

  pembayaran: {
    title: "Pembayaran",
    items: [
      {
        slug: "metode-pembayaran",
        title: "Metode Pembayaran KOJE24",
        summary: "Transfer bank, e-wallet, dan pembayaran otomatis.",
        content: `
## Metode Pembayaran Tersedia
- BCA
- Mandiri
- OVO
- Dana
- QRIS

Admin akan verifikasi otomatis dalam 1–5 menit.
`
      },
      {
        slug: "pembayaran-gagal",
        title: "Pembayaran Gagal",
        summary: "Uang kepotong tapi pesanan tidak masuk?",
        content: `
## Mengatasi Pembayaran Gagal
1. Screenshot bukti pembayaran.
2. Chat Admin KOJE24.
3. Jika dana masuk ke KOJE24, pesanan akan dibuat manual.
4. Jika dana tidak masuk, refund akan diproses.

`
      },
      {
        slug: "refund-pembayaran",
        title: "Refund Pembayaran",
        summary: "Cara mengajukan refund pembayaran.",
        content: `
## Cara Refund
1. Siapkan bukti transfer & nomor pesanan.
2. Admin akan cek transaksi.
3. Dana dikembalikan dalam 1–3 hari kerja.

`
      },
      {
        slug: "promo-tidak-masuk",
        title: "Kode Promo Tidak Berfungsi",
        summary: "Promo error? Ini solusinya.",
        content: `
## Mengatasi Promo Tidak Berfungsi
1. Pastikan promo masih berlaku.
2. Pastikan varian sesuai syarat promo.
3. Chat admin jika promo tidak masuk otomatis.

`
      },
      {
        slug: "konfirmasi-manual",
        title: "Konfirmasi Pembayaran Manual",
        summary: "Jika transfer tapi tidak terdeteksi sistem.",
        content: `
## Konfirmasi Manual
1. Kirim bukti pembayaran.
2. Admin input secara manual.
3. Pesanan langsung diproses.

`
      },
    ],
  },

  pengiriman: {
    title: "Pengiriman",
    items: [
      {
        slug: "jadwal-kirim",
        title: "Jadwal Pengiriman",
        summary: "Kapan pesanan kamu dikirim?",
        content: `
## Jadwal Pengiriman KOJE24
- Senin – Sabtu
- Pengiriman mulai jam 08.00 – 13.00
- Minggu LIBUR

Kurir akan menghubungi jika sudah dekat lokasi.
`
      },
      {
        slug: "cek-resi",
        title: "Cek Resi",
        summary: "Cara melacak status pengiriman.",
        content: `
## Cara Cek Resi
1. Buka menu pesanan.
2. Klik nomor resi.
3. Lacak lokasi paket realtime.

Jika resi belum muncul, pesanan masih diproses.
`
      },
      {
        slug: "alamat-tidak-ditemukan",
        title: "Kurir Tidak Menemukan Alamat",
        summary: "Kurir KOJE24 tidak bisa menemukan rumahmu?",
        content: `
## Cara Mengatasi Kurir Tidak Menemukan Alamat
1. Pastikan nomor HP aktif.
2. Berikan patokan lokasi (gerbang, gang, warna pagar).
3. Jika perlu, share location lewat WA.

`
      },
      {
        slug: "kirim-ulang",
        title: "Kirim Ulang Pesanan",
        summary: "Kurir gagal antar? Bisa kirim ulang.",
        content: `
## Kirim Ulang Pesanan
1. Kurir akan coba 1×.
2. Jika gagal, pesanan bisa dijadwalkan ulang.
3. Admin akan hubungi kamu sebelum kirim ulang.

`
      },
      {
        slug: "ubah-lokasi",
        title: "Ubah Lokasi Pengiriman",
        summary: "Mau kirim ke alamat berbeda?",
        content: `
## Ubah Lokasi
1. Bisa diubah jika pesanan belum dikirim.
2. Chat admin untuk update alamat.
3. Jika sudah dikirim, tidak bisa diubah.

`
      },
    ],
  },

  refund: {
    title: "Pengembalian Dana",
    items: [
      {
        slug: "syarat-refund",
        title: "Syarat Refund",
        summary: "Berbagai kondisi yang memungkinkan refund.",
        content: `
## Syarat Refund
- Kesalahan produksi
- Pesanan salah
- Kualitas tidak layak
- Sistem error

`
      },
      {
        slug: "produk-rusak",
        title: "Produk Rusak",
        summary: "Jus bocor atau rusak? Begini solusinya.",
        content: `
## Produk Rusak Saat Diterima
1. Foto produk dan kemasan.
2. Kirim ke Admin KOJE24.
3. Kamu bisa pilih: Kirim ulang atau refund.

`
      },
      {
        slug: "pesanan-salah",
        title: "Pesanan Salah",
        summary: "Pesanan tidak sesuai? Tukar gratis.",
        content: `
## Pesanan Salah
1. Foto pesanan yang salah.
2. Admin akan cek.
3. Kurir akan kirim varian yang benar GRATIS.

`
      },
      {
        slug: "harga-berbeda",
        title: "Harga Berbeda",
        summary: "Harga tidak sesuai invoice?",
        content: `
## Harga Tidak Sesuai
Jika ada perbedaan harga:
1. Screenshot harga & invoice.
2. Admin cek sistem.
3. Selisih akan direfund.

`
      },
      {
        slug: "refund-proses",
        title: "Berapa Lama Refund?",
        summary: "Informasi timeline refund.",
        content: `
## Lama Proses Refund
1–3 hari kerja setelah verifikasi.

`
      },
    ],
  },

  komplain: {
    title: "Komplain Pesanan",
    items: [
      {
        slug: "kurang-produk",
        title: "Produk Kurang",
        summary: "Botol kurang? Ateni cuy, ini cara klaim.",
        content: `
## Mengatasi Produk Kurang
1. Foto seluruh botol.
2. Admin cek bukti packing.
3. Botol kurang akan dikirim ulang GRATIS.

`
      },
      {
        slug: "rasa-aneh",
        title: "Rasa Tidak Sesuai",
        summary: "Rasa aneh atau berubah? Solusinya begini.",
        content: `
## Jika Rasa Tidak Sesuai
1. Foto botol & batch code.
2. Admin cek produksi.
3. Kamu bisa pilih: Tukar atau refund.

`
      },
      {
        slug: "segel-rusak",
        title: "Segel Rusak",
        summary: "Botol bocor atau segel rusak?",
        content: `
## Jika Segel Rusak
1. Foto segel & botol.
2. Admin cek.
3. Kirim ulang GRATIS.

`
      },
      {
        slug: "pesanan-telat",
        title: "Pengiriman Telat",
        summary: "Pengiriman lewat dari jadwal?",
        content: `
## Jika Pengiriman Telat
1. Cek status resi.
2. Jika jauh dari estimasi, admin akan bantu cek kurir.
3. Jika telat lebih dari 3 jam → kompensasi voucher.

`
      },
      {
        slug: "komplain-lain",
        title: "Komplain Lainnya",
        summary: "Tidak ada di daftar? Tenang, ada solusinya.",
        content: `
## Komplain Lainnya
Chat admin KOJE24 dan jelaskan kendalamu.

`
      },
    ],
  },

  promo: {
    title: "Promosi",
    items: [
      {
        slug: "cara-pakai-promo",
        title: "Cara Pakai Kode Promo",
        summary: "Masukkan kode promo saat checkout.",
        content: `
## Cara Menggunakan Promo
1. Masukkan kode pada kolom promo.
2. Pastikan promo masih berlaku.
3. Harga akan otomatis terpotong.

`
      },
      {
        slug: "promo-tidak-masuk",
        title: "Promo Tidak Masuk",
        summary: "Sudah masukkan promo tapi gagal?",
        content: `
## Promo Tidak Masuk
1. Pastikan varian memenuhi syarat promo.
2. Pastikan tidak expired.
3. Jika error, hubungi admin.

`
      },
      {
        slug: "langganan-diskon",
        title: "Diskon Langganan",
        summary: "Langganan mingguan lebih murah, ini caranya.",
        content: `
## Cara Mendapat Diskon Langganan
1. Pilih paket langganan.
2. Diskon otomatis muncul.
3. Nikmati hemat sampai 25%.

`
      },
      {
        slug: "voucher",
        title: "Voucher Store",
        summary: "Cara pakai voucher yang kamu punya.",
        content: `
## Cara Menggunakan Voucher
1. Klik voucher yang tersedia.
2. Pastikan sesuai syarat.
3. Voucher otomatis aktif.

`
      },
      {
        slug: "promo-khusus",
        title: "Promo Khusus Member",
        summary: "Promo spesial untuk member KOJE24.",
        content: `
## Promo Khusus Member
- Diskon eksklusif
- Bonus botol
- Early access produk

`
      },
    ],
  },

  lainnya: {
    title: "Lainnya",
    items: [
      {
        slug: "tentang-koje24",
        title: "Apa Itu KOJE24?",
        summary: "Tentang brand KOJE24 secara lengkap.",
        content: `
## Apa Itu KOJE24?
KOJE24 adalah brand cold-pressed juice natural dari bahan segar tanpa gula tambahan dan tanpa pengawet.
`
      },
      {
        slug: "cara-simpan",
        title: "Cara Penyimpanan Jus",
        summary: "Biar rasa & nutrisi tetap maksimal.",
        content: `
## Cara Menyimpan Jus KOJE24
1. Simpan di chiller 0–4°C.
2. Jangan dibiarkan di suhu ruang.
3. Konsumsi 2–3 hari setelah produksi.

`
      },
      {
        slug: "manfaat",
        title: "Manfaat Jus KOJE24",
        summary: "Untuk detox, imun, stamina, dan kesehatan pencernaan.",
        content: `
## Manfaat KOJE24
- Detox
- Imunitas
- Pencernaan
- Energi harian
`
      },
      {
        slug: "kontak-admin",
        title: "Kontak Admin",
        summary: "Hubungi KOJE24 langsung.",
        content: `
## Cara Hubungi Admin
WA Admin: 0822-1313-9580
`
      },
      {
        slug: "cara-minum",
        title: "Cara Minum Jus KOJE24",
        summary: "Biar manfaatnya maksimal.",
        content: `
## Cara Minum
1. Kocok ringan sebelum diminum.
2. Minum pagi sebelum makan.
3. Bisa campur dengan es.

`
      },
    ],
  },
}
