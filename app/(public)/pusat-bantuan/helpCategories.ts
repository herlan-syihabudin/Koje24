export type HelpItem = {
  slug: string
  title: string
  keywords: string[]
  summary: string
  content: string
}

export type HelpCategory = {
  title: string
  items: HelpItem[]
}

export const helpCategories: Record<string, HelpCategory> = {
  akun: {
    title: "Akun & Keamanan",
    items: [
      {
        slug: "lupa-password",
        title: "Lupa Password",
        keywords: ["lupa password", "reset password", "password salah"],
        summary: "Cara reset password akun KOJE24 jika lupa.",
        content: `
## Cara Mengatasi Lupa Password

1. Buka halaman login KOJE24.
2. Klik **Lupa Password**.
3. Masukkan email terdaftar.
4. Cek email dan klik link reset.
5. Buat password baru dan login kembali.

Jika email tidak masuk, cek folder spam atau kirim ulang.
        `.trim(),
      },
      {
        slug: "ubah-data-akun",
        title: "Mengubah Data Akun",
        keywords: ["ubah data akun", "edit akun"],
        summary: "Panduan mengganti data akun KOJE24.",
        content: `
## Cara Mengubah Data Akun

1. Login ke akun KOJE24.
2. Masuk ke menu **Profil Saya**.
3. Edit data yang diperlukan.
4. Klik **Simpan**.
        `.trim(),
      },
      {
        slug: "keamanan-akun",
        title: "Tips Keamanan Akun",
        keywords: ["keamanan akun", "otp"],
        summary: "Tips menjaga akun tetap aman.",
        content: `
## Tips Keamanan Akun

- Jangan bagikan OTP.
- Gunakan password unik.
- Logout di perangkat umum.
        `.trim(),
      },
      {
        slug: "hapus-akun",
        title: "Menghapus Akun",
        keywords: ["hapus akun", "tutup akun"],
        summary: "Cara menghapus akun KOJE24.",
        content: `
## Menghapus Akun KOJE24

Hubungi Admin KOJE24 dan sertakan email terdaftar.
Penghapusan bersifat permanen.
        `.trim(),
      },
    ],
  },

  pesanan: {
    title: "Pesanan",
    items: [
      {
        slug: "cek-status-pesanan",
        title: "Cek Status Pesanan",
        keywords: ["status pesanan", "cek pesanan"],
        summary: "Cara melihat status pesanan.",
        content: `
## Cara Cek Status Pesanan

1. Login ke akun.
2. Masuk ke menu **Pesanan Saya**.
3. Lihat status pesanan aktif.
        `.trim(),
      },
      {
        slug: "ubah-pesanan",
        title: "Mengubah Pesanan",
        keywords: ["ubah pesanan", "edit pesanan"],
        summary: "Mengubah pesanan sebelum diproses.",
        content: `
## Mengubah Pesanan

Pesanan hanya bisa diubah sebelum status **Diproses**.
Hubungi admin secepatnya.
        `.trim(),
      },
      {
        slug: "pesanan-dibatalkan",
        title: "Pesanan Dibatalkan",
        keywords: ["pesanan dibatalkan"],
        summary: "Alasan pesanan dibatalkan.",
        content: `
## Pesanan Dibatalkan

Pesanan bisa dibatalkan karena:
- Pembayaran tidak masuk
- Stok habis
- Permintaan pelanggan
        `.trim(),
      },
    ],
  },

  pembayaran: {
    title: "Pembayaran",
    items: [
      {
        slug: "metode-pembayaran",
        title: "Metode Pembayaran",
        keywords: ["cara bayar", "qris", "transfer"],
        summary: "Metode pembayaran yang tersedia.",
        content: `
## Metode Pembayaran

- Transfer Bank
- QRIS
- E-wallet
        `.trim(),
      },
      {
        slug: "pembayaran-gagal",
        title: "Pembayaran Gagal",
        keywords: ["pembayaran gagal"],
        summary: "Solusi jika pembayaran gagal.",
        content: `
## Pembayaran Gagal

Cek saldo dan ulangi transaksi.
Jika saldo terpotong, hubungi admin.
        `.trim(),
      },
    ],
  },

  pengiriman: {
    title: "Pengiriman",
    items: [
      {
        slug: "jadwal-pengiriman",
        title: "Jadwal Pengiriman",
        keywords: ["jadwal kirim"],
        summary: "Informasi jadwal pengiriman.",
        content: `
## Jadwal Pengiriman

Pengiriman dilakukan setiap hari sesuai slot yang dipilih.
        `.trim(),
      },
      {
        slug: "resi-pengiriman",
        title: "Cek Resi Pengiriman",
        keywords: ["cek resi"],
        summary: "Cara cek status pengiriman.",
        content: `
## Cek Resi

Resi akan dikirim via WhatsApp setelah pesanan dikirim.
        `.trim(),
      },
    ],
  },

  refund: {
    title: "Pengembalian Dana",
    items: [
      {
        slug: "syarat-refund",
        title: "Syarat Refund",
        keywords: ["refund", "pengembalian dana"],
        summary: "Syarat dan ketentuan refund.",
        content: `
## Syarat Refund

Refund berlaku jika:
- Produk rusak
- Pesanan salah kirim
        `.trim(),
      },
      {
        slug: "proses-refund",
        title: "Proses Refund",
        keywords: ["proses refund"],
        summary: "Alur proses refund.",
        content: `
## Proses Refund

1. Hubungi admin
2. Kirim bukti
3. Refund diproses 1×24 jam
        `.trim(),
      },
    ],
  },

  komplain: {
    title: "Komplain Pesanan",
    items: [
      {
        slug: "produk-rusak",
        title: "Produk Rusak",
        keywords: ["produk rusak"],
        summary: "Jika produk diterima rusak.",
        content: `
## Produk Rusak

Segera foto produk dan kirim ke admin.
        `.trim(),
      },
      {
        slug: "produk-kurang",
        title: "Produk Kurang",
        keywords: ["produk kurang"],
        summary: "Jika produk tidak lengkap.",
        content: `
## Produk Kurang

Laporkan ke admin maksimal 1 jam setelah terima.
        `.trim(),
      },
    ],
  },

  promo: {
    title: "Promosi",
    items: [
      {
        slug: "kode-promo",
        title: "Menggunakan Kode Promo",
        keywords: ["kode promo"],
        summary: "Cara menggunakan kode promo.",
        content: `
## Cara Pakai Kode Promo

Masukkan kode promo saat checkout.
        `.trim(),
      },
      {
        slug: "promo-tidak-berlaku",
        title: "Promo Tidak Berlaku",
        keywords: ["promo gagal"],
        summary: "Kenapa promo tidak bisa dipakai.",
        content: `
## Promo Tidak Berlaku

Pastikan syarat & masa berlaku promo masih aktif.
        `.trim(),
      },
    ],
  },

  lainnya: {
    title: "Lainnya",
    items: [
      {
        slug: "tentang-koje24",
        title: "Tentang KOJE24",
        keywords: ["tentang koje24"],
        summary: "Informasi umum KOJE24.",
        content: `
## Tentang KOJE24

KOJE24 adalah cold-pressed juice alami tanpa pengawet.
        `.trim(),
      },
      {
        slug: "kontak-admin",
        title: "Kontak Admin",
        keywords: ["kontak admin"],
        summary: "Cara menghubungi admin.",
        content: `
## Kontak Admin

Hubungi kami via WhatsApp resmi KOJE24.
        `.trim(),
      },
    ],
  },
}
