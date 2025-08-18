const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  webpack: {
    plugins: {
      add: [new NodePolyfillPlugin()]
    },
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        fs: false,
        path: require.resolve("path-browserify"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        os: require.resolve("os-browserify/browser"),
        buffer: require.resolve("buffer/")
      };
      return webpackConfig;
    }
  }
};
