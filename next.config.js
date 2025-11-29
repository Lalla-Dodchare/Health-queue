const withNextIntl = require('next-intl/plugin')(
  // Specify the path to the request config
  './i18n/request.js'
)

/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = withNextIntl(nextConfig)
