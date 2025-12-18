// app/pusat-bantuan/helpCategories.ts

export const helpCategories = {
  akun: {
    title: "Akun & Keamanan",
    items: [
      {
        slug: "lupa-password",
        title: "Lupa Password",
        keywords: ["lupa password", "reset password", "password salah", "ganti password"],
        summary: "Cara reset password akun KOJE24 jika lupa.",
        content: `
## Cara Mengatasi Lupa Password

1. Buka halaman login KOJE24.
2. Klik **Lupa Password**.
3. Masukkan email yang terdaftar di KOJE24.
4. Cek email masuk → klik link reset password.
5. Buat password baru dan login kembali.

**Catatan:** Jika email tidak masuk, cek folder spam atau gunakan fitur *kirim ulang*.`
      },
      {
        slug: "ubah-data-akun",
        title: "Mengubah Data Akun",
        keywords: ["ubah data", "edit akun", "ganti nomor", "ganti email"],
        summary: "Panduan mengganti nama, email, atau nomor WhatsApp.",
        content: `
## Cara Mengubah Data Akun

1. Login ke akun KOJE24.
2. Buka menu **Profil Saya**.
3. Pilih data yang ingin diubah — nama, email, atau nomor WhatsApp.
4. Klik **Simpan Perubahan**.

Data akan tersimpan secara otomatis di sistem KOJE24.`
      },
      {
        slug: "keamanan-akun",
        title: "Tips Keamanan Akun",
        keywords: ["keamanan akun", "akun dibajak", "akun aman", "otp"],
        summary: "Cara menjaga akun tetap aman dari penyalahgunaan.",
        content: `
## Tips Keamanan Akun KOJE24

- Gunakan password yang kuat dan tidak mudah ditebak.
- Jangan bagikan OTP atau link login kepada siapapun.
- Logout setelah menggunakan device umum.
- Jika merasa akun disusupi, segera ganti password.`
      },
      {
        slug: "hapus-akun",
        title: "Menghapus Akun KOJE24",
        keywords: ["hapus akun", "tutup akun", "nonaktif akun"],
        summary: "Cara menghapus atau menonaktifkan akun.",
        content: `
## Cara Menghapus Akun KOJE24

Jika ingin menghapus akun:

1. Hubungi Admin KOJE24 melalui chat.
2. Berikan email yang digunakan di KOJE24.
3. Admin akan memproses permintaan penghapusan.

**Catatan:** Data yang telah dihapus tidak bisa dikembalikan.`
      },
      {
        slug: "verifikasi-email",
        title: "Verifikasi Email",
        keywords: ["verifikasi email", "email tidak terverifikasi", "aktivasi email"],
        summary: "Cara verifikasi email agar pesanan aman.",
        content: `
## Cara Verifikasi Email KOJE24

1. Buka kotak masuk email.
2. Cari pesan dari KOJE24.
3. Klik tombol **Verifikasi Email**.

Jika tidak ada email, gunakan fitur **Kirim Ulang Verifikasi** di halaman profil.`
      }
    ]
  },

  pembayaran: {
    title: "Pembayaran",
    items: [
      {
        slug: "metode-pembayaran",
        title: "Metode Pembayaran",
        keywords: ["cara bayar", "metode bayar", "transfer", "qris", "ewallet"],
        summary: "Daftar metode pembayaran yang tersedia.",
        content: `
## Metode Pembayaran KOJE24

- Transfer Bank (BCA, Mandiri)
- QRIS
- E-Wallet (OVO, Dana, GoPay)

Pastikan nama pengirim sesuai agar verifikasi cepat.`
      },
      {
        slug: "pembayaran-gagal",
        title: "Pembayaran Gagal",
        keywords: ["bayar gagal", "pembayaran gagal", "saldo terpotong"],
        summary: "Cara penyelesaian jika pembayaran gagal.",
        content: `
## Pembayaran Gagal

Jika pembayaran ditolak:

1. Cek saldo / limit e-wallet.
2. Coba ulang dalam 1 menit.
3. Jika sudah terdebet → kirim bukti transfer ke Admin.

Admin akan verifikasi maksimal 10 menit.`
      },
      {
        slug: "tagihan-tidak-muncul",
        title: "Tagihan Tidak Muncul",
        keywords: ["invoice tidak muncul", "tagihan kosong", "checkout error"],
        summary: "Invoice tidak keluar saat checkout?",
        content: `
## Tagihan Tidak Muncul

1. Refresh halaman.
2. Pastikan koneksi stabil.
3. Coba checkout ulang.
4. Jika tetap gagal → kirim screenshot ke Admin.`
      },
      {
        slug: "pembayaran-dobel",
        title: "Pembayaran Dobel",
        keywords: ["pembayaran dobel", "uang terpotong dua kali", "bayar 2x", "double payment"],
        summary: "Ketika uang terpotong dua kali.",
        content: `
## Pembayaran Dobel

Jika uang terdebet 2 kali:

- Kirim dua bukti transaksi.
- Admin akan cek keuangan KOJE24.
- Refund akan diproses maksimal 1×24 jam.`
      },
      {
        slug: "konfirmasi-manual",
        title: "Konfirmasi Pembayaran Manual",
        keywords: ["konfirmasi manual", "bukti transfer", "verifikasi manual"],
        summary: "Cara mempercepat verifikasi pembayaran.",
        content: `
## Konfirmasi Manual

Jika pembayaran tidak terdeteksi:

- Kirim foto bukti transfer.
- Sertakan nama pengirim & jumlah pembayaran.
- Admin akan input manual dalam 3–5 menit.`
      }
    ]
  }
}
