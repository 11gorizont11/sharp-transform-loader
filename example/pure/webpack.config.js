const path = require('path');

module.exports = {
  entry: path.join(__dirname, 'example.js'),
  resolveLoader: {
    alias: {
      'sharp-transform-loader': path.resolve(__dirname, '../../dist'),
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: './dist/',
  },
  module: {
    rules: [{
      test: /\.(jpe?g|png|gif|svg)$/,
      use: [{
        loader: 'sharp-transform-loader',
      }, {
        loader: 'file-loader',
        options: {
          name: '[contenthash][name].[ext]',
          esModule: false,
        },
      }],
    }],
  },
};
