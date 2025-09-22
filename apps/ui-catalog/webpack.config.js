const HtmlWebpackPlugin = require("html-webpack-plugin");
const { container: { ModuleFederationPlugin } } = require("webpack");

module.exports = {
  mode: process.env.NODE_ENV || "development",
  entry: "./src/bootstrap.tsx",
  devServer: { port: 3001, historyApiFallback: true },
  resolve: { extensions: [".tsx",".ts",".js"] },
  module: { rules: [{ test: /\.tsx?$/, loader: "ts-loader", exclude: /node_modules/ },
      { test: /\.css$/, use: ["style-loader", "css-loader"] }] },
  plugins: [
    new ModuleFederationPlugin({
      name: "ui_catalog",
      filename: "remoteEntry.js",
      exposes: { "./App": "./src/App.tsx" },
      shared: {
        react: { singleton: true, requiredVersion: false },
        "react-dom": { singleton: true, requiredVersion: false }
      }
    }),
    new HtmlWebpackPlugin({ template: "./public/index.html" })
  ]
};
