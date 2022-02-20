# parcel-css-loader

Speed up your Webpack build with [parcel css](https://github.com/parcel-bundler/parcel-css)

## Install

```bash
  pnpm add -D parcel-css-loader
```

## Usage

### Optimize css

webpack config example:

```js
// webpack.config.js
const { ParcelCssMinifyPlugin } = require('parcel-css-loader')

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new ParcelCssMinifyPlugin()
    ]
  },
};
```


### Instead postcss-loader

webpack config example:

```diff
// webpack.config.js

module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'style-loader', // or MiniCssExtractPlugin.loader
          'css-loader',
-         'postcss-loader',
+         'parcel-css-loader',
          'sass-loader'
        ],
      },
    ],
  },
};
```

parcel css can only provide `autoprefixer`, if you use custom postcss plugins, it is not recommended to use parcel css instead of postcss

## Config

```js
// webpack.config.js
const { ParcelCssMinifyPlugin } = require('parcel-css-loader')
const parcelCss = require('@parcel/css')

module.exports = {
  optimization: {
    minimizer: [
      new ParcelCssMinifyPlugin({
        implementation: parcelCss
        // ... parcel css options
      })
    ]
  },
};
```

You can see type tips for detailed configurable items

## License

MIT
