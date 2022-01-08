const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "script-src 'self'" 
  }
]

module.exports = {
  async rewrites() {
    return [
      {
        source: '/natours',
        destination: '/',
      },
    ]
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: '/(.*)',
        headers: securityHeaders,
      }
    ]
  },
}
