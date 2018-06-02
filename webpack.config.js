const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require("webpack")


const htmlWebpackPlugin = new HtmlWebPackPlugin({
  template: "./src/index.html",
  filename: "./index.html",
  hash: true,
  inject: 'body'
});

module.exports = {
  // entry: [
  //   'babel-polyfill',
  //     './src/index.html',
  //   './src/index.js'
  // ],
  devtool: 'inline-source-map',
  devServer: {
    hot: true,
    contentBase: path.join(__dirname, "dist"),
    watchContentBase: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader",
            options: {
              modules: true,
              importLoaders: 1,
              localIdentName: "[name]_[local]_[hash:base64]",
              sourceMap: true,
              minimize: true
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    htmlWebpackPlugin,
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ]
  // output: {
  //   filename: '[name].bundle.js',
  //   path: path.resolve(__dirname, 'dist')
  // }
};
