const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const basePath = process.env.GITHUB_ACTIONS && repoName ? `/${repoName}` : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/ISTIDLAL',
  assetPrefix: '/ISTIDLAL/',
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig;
