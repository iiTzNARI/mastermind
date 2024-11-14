import { NextConfig } from "next";
import withTM from "next-transpile-modules";

// Chakra UIなどのモジュールをトランスパイル対象に追加
const withTranspileModules = withTM(["@chakra-ui/react"]);

const nextConfig: NextConfig = withTranspileModules({
  reactStrictMode: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.css$/,
      use: ["style-loader", "css-loader", "postcss-loader"],
    });
    return config;
  },
});

export default nextConfig;
