/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  turbopack: {
    // Empty config to use Turbopack with native modules
  },
  serverExternalPackages: ['mssql', 'mssql/msnodesqlv8', 'msnodesqlv8'],
};

export default nextConfig;
