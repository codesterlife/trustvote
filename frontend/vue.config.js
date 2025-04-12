module.exports = {
  devServer: {
    allowedHosts: 'all',
    host: '0.0.0.0',
    port: 3000
  },
  configureWebpack: {
    devtool: 'source-map'
  }
}