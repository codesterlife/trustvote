const webpack = require('webpack');

module.exports = {
  devServer: {
    allowedHosts: 'all',
    host: '0.0.0.0',
    port: 3000
  },
  configureWebpack: {
    devtool: 'source-map',
    resolve: {
      fallback: {
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        url: require.resolve('url'),
      },
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      }),
    ],
  }
}