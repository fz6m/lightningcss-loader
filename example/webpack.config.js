const path = require('path')
const lightningcssImpl = require('lightningcss')

const LightningCssLoader = path.join(__dirname, '../dist/index.js')
const LightningCssLoaderMod = require(LightningCssLoader)
const LightningCssMinifyPlugin = LightningCssLoaderMod.LightningCssMinifyPlugin

// for features testing
const disableNesting = false

// for custom-media
const enableCustomMedia = true

/** @type {import('../dist/interface').IMinifyPluginOpts} */
const minifyOpts = {
  features: {
    exclude: lightningcssImpl.Features.Nesting,
  },
}

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
  },
  experiments: {
    css: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: path.join(__dirname, '../dist/index.js'),
            options: {
              drafts: {
                customMedia: enableCustomMedia,
              },
              implementation: lightningcssImpl,

              // for disabling features
              ...(disableNesting
                ? {
                    ...minifyOpts.features,
                  }
                : {}),
            },
          },
        ],
      },
    ],
  },
  plugins: [new LightningCssMinifyPlugin(disableNesting ? minifyOpts : {})],
}
