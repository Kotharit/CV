/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Linting is run separately; keep production builds deterministic.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
