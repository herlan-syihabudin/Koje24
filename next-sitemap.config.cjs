/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://webkoje24.vercel.app",
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: "weekly",
  priority: 0.7,

  // Halaman yang tidak boleh ikut sitemap
  exclude: ["/invoice/*", "/checkout", "/api/*"],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/invoice/*", "/checkout", "/api/*"],
      },
    ],
  },

  // Auto generate tambahan untuk SEO lebih optimal
  transform: async (config, path) => {
  const isTestimoni = path.startsWith("/testimoni")

  return {
    loc: path,
    changefreq: isTestimoni ? "daily" : "weekly",
    priority: isTestimoni ? 0.9 : 0.7,
    lastmod: new Date().toISOString(),
    };
  },
};
