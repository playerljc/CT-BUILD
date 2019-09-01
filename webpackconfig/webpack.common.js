const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const ExtractTextPlugin = require("extract-text-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const LessPluginCleanCSS = require('less-plugin-clean-css');
const LessPluginAutoPrefix = require('less-plugin-autoprefix');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

// const extractLess = new MiniCssExtractPlugin({
//   filename: (getPath) => {
//     return getPath('[name].css');
//   },
//   allChunks: true
// });

const runtimePath = process.argv[6];

const APP_PATH = path.resolve(runtimePath, 'src'); // 项目src目录

module.exports = {
  plugins: {
    HtmlWebpackPlugin,
    // ExtractTextPlugin,
    MiniCssExtractPlugin,
    CopyWebpackPlugin,
    HtmlWebpackIncludeAssetsPlugin,
    LessPluginCleanCSS,
    LessPluginAutoPrefix,
    VueLoaderPlugin,
  },
  config: {
    /**
     * 入口
     */
    entry: {
      index: path.join(runtimePath, 'src', 'index.js'),
    },
    /**
     * 出口
     */
    output: {
      filename: '[name].[chunkhash].bundle.js',
      chunkFilename: '[name].[chunkhash].bundle.js',
      path: path.resolve(runtimePath, 'dist'),
      publicPath: '/',
    },
    plugins: [
      // 请确保引入这个插件！
      // new VueLoaderPlugin(),
      // new webpack.DllReferencePlugin({
      //   context: runtimePath,
      //   manifest: require(
      //     path.join(runtimePath,'src','assets','dll','commons-manifest.json')
      //   )
      // }),
      new HtmlWebpackPlugin({
        title: 'CtMobile Demo',
        filename: 'index.html',
        template: path.join(runtimePath, 'src', 'index.html'),
        hash: true,//防止缓存
        minify: {
          removeAttributeQuotes: true//压缩 去掉引号
        },
        chunks: ["index"]
      }),
      // new HtmlWebpackPlugin({
      //   title: 'CtMobile Demo',
      //   filename: 'mobile.html',
      //   template: `${runtimePath}src\\mobile.html`,
      //   chunks: ["mobile"]
      //   // hash: true, // 防止缓存
      //   // // chunks: ['mobile'],
      //   // minify: {
      //   //   removeAttributeQuotes: true, // 压缩 去掉引号
      //   // },
      // }),

      // new HtmlWebpackIncludeAssetsPlugin({
      //   assets: [path.join('static','dll','commons.js'),],
      //   append: false,
      //   hash: true,
      // }),

      new webpack.HashedModuleIdsPlugin(),
      // extractLess,
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // all options are optional
        filename: '[name].css',
        chunkFilename: '[id].css',
        ignoreOrder: false, // Enable to remove warnings about conflicting order
      }),
      new CopyWebpackPlugin([
        {
          from: path.join(runtimePath, 'src', 'assets'),//`${runtimePath}src\\assets`,
          to: path.join(runtimePath, 'dist', 'static'),//`${runtimePath}dist\\static`,
          toType: 'dir'
        },
      ]),
      // 提供全局变量_
      new webpack.ProvidePlugin({
        _: "lodash",
        $: "jquery",
      }),
    ],
    // optimization: {
    //   splitChunks: {
    //     chunks: 'all'
    //   }
    // },
    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      }
    },
    module: {
      rules: [
        {
          test: /\.m?jsx?$/,
          exclude: /(node_modules|bower_components)/,
          include: [APP_PATH],
          use: [
            'cache-loader',
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  '@babel/preset-env',
                  '@babel/preset-react'
                ],
                plugins: [
                  '@babel/plugin-transform-runtime',
                  "@babel/plugin-syntax-dynamic-import",
                  "@babel/plugin-proposal-function-bind",
                  "@babel/plugin-proposal-class-properties"
                ]
              }
            }
          ]
        },
        {
          test: /\.css$/,
          include: [APP_PATH, /highlight.js/, /photoswipe.css/, /default-skin.css/, /swiper.min.css/, /antd/, /antd-mobile/, /normalize.css/],
          // use: ExtractTextPlugin.extract({
          //   fallback: "style-loader",
          //   use: "css-loader"
          // })
          // use: [
          //   {
          //     loader: MiniCssExtractPlugin.loader,
          //     options: {
          //       hmr: process.env.NODE_ENV === 'development',
          //     },
          //   },
          //   'css-loader',
          // ],
          use: [
            'cache-loader',
            process.env.NODE_ENV === 'development' ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
          ],
        },
        {
          test: /\.less$/,
          include: [APP_PATH, /normalize.less/],
          use: [
            'cache-loader',
            process.env.NODE_ENV === 'development' ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: "less-loader",
              options: {
                plugins: [
                  new LessPluginCleanCSS({advanced: true}),
                  new LessPluginAutoPrefix({add: false, remove: false, browsers: ['last 2 versions']})
                ]
              }
            }
          ]
          /*ExtractTextPlugin.extract({
            use: [{
              loader: "css-loader"
            }, {
              loader: "less-loader",
              options: {
                plugins: [
                  new LessPluginCleanCSS({advanced: true}),
                  new LessPluginAutoPrefix({add: false, remove: false, browsers: ['last 2 versions']})
                ]
              }
            }],
            fallback: "style-loader"
          })*/
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: [
            'cache-loader',
            'file-loader'
          ]
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          use: [
            'cache-loader',
            'file-loader'
          ]
        },
        {
          test: /\.(csv|tsv)$/,
          use: [
            'cache-loader',
            'csv-loader'
          ]
        },
        {
          test: /\.xml$/,
          use: [
            'cache-loader',
            'xml-loader'
          ]
        },
        {
          test: /\.ejs/,
          loader: [
            'cache-loader',
            'ejs-loader?variable=data'
          ]
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx', '.less', '.css', '.json'], //后缀名自动补全
    }
  }
}