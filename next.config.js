/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Admins can paste a book cover URL from any site — Next's optimizer only
    // allows whitelisted hostnames, which doesn't work for arbitrary URLs.
    // Disabling optimization loads images directly in the browser instead,
    // trading automatic resizing for not needing a domain allowlist.
    unoptimized: true,
  },
};

module.exports = nextConfig;
