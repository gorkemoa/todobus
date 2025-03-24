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
}

module.exports = nextConfig 