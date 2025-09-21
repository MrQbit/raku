const HtmlWebpackPlugin = require("html-webpack-plugin");
const { container: { ModuleFederationPlugin } } = require("webpack");

module.exports = {
  mode: process.env.NODE_ENV || "development",
  entry: "./src/bootstrap.tsx",
  devServer: { port: 3003, historyApiFallback: true },
  resolve: { extensions: [".tsx",".ts",".js"] },
  module: { rules: [{ test: /\.tsx?$/, loader: "ts-loader", exclude: /node_modules/ }] },
  plugins: [
    new ModuleFederationPlugin({
      name: "ui_packs",
      filename: "remoteEntry.js",
      exposes: { "./App": "./src/App.tsx" },
      shared: { react: { singleton: true }, "react-dom": { singleton: true } }
    }),
    new HtmlWebpackPlugin({ template: "./public/index.html" })
  ]
};
