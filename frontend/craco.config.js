// frontend/craco.config.js
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
        stream: false
      };
      return webpackConfig;
    }
  }
};
