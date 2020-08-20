const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/',
  output: {
    filename: 'main.js',
    path: __dirname + '/dist',
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: 'source-map',

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js', '.json', '.css'],
  },

  module: {
    rules: [
      { test: /\.tsx?$/, use: ['awesome-typescript-loader'] },
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
    ],
  },

  node: {
    fs: 'empty',
  },

  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    minimizer: [
      new TerserWebpackPlugin({
        cache: true,
        parallel: true,
        terserOptions: {
          compress: false,
          ecma: 6,
          mangle: true,
          output: {
            quote_style: 2,
            max_line_len: 1024,
          },
        },
        sourceMap: true,
      }),
    ],
  },

  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!.gitkeep'],
    }),
    new CopyPlugin({
      patterns: [
        { from: 'assets', to: '.' },
      ],
    }),
  ],
};

if(require.main === module)
  require('webpack')(module.exports).run((err, stats) => {
    if(stats)
      console.error(stats.toString({
        colors: process.stderr.isTTY,
      }));
    else if(err)
      console.error(err);
  });
