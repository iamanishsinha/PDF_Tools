const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["jspdf", "pdf-lib", "jszip"]
  }
};

export default nextConfig;
