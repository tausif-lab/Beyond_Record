/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable proper linting and type checking
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint during builds
    dirs: ['app', 'components', 'lib', 'scripts'], // Specify directories to lint
  },
  typescript: {
    ignoreBuildErrors: false, // Enable TypeScript error checking
  },
  
  // Performance optimizations
  images: {
    unoptimized: process.env.NODE_ENV === 'development', // Optimize images in production
    domains: ['localhost'], // Add allowed image domains
    formats: ['image/webp', 'image/avif'], // Modern image formats
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  // Experimental features for better performance
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Webpack configuration for better bundle optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            chunks: 'all',
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            priority: 20,
            enforce: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      }
    }
    
    return config
  },
  
  // Environment variables configuration
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

export default nextConfig
