/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: '',
  env: {
    API_BASE_URL: 'https://adalyzeai.xyz/App/api.php',
    NEXT_PUBLIC_BASE_PATH: '',
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
