const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // 不要な console ポリフィルを無効化
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        console: false,
      };
      return webpackConfig;
    },
    plugins: {
      add: [
        new NodePolyfillPlugin({
          // console を除外し、それ以外の Node.js 標準ライブラリはブラウザで使えるようにする
          excludeAliases: ["console"],
        }),
      ],
    },
  },
};
