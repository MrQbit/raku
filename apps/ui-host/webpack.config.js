const HtmlWebpackPlugin = require("html-webpack-plugin");
const { container: { ModuleFederationPlugin } } = require("webpack");

module.exports = {
  mode: process.env.NODE_ENV || "development",
  entry: "./src/main.tsx",
  devServer: { port: 3000, historyApiFallback: true },
  resolve: { extensions: [".tsx",".ts",".js"] },
  module: { rules: [{ test: /\.tsx?$/, loader: "ts-loader", exclude: /node_modules/ }] },
  plugins: [
    new ModuleFederationPlugin({
      name: "ui_host",
      remotes: {
        ui_catalog: "ui_catalog@http://localhost:3001/remoteEntry.js",
        ui_server: "ui_server@http://localhost:3002/remoteEntry.js",
        ui_packs: "ui_packs@http://localhost:3003/remoteEntry.js",
        ui_policy: "ui_policy@http://localhost:3004/remoteEntry.js",
        ui_obs: "ui_obs@http://localhost:3005/remoteEntry.js",
        ui_a2a: "ui_a2a@http://localhost:3006/remoteEntry.js",
        ui_docs: "ui_docs@http://localhost:3007/remoteEntry.js"
      },
      shared: { react: { singleton: true }, "react-dom": { singleton: true } }
    }),
    new HtmlWebpackPlugin({ template: "./public/index.html" })
  ]
};
