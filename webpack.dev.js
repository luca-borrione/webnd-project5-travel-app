/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  entry: './src/client/index.js',
  mode: 'development',
  devtool: 'source-map',
  stats: 'verbose',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.s[ac]ss$/i,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  output: {
    assetModuleFilename: 'images/[hash][ext][query]',
    library: 'Client',
    libraryTarget: 'var',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new HtmlWebPackPlugin({
      favicon: './src/client/assets/favicon.ico',
      filename: './index.html',
      template: './src/client/views/index.html',
    }),
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: true,
      dry: true,
      protectWebpackAssets: false,
      verbose: true,
    }),
  ],
  devServer: {
    // devMiddleware: {
    //   writeToDisk: true,
    // },
    proxy: {
      '/api/**': {
        target: 'http://localhost:8085',
      },
    },
  },
};
