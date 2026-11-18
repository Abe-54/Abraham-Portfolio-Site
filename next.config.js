/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // 700 matches a phone-width cover (390px wide, 20px gutters) at 2x, so phones are not sent 750 or 828.
    deviceSizes: [640, 700, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
};

module.exports = nextConfig;
