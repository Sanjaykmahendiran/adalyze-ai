/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '',
  env: {
    API_BASE_URL: 'https://adalyzeai.xyz/App/api.php',
    NEXT_PUBLIC_BASE_PATH: '',
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: '543832771103-mjordts3br5jlop5dj8q9m16nijjupuu.apps.googleusercontent.com',
    NEXT_PUBLIC_GTM_ID:'GTM-54MX8L24',
    NEXT_PUBLIC_FACEBOOK_APP_ID: '801878825881803',
    NEXT_PUBLIC_FACEBOOK_APP_SECRET: 'EAALZATfaR0MsBPuakVfZBcQSHB8QVcIZC8Y1UmWlhfoxNGPKG117FNjjUezPThMDaMrbsQM3KsfITXlquKEupqwZAYjVZAmfaFZCqdzdJu1tBNe3nFrfRL2dmnUbYRoYcZC4nA0ZBQRvBQxSUZAx5WsKZAR2VnLJJZB2fZAnL20Hq8dE8JH4yFibHQyERPZCg6KhaJHYgN97ixhykQZCCEunaWhzaJduIx1MFOITpdyITscClF8VhrPVpwAIMw8ZCoPr57KdQZBTYyL9N22gf2IPVs5e'

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
