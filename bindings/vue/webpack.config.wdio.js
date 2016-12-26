var path = require('path')
var fs = require('fs');
var webpack = require('webpack')

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8' ));

module.exports = {
  entry: './src',
  output: {
    library: 'VueOnsen',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'vue-onsenui.js'
  },
  externals: [
    {
      onsenui: {
        'var': 'ons',
        'commonjs': 'onsenui',
        'amd': 'onsenui',
        'umd': 'onsenui',
      }
    }
  ],
  resolveLoader: {
    root: path.join(__dirname, 'node_modules')
  },
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      },
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: [/node_modules/]
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.html$/,
        loader: 'vue-html'
      }
    ]
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    contentBase: '../..'
  },
  devtool: '#eval-source-map',
  plugins: [
    new webpack.BannerPlugin(`${pkg.name} v${pkg.version} - ${new Date()}`)
  ]
}
