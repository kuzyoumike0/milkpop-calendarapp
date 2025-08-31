// frontend/craco.config.js
module.exports = {
  style: {
    postcss: {
      plugins: [require("tailwindcss"), require("autoprefixer")],
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve = webpackConfig.resolve || {};

      // サーバー専用モジュールはフロントでは解決させない
      webpackConfig.resolve.alias = {
        ...(webpackConfig.resolve.alias || {}),
        cors: false,
        express: false,
        pg: false,
        "pg-native": false,
        fs: false,
        path: false,
        net: false,
        tls: false,
        zlib: false,
        http: false,
        https: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        child_process: false,
      };

      webpackConfig.resolve.fallback = {
        ...(webpackConfig.resolve.fallback || {}),
        fs: false,
        path: false,
        net: false,
        tls: false,
        zlib: false,
        http: false,
        https: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        child_process: false,
      };

      return webpackConfig;
    },
  },
};
