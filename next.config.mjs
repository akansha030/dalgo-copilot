/** Static export for GitHub Pages. The Copilot is fully client-side (mock data),
 *  so `output: 'export'` produces a static site Pages can serve.
 *  basePath must equal the repo name because project Pages live at /<repo>/. */
const isProd = process.env.NODE_ENV === 'production';
const repo = 'dalgo-copilot';

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isProd ? `/${repo}` : '',
  assetPrefix: isProd ? `/${repo}/` : '',
};

export default nextConfig;
