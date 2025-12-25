/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // Reduce memory usage by creating a standalone build
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
    ],
  },
};

module.exports = nextConfig;
