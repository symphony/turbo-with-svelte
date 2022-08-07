const path = require('path');
import { WebpackConfiguration } from 'webpack-dev-server';

const clientConfig: WebpackConfiguration = {
  name: 'client',
  target: 'web',
  mode: 'development',
  resolve: {
    extensions: ['.ts', 'js', '.html', '.scss'],

  },
  entry: './src/public/scripts/client.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist/public/scripts'),
    filename: 'client.js',
  },
};

const serverConfig: WebpackConfiguration = {
  name: 'server',
  target: 'node',
  entry: './src/server/index.ts',
  mode: 'development',
  resolve: {
    extensions: ['.ts', 'js',],

  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },
  externals: {
    bufferutil: "bufferutil",
    "utf-8-validate": "utf-8-validate",
  },
};

export default [
  clientConfig,
  serverConfig,
];
