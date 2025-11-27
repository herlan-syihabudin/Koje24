/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://webkoje-cacs.vercel.app", // nanti update ke domain utama kalau sudah custom
  generateRobotsTxt: true,
  sitemapSize: 5000,

  // biar Google lebih cepat index
  changefreq: "daily",
  priority: 0.8,

  // halaman yang tidak boleh masuk sitemap (keamanan + UX)
  exclude: [
    "/checkout",
    "/invoice/*",
    "/api/*",
    "/pusat-bantuan/*", // dynamic content agar tidak spam index
  ],

  // konfigurasi tambahan robots.txt
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/checkout", "/invoice", "/api"],
      },
    ],
  },

  // opsional — include gambar di sitemap (SEO booster)
  additionalSitemaps: [
    "https://webkoje-cacs.vercel.app/sitemap.xml",
  ],
};
