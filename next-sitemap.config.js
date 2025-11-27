// @ts-check
/** @type {import('next-sitemap').IConfig} */

module.exports = {
  siteUrl: "https://webkoje-cacs.vercel.app", // ganti ke domain resmi KOJE24 nanti
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: "weekly",
  priority: 0.7,

  exclude: [
    "/invoice/*",
    "/checkout",
    "/api/*",
  ],

  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/invoice/*", "/checkout", "/api/*"] },
    ],
  },
};
