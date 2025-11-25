export type HelpArticle = {
  id: string
  question: string
  answer: string
}

export type HelpCategory = {
  title: string
  description: string
  articles: HelpArticle[]
}

export const helpCategories: Record<string, HelpCategory> = {
  akun: {
    title: "Akun & Keamanan",
    description: "Login, password, dan perlindungan data pengguna.",
    articles: [
      {
        id: "cara-membuat-akun",
        question: "Bagaimana cara membuat akun KOJE24?",
        answer:
          "Akun KOJE24 dibuat otomatis setelah kamu melakukan pemesanan pertama. Selanjutnya kamu dapat login menggunakan nomor WhatsApp yang sama.",
      },
      {
        id: "lupa-password",
        question: "Saya lupa password, bagaimana cara reset?",
        answer:
          "KOJE24 tidak menggunakan password. Semua verifikasi dilakukan melalui nomor WhatsApp yang kamu gunakan untuk checkout.",
      },
      {
        id: "keamanan-data",
        question: "Apakah data saya aman?",
        answer:
          "KOJE24 tidak menyimpan data kartu pembayaran. Data alamat dan nomor kontak diamankan dalam sistem terenkripsi dan hanya digunakan untuk keperluan pengiriman.",
      },
    ],
  },

  pesanan: {
    title: "Pesanan",
    description: "Status pesanan, kendala checkout, dan perubahan order.",
    articles: [
      {
        id: "cek-status-pesanan",
        question: "Bagaimana cara cek status pesanan saya?",
        answer:
          "Setelah checkout, status pesanan dapat kamu lihat melalui WhatsApp, email, atau chat admin KOJE24. Nantinya akan ada halaman tracking resminya.",
      },
      {
        id: "ubah-pesanan",
        question: "Bisakah saya mengubah pesanan setelah checkout?",
        answer:
          "Pengubahan pesanan bisa dilakukan sebelum pesanan diproses. Silakan chat admin KOJE24 secepatnya agar kami dapat membantu.",
      },
      {
        id: "pesanan-gagal",
        question: "Pesanan saya gagal diproses, apa yang harus dilakukan?",
        answer:
          "Coba ulangi pemesanan. Jika tetap gagal, hubungi admin KOJE24 agar kami bantu cek sistem.",
      },
    ],
  },

  pembayaran: {
    title: "Pembayaran",
    description: "Metode bayar, kendala transaksi, dan konfirmasi.",
    articles: [
      {
        id: "metode-pembayaran",
        question: "Metode pembayaran apa saja yang tersedia?",
        answer:
          "Saat ini KOJE24 menerima transfer bank, QRIS, dan pembayaran melalui marketplace. Pilihan metode akan terus kami perluas.",
      },
      {
        id: "bayar-tidak-masuk",
        question: "Saya sudah bayar tetapi status belum berubah.",
        answer:
          "Konfirmasi pembayaran biasanya otomatis dalam 1–3 menit. Jika lebih lama, kirim bukti transfer ke admin KOJE24.",
      },
    ],
  },

  pengiriman: {
    title: "Pengiriman",
    description: "Jadwal kirim, lokasi, dan aturan pengiriman harian.",
    articles: [
      {
        id: "jadwal-kirim",
        question: "Kapan pesanan saya dikirim?",
        answer:
          "KOJE24 dikirim setiap hari sesuai jadwal. Order yang masuk sebelum jam 10 pagi akan dikirim di hari yang sama (kecuali penuh).",
      },
      {
        id: "area-pengiriman",
        question: "KOJE24 melayani area mana saja?",
        answer:
          "Area pengiriman meliputi Bekasi, Jakarta Timur, dan sekitarnya. Untuk lokasi di luar jangkauan, kami akan memberi informasi lanjutan.",
      },
      {
        id: "ubah-alamat",
        question: "Bisakah saya mengubah alamat setelah pesan?",
        answer:
          "Bisa, selama pesanan belum dikirim. Silakan hubungi admin KOJE24.",
      },
    ],
  },

  refund: {
    title: "Pengembalian Dana",
    description: "Syarat & ketentuan refund pesanan KOJE24.",
    articles: [
      {
        id: "syarat-refund",
        question: "Kapan saya bisa mengajukan refund?",
        answer:
          "Refund dapat diajukan jika pesanan rusak, bocor, atau tidak sesuai varian. Ajukan maksimal 1x24 jam setelah pesanan diterima.",
      },
      {
        id: "proses-refund",
        question: "Bagaimana proses refund KOJE24?",
        answer:
          "Silakan chat admin KOJE24, kirim foto/video bukti. Refund diproses 1–3 hari kerja melalui transfer bank/QRIS.",
      },
    ],
  },

  komplain: {
    title: "Komplain Pesanan",
    description: "Penanganan produk rusak, kurang, atau salah kirim.",
    articles: [
      {
        id: "produk-rusak",
        question: "Produk saya bocor atau rusak, apa yang harus dilakukan?",
        answer:
          "Foto botol, kondisi box, dan waktu penerimaan. Kirimkan ke admin KOJE24 maksimal 24 jam untuk diproses penggantian atau refund.",
      },
      {
        id: "pesanan-kurang",
        question: "Pesanan saya kurang atau tidak sesuai.",
        answer:
          "KOJE24 akan melakukan pengecekan ulang. Jika terbukti kurang, kami akan mengirim ulang item atau memberikan solusi terbaik.",
      },
    ],
  },

  promo: {
    title: "Promosi",
    description: "Voucher, paket langganan, dan promo aktif.",
    articles: [
      {
        id: "kode-promo",
        question: "Di mana saya bisa mendapatkan kode promo KOJE24?",
        answer:
          "Kode promo diumumkan melalui Instagram KOJE24, website ini, serta WhatsApp Broadcast resmi.",
      },
      {
        id: "paket-langganan",
        question: "Apakah KOJE24 punya paket langganan?",
        answer:
          "Ya! KOJE24 menyediakan paket langganan mingguan/bulanan dengan harga lebih hemat.",
      },
    ],
  },

  lainnya: {
    title: "Lainnya",
    description: "Informasi lain yang mungkin kamu butuhkan.",
    articles: [
      {
        id: "masa-simpan",
        question: "Berapa lama masa simpan jus KOJE24?",
        answer:
          "KOJE24 tahan 2–3 hari di chiller 0–4°C. Tanpa pengawet, jadi sebaiknya langsung dikonsumsi untuk nutrisi optimal.",
      },
      {
        id: "aman-untuk-maag",
        question: "Apakah KOJE24 aman untuk maag?",
        answer:
          "Varian seperti Green Revive, Yellow Immunity, dan Sunrise Boost aman untuk lambung sensitif. Konsultasikan ke admin untuk saran terbaik.",
      },
      {
        id: "manfaat",
        question: "Apa manfaat rutin minum KOJE24?",
        answer:
          "Meningkatkan imun tubuh, pencernaan lebih lancar, tidur lebih nyenyak, dan bantu detox racun harian.",
      },
    ],
  },
}
