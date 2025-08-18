const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // console ポリフィルを無効化
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        console: false,
      };
      return webpackConfig;
    },
    plugins: {
      add: [
        new NodePolyfillPlugin({
          excludeAliases: ["console"], // console ポリフィルを除外
        }),
      ],
    },
  },
};
