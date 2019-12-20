const webpack = require('webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');

const src = 'src';
const dist = 'dist';

const copyWebpackPluginPatterns = [
  {
    from: path.resolve(src, 'manifest.json'),
    to: path.resolve(dist),
  },
  {
    from: path.resolve(src, 'assets'),
    to: path.resolve(dist, 'assets'),
  },
];

module.exports = {
  entry: {
    content: path.resolve(src, 'app', 'content.ts'),
    background: path.resolve(src, 'app', 'background.ts'),
  },
  output: {
    path: path.resolve(dist),
    filename: '[name].js'
  },
  optimization: {
    splitChunks: false,
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/
    }]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  plugins: [
    // exclude locale files in moment
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new CopyPlugin(copyWebpackPluginPatterns),
    new WriteFilePlugin(),
  ]
};
