const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: (config) => {
      // Nodeコアモジュールのフォールバック（必要最小限）
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        path: require.resolve("path-browserify")
      };
      return config;
    }
  }
};
