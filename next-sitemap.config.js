/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://webkoje-cacs.vercel.app", // Ganti ke domain lo nanti kalau udah custom
  generateRobotsTxt: true, // otomatis bikin robots.txt
  sitemapSize: 5000,
  changefreq: "weekly",
  priority: 0.7,
}
