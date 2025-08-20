module.exports = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        ngZorroAntd: {
          test: /[\\/]node_modules[\\/]ng-zorro-antd[\\/]/,
          name: 'ng-zorro-antd',
          chunks: 'all',
          priority: 20,
        },
        // fabric
        fabric: {
          test: /[\\/]node_modules[\\/]fabric[\\/]/,
          name: 'fabric',
          chunks: 'all',
          priority: 10,
        },
        // swagger-ui
        swaggerUi: {
          test: /[\\/]node_modules[\\/]swagger-ui[\\/]/,
          name: 'swagger-ui',
          chunks: 'all',
          priority: 15,
        },
        // vendors
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 0,
        },
      },
    },
  },
}; 