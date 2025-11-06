/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://adalyze.app',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 7000,

  // 🗺️ Add only public pages to the sitemap
  additionalPaths: async (config) => [
    { loc: '/', changefreq: 'daily', priority: 1.0 },
    { loc: '/login', changefreq: 'daily', priority: 0.8 },
    { loc: '/register', changefreq: 'daily', priority: 0.8 },
    { loc: '/pricing', changefreq: 'weekly', priority: 0.9 },
    { loc: '/blog', changefreq: 'weekly', priority: 0.8 },
    { loc: '/case-study', changefreq: 'weekly', priority: 0.8 },
    { loc: '/affiliate-program', changefreq: 'monthly', priority: 0.6 },
    { loc: '/aboutus', changefreq: 'yearly', priority: 0.3 },
    { loc: '/cookie-policy', changefreq: 'yearly', priority: 0.3 },
    { loc: '/termsandconditions', changefreq: 'yearly', priority: 0.3 },
    { loc: '/returnpolicy', changefreq: 'yearly', priority: 0.3 },
    { loc: '/privacypolicy', changefreq: 'yearly', priority: 0.3 },
    { loc: '/agency', changefreq: 'monthly', priority: 0.6 },
    { loc: '/use-cases', changefreq: 'monthly', priority: 0.6 },
    { loc: '/features', changefreq: 'monthly', priority: 0.6 },
    { loc: '/roi-calculator', changefreq: 'monthly', priority: 0.6 },
    { loc: '/faq', changefreq: 'monthly', priority: 0.6 },
  ],

  // 🤖 Robots.txt setup — allow only public pages
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/login',
          '/register',
          '/pricing',
          '/blog',
          '/case-study',
          '/affiliate-program',
          '/aboutus',
          '/cookie-policy',
          '/termsandconditions',
          '/returnpolicy',
          '/privacypolicy',
          '/agency',
          '/use-cases',
          '/features',
          '/roi-calculator',
          '/faq',
        ],
        disallow: ['/'],
      },
    ],
  },
};

module.exports = config;
