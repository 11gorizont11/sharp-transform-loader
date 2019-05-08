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
      use: ['sharp-transform-loader', 'file-loader?hash=sha512&digest=hex&name=[hash].[ext]'],
    }],
  },
};
