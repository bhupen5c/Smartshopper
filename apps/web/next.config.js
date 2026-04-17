// Defensively clear leaked envvars from other Next.js projects that would
// otherwise short-circuit loadConfig() before this file is read.
delete process.env.__NEXT_PRIVATE_STANDALONE_CONFIG;
delete process.env.__NEXT_PRIVATE_RENDER_WORKER_CONFIG;

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@smartshopper/core', '@smartshopper/types'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'shop.coles.com.au' },
      { protocol: 'https', hostname: 'www.woolworths.com.au' },
      { protocol: 'https', hostname: 'www.aldi.com.au' },
      { protocol: 'https', hostname: 'www.iga.com.au' },
      { protocol: 'https', hostname: 'images.smartshopper.app' },
    ],
  },
};
