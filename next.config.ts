import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = "/viagens";

const nextConfig: NextConfig = {
  output: "export",
  ...(isGithubPages && {
    basePath,
    assetPrefix: `${basePath}/`,
  }),
};

export default nextConfig;
