/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    // Disable CSP in development to avoid blocking issues
    if (process.env.NODE_ENV === 'development') {
      return [];
    }
    
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' https://*.googleapis.com https://*.gstatic.com https://*.ggpht.com https://*.googleusercontent.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com https://*.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.googleapis.com https://*.gstatic.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.googleapis.com https://*.gstatic.com https://*.ggpht.com https://*.googleusercontent.com; frame-src 'self' https://*.googleapis.com https://*.gstatic.com; worker-src 'self' blob:;"
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig