const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: (config) => {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        path: require.resolve("path-browserify"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        stream: require.resolve("stream-browserify"),
        url: require.resolve("url"),
        buffer: require.resolve("buffer"),
        process: require.resolve("process/browser"),
        util: require.resolve("util"),
        assert: require.resolve("assert"),
        os: require.resolve("os-browserify/browser"),
        crypto: require.resolve("crypto-browserify")
      };

      config.plugins = [
        ...(config.plugins || []),
        // window.process / Buffer を自動提供
        new webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"]
        })
      ];

      return config;
    }
  }
};
