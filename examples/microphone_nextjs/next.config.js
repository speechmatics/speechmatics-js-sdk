/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: false,
  },
  env: {
    MP_API_KEY: 'INSERT_API_KEY',
  },
};

module.exports = nextConfig;
