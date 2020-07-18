const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
// const LessPluginCleanCSS = require('less-plugin-clean-css');
// const LessPluginAutoPrefix = require('less-plugin-autoprefix');
const HappyPack = require('happypack');
const WebpackBar = require('webpackbar');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

// const VueLoaderPlugin = require('vue-loader/lib/plugin');

// const chalk = require('chalk');

// const ProgressBarPlugin = require('progress-bar-webpack-plugin');

// const Dashboard = require('webpack-dashboard');
// const DashboardPlugin = require('webpack-dashboard/plugin');
// const dashboard = new Dashboard();

// const ExtractTextPlugin = require("extract-text-webpack-plugin");
// const extractLess = new MiniCssExtractPlugin({
//   filename: (getPath) => {
//     return getPath('[name].css');
//   },
//   allChunks: true
// });

const runtimePath = process.argv[8];

const APP_PATH = path.resolve(runtimePath, 'src'); // 项目src目录

const { getPostCssConfigPath } = require('../util');

module.exports = {
  plugins: {
    HtmlWebpackPlugin,
    MiniCssExtractPlugin,
    CopyWebpackPlugin,
    HtmlWebpackIncludeAssetsPlugin,
    // LessPluginCleanCSS,
    // LessPluginAutoPrefix,
    // VueLoaderPlugin,
    // ExtractTextPlugin,
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
      filename:
        process.env.NODE_ENV === 'production'
          ? '[name].[chunkhash].bundle.js'
          : '[name].[hash].bundle.js',
      chunkFilename:
        process.env.NODE_ENV === 'production'
          ? '[name].[chunkhash].bundle.js'
          : '[name].[hash].bundle.js',
      path: path.resolve(runtimePath, 'dist'),
      publicPath: '/',
    },
    plugins: [
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
      // 请确保引入这个插件！
      // new VueLoaderPlugin(),
      // new webpack.DllReferencePlugin({
      //   context: runtimePath,
      //   manifest: require(
      //     path.join(runtimePath,'src','assets','dll','commons-manifest.json')
      //   )
      // }),
      new HtmlWebpackPlugin({
        title: '',
        filename: 'index.html',
        template: path.join(runtimePath, 'src', 'index.html'),
        hash: true, // 防止缓存
        minify: {
          removeAttributeQuotes: true, // 压缩 去掉引号
        },
        chunks: ['index'],
      }),
      new webpack.HashedModuleIdsPlugin(),
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // all options are optional
        filename: '[name].css',
        chunkFilename: '[id].css',
        ignoreOrder: false, // Enable to remove warnings about conflicting order
      }),
      // new CopyWebpackPlugin([
      //   {
      //     from: path.join(runtimePath, 'src', 'assets'),//`${runtimePath}src\\assets`,
      //     to: path.join(runtimePath, 'dist', 'static'),//`${runtimePath}dist\\static`,
      //     toType: 'dir'
      //   },
      // ]),
      new webpack.ProvidePlugin({
        _: 'lodash',
        $: 'jquery',
      }),
      new ForkTsCheckerWebpackPlugin({
        tsconfig: path.join(runtimePath, 'tsconfig.json'),
        checkSyntacticErrors: true,
      }),
      // new DashboardPlugin(dashboard.setData),
      new HappyPack({
        id: 'babel',
        loaders: [
          'cache-loader',
          {
            loader: 'babel-loader',
            query: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    useBuiltIns: 'usage',
                    corejs: { version: 3, proposals: true },
                  },
                ],
                '@babel/preset-react',
              ],
              plugins: [
                '@babel/plugin-transform-runtime',
                '@babel/plugin-syntax-dynamic-import',
                '@babel/plugin-proposal-function-bind',
                '@babel/plugin-proposal-class-properties',
              ],
            },
          },
        ],
      }),
      new HappyPack({
        id: 'ts',
        loaders: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              happyPackMode: true,
              configFile: path.join(runtimePath, 'tsconfig.json'),
            },
          },
        ],
      }),
      new HappyPack({
        id: 'css',
        loaders: [
          'cache-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              config: {
                path: getPostCssConfigPath(runtimePath),
              },
            },
          },
        ],
      }),
      new HappyPack({
        id: 'less',
        loaders: [
          'cache-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              config: {
                path: getPostCssConfigPath(runtimePath),
              },
            },
          },
          {
            loader: 'less-loader',
            query: {
              javascriptEnabled: true,
            },
          },
          // 'css-loader',
          // {
          //   loader: "less-loader",
          //   query: {
          //     javascriptEnabled: true,
          //     plugins: [
          //       new LessPluginCleanCSS({advanced: true}),
          //       new LessPluginAutoPrefix({add: false, remove: false, browsers: ['last 2 versions']})
          //     ]
          //   }
          // }
        ],
      }),
      new WebpackBar({ reporters: ['profile'], profile: true }),
      // new ProgressBarPlugin({
      //   format: 'build [:bar] :percent (:elapsed seconds)',
      //   clear: false,
      //   width: 60
      // }),
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
            chunks: 'all',
          },
        },
      },
    },
    module: {
      rules: [
        {
          test: /\.m?jsx?$/,
          exclude: /(node_modules|bower_components)/,
          include: [APP_PATH],
          use: ['happypack/loader?id=babel'],
        },
        {
          test: /\.m?tsx?$/,
          exclude: /(node_modules|bower_components)/,
          include: [APP_PATH],
          use: ['happypack/loader?id=ts'],
        },
        {
          test: /\.css$/,
          include: [
            APP_PATH,
            /highlight.js/,
            /photoswipe.css/,
            /default-skin.css/,
            /swiper.min.css/,
            /antd/,
            /antd-mobile/,
            /normalize.css/,
          ],
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
            process.env.NODE_ENV === 'development' ? 'style-loader' : MiniCssExtractPlugin.loader,
            'happypack/loader?id=css',
          ],
        },
        {
          test: /\.less$/,
          include: [APP_PATH, /normalize.less/],
          use: [
            process.env.NODE_ENV === 'development' ? 'style-loader' : MiniCssExtractPlugin.loader,
            'happypack/loader?id=less',
          ],
          /* ExtractTextPlugin.extract({
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
          }) */
        },
        {
          test: /\.(png|svg|jpg|gif|ico)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 1024,
              },
            },
          ],
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 1024,
              },
            },
          ],
        },
        {
          test: /\.(csv|tsv)$/,
          use: ['csv-loader'],
        },
        {
          test: /\.xml$/,
          use: ['xml-loader'],
        },
        {
          test: /\.ejs/,
          loader: ['ejs-loader?variable=data'],
        },
        {
          test: /\.ya?ml$/,
          use: ['json-loader', 'yaml-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.less', '.css', '.json'], // 后缀名自动补全
    },
  },
};
