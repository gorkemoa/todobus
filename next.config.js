/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Diğer mevcut ayarlar burada olabilir
  
  images: {
    domains: [
      'images.unsplash.com',
      'img.icons8.com',
      'placehold.co',
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