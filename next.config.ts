import type { NextConfig } from "next";

// Ao rodar dentro do GitHub Actions, GITHUB_ACTIONS/GITHUB_REPOSITORY são
// definidos automaticamente — usa isso pra ativar o basePath do GitHub
// Pages (project page: usuario.github.io/<repo>/) sem precisar de nenhuma
// env var extra no workflow.
const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const basePath = isGithubActions && repo ? `/${repo}` : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
};

export default nextConfig;
