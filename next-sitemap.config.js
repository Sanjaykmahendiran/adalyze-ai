/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://adalyze.app',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 7000,
  additionalPaths: async (config) => [
    { loc: '/', changefreq: 'daily', priority: 1.0 },
    { loc: '/login', changefreq: 'daily', priority: 0.8 },
    { loc: '/register', changefreq: 'daily', priority: 0.8 },
    { loc: '/pricing', changefreq: 'weekly', priority: 0.9 },
    { loc: '/thanks', changefreq: 'monthly', priority: 0.5 },
    { loc: '/dashboard', changefreq: 'daily', priority: 0.9 },
    { loc: '/upload', changefreq: 'daily', priority: 0.9 },
    { loc: '/results', changefreq: 'daily', priority: 0.9 },
    { loc: '/ab-test', changefreq: 'daily', priority: 0.9 },
    { loc: '/ab-results', changefreq: 'daily', priority: 0.9 },
    { loc: '/my-ads', changefreq: 'daily', priority: 0.8 },
    { loc: '/guide', changefreq: 'weekly', priority: 0.7 },
    { loc: '/pro', changefreq: 'weekly', priority: 0.8 },
    { loc: '/support', changefreq: 'weekly', priority: 0.6 },
    { loc: '/blog', changefreq: 'weekly', priority: 0.8 },
    { loc: '/blogdetail', changefreq: 'weekly', priority: 0.6 },
    { loc: '/case-study', changefreq: 'weekly', priority: 0.8 },
    { loc: '/case-study-detail', changefreq: 'weekly', priority: 0.6 },
    { loc: '/affiliate-program', changefreq: 'monthly', priority: 0.6 },
    { loc: '/privacypolicy', changefreq: 'yearly', priority: 0.3 },
    { loc: '/returnpolicy', changefreq: 'yearly', priority: 0.3 },
    { loc: '/termsandconditions', changefreq: 'yearly', priority: 0.3 },
    { loc: '/profile', changefreq: 'weekly', priority: 0.7 },
  ],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',   // allow all pages
      },
    ],
  },
};

module.exports = config;
