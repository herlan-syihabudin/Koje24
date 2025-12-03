/** @type {import('next-sitemap').IConfig} */
export default {
  siteUrl: "https://webkoje24.vercel.app",
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: "weekly",
  priority: 0.7,
  exclude: [
    "/invoice/*",
    "/checkout",
    "/api/*"
  ],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/invoice/*", "/checkout", "/api/*"] },
    ],
  },
};
