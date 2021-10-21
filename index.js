'use strict';

const webpack = require("webpack");
module.exports = {
  name: require('./package').name,
  options: {
    babel: {
      sourceMaps: "inline"
    },
    autoImport: {
      webpack: {
        node: {
          global: true,
          __filename: true,
          __dirname: true,
        },
        plugins: [
          new webpack.ProvidePlugin({
            process: 'process/browser'
          })
        ],
        resolve: {
          fallback: {
            stream: require.resolve("stream-browserify"),
            buffer: require.resolve('buffer/'),
            "readable-stream": require.resolve("readable-stream"),
            events: require.resolve("events/"),
            crypto: require.resolve("crypto-browserify")
          }
        }
      }
    },
  },

  isDevelopingAddon() {
    return this.app.env === 'development';
  },

  included() {
    this._super.included.apply(this, arguments);
  },
};
