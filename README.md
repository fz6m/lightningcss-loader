# lightningcss-loader

Speed up your Webpack build with [lightningcss](https://github.com/parcel-bundler/lightningcss)

## Install

```bash
  pnpm add -D lightningcss-loader
```

## Usage

### Optimize css

webpack config example:

```js
// webpack.config.js
const { LightningCssMinifyPlugin } = require('lightningcss-loader')

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new LightningCssMinifyPlugin()
    ]
  },
};
```


### Instead of postcss-loader

webpack config example:

```diff
// webpack.config.js

// need install `lightningcss`
const LightningCSS = require('lightningcss')

module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'style-loader', // or MiniCssExtractPlugin.loader
          'css-loader',
-         'postcss-loader',
+         {
+           loader: 'lightningcss-loader',
+           options: {
+             implementation: LightningCSS
+           }
+         }
          'sass-loader'
        ],
      },
    ],
  },
};
```

lightningcss can replace `autoprefixer` and `postcss-preset-env`, if you use custom postcss plugins, you can use both `lightningcss-loader` and `postcss-loader`.

## Config

```js
// webpack.config.js
const { LightningCssMinifyPlugin } = require('lightningcss-loader')
const LightningCSS = require('lightningcss')

module.exports = {
  optimization: {
    minimizer: [
      new LightningCssMinifyPlugin({
        implementation: LightningCSS
        // ... lightningcss options
      })
    ]
  },
};
```

You can see type tips for detailed configurable items

## Advanced

### Custom media queries

`lightningcss-loader` uses a heuristic methods to support `Custom media queries` syntax. 

Make sure the defined `@custom-media` file no other CSS. otherwise it may generate duplicate CSS and increase the bundle size.

## Migration from `parcel-css-loader`

1. Remove and install:

    ```bash
      pnpm remove parcel-css-loader @parcel/css
      pnpm i -D lightningcss-loader lightningcss
    ```

2. Search code and replace to new name:

    - `parcel-css-loader` -> `lightningcss-loader`

    - `ParcelCssMinifyPlugin` -> `LightningCssMinifyPlugin`

## License

MIT
