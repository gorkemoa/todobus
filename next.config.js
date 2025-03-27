/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Diğer mevcut ayarlar burada olabilir
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'img.icons8.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  
  // ESLint kontrollerini devre dışı bırak
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript hata kontrollerini devre dışı bırak
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 