const path = require('path');

module.exports = function () {
  return {
    name: 'webpack-config-plugin',
    configureWebpack() {
      return {
        module: {
          rules: [
            {
              test: /\.svg$/i,
              oneOf: [
                {
                  // 带 ?url 后缀的 SVG 作为 URL 处理
                  resourceQuery: /url/,
                  type: 'asset/resource',
                },
                {
                  // 其他 SVG 作为 React 组件处理
                  use: ['@svgr/webpack'],
                },
              ],
            },
          ],
        },
        resolve: {
          alias: {
            '@/demo': path.resolve(process.cwd(), './src/demo'),
            '@/components': path.resolve(process.cwd(), './src/components'),
          },
          extensions: ['.js', '.jsx'],
        },
      };
    },
  };
};
