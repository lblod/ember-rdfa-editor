// This allows consumers to import the needed Webpack config without having to know what's in it.
module.exports = {
  node: {
    global: true,
    __filename: true,
    __dirname: true,
  },
  resolve: {
    fallback: {
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
    },
  },
};
