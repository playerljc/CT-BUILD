const { getPostCssConfigPath } = require('../../util');

/**
 * cssModules
 * @param webpackConfig
 */
module.exports = function ({ webpackConfig, plugins, theme = {}, runtimePath }) {
  // include的APP_PATH中的less文件使用cssModules
  webpackConfig.module.rules[3].use[3].options.modules = {
    localIdentName: '[path][name]__[local]--[hash:base64:5]',
  };
  webpackConfig.module.rules[3].use[5].query.modifyVars = theme;

  // include是node_modules中的less文件不需要cssModules
  webpackConfig.module.rules.push({
    test: /\.less$/,
    include: [/node_modules/],
    use: [
      process.env.mode === 'development' ? 'style-loader' : plugins.MiniCssExtractPlugin.loader,
      'cache-loader',
      'thread-loader',
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
          modifyVars: theme,
        },
      },
    ],
  });
};
