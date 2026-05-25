/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Prevent Three.js canvas peer dep from breaking SSR
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
};

module.exports = nextConfig;
