/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '',
  env: {
    API_BASE_URL: 'https://adalyzeai.xyz/App/api.php',
    NEXT_PUBLIC_BASE_PATH: '',
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: '543832771103-mjordts3br5jlop5dj8q9m16nijjupuu.apps.googleusercontent.com',
    NEXT_PUBLIC_GTM_ID:'GTM-54MX8L24',
    NEXT_PUBLIC_GA4_MEASUREMENT_ID: 'G-NP47DV1XRN'

  },
  devIndicators: false,
  reactStrictMode: false,
  images: { 
    unoptimized: true, // Required when using static export (output: 'export')
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Note: Image optimization is disabled for static export
    minimumCacheTTL: 60,
  },
  // Configure sharp for metadata stripping (if switching from static export)
  experimental: {
    optimizePackageImports: ['sharp', 'lucide-react', 'framer-motion'],
    // optimizeCss requires critters package - disabled for now
    // optimizeCss: true,
  },
  // Optimize CSS loading and bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Note: swcMinify is enabled by default in Next.js 15+
  output: 'export',
  // Optimize webpack for better code splitting
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize chunk splitting to reduce HTTP requests
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for large libraries
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
              reuseExistingChunk: true,
            },
            // Common chunk for shared code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
            // Framer Motion separate chunk (large library)
            framerMotion: {
              name: 'framer-motion',
              test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
              chunks: 'all',
              priority: 30,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};


export default nextConfig;
