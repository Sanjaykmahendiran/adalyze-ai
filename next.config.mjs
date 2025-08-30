/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '',
  env: {
    API_BASE_URL: 'https://adalyzeai.xyz/App/api.php',
    NEXT_PUBLIC_BASE_PATH: '',
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: '543832771103-mjordts3br5jlop5dj8q9m16nijjupuu.apps.googleusercontent.com',
    NEXT_PUBLIC_GTM_ID:'GTM-54MX8L24'

  },
  devIndicators: false,
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};


export default nextConfig;
