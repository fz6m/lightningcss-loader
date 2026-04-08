// @ts-ignore
import { matchObject } from 'webpack/lib/ModuleFilenameHelpers'
import { RawSource, SourceMapSource } from 'webpack-sources'
import { transform as _transform } from 'lightningcss'
import {
  ECacheKey,
  IMinifyPluginOpts,
  IPackageJson,
  TransformType,
} from './interface'
import type { Compilation, Compiler } from 'webpack'
import { join } from 'path'
import { getTargets, isWebpack5 } from './utils'
import { Buffer } from 'buffer'

const pkgPath = join(__dirname, '../package.json')
const pkg = require(pkgPath) as IPackageJson

const PLUGIN_NAME = 'lightning-css-minify'
const CSS_FILE_REG = /\.css(?:\?.*)?$/i

export class LightningCssMinifyPlugin {
  private readonly options: Omit<IMinifyPluginOpts, 'implementation'>
  private readonly transform: TransformType

  constructor(opts: IMinifyPluginOpts = {}) {
    const { implementation, ...otherOpts } = opts
    if (implementation && typeof implementation.transform !== 'function') {
      throw new TypeError(
        `[LightningCssMinifyPlugin]: implementation.transform must be an 'lightningcss' transform function. Received ${typeof implementation.transform}`,
      )
    }

    this.transform = implementation?.transform ?? _transform
    this.options = otherOpts
  }

  apply(compiler: Compiler) {
    const meta = JSON.stringify({
      name: pkg.name,
      version: pkg.version,
      options: this.options,
    })

    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.chunkHash.tap(PLUGIN_NAME, (_, hash) =>
        hash.update(meta),
      )

      if (isWebpack5(compilation)) {
        compilation.hooks.processAssets.tapPromise(
          {
            name: PLUGIN_NAME,
            stage: compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
            additionalAssets: true,
          },
          async () => await this.transformAssets(compilation),
        )

        compilation.hooks.statsPrinter.tap(PLUGIN_NAME, (statsPrinter) => {
          statsPrinter.hooks.print
            .for('asset.info.minimized')
            // @ts-ignore
            .tap(PLUGIN_NAME, (minimized, { green, formatFlag }) => {
              // @ts-ignore
              return minimized ? green(formatFlag('minimized')) : undefined
            })
        })
      } else {
        compilation.hooks.optimizeChunkAssets.tapPromise(
          PLUGIN_NAME,
          async () => await this.transformAssets(compilation),
        )
      }
    })
  }

  private async transformAssets(compilation: Compilation): Promise<void> {
    const {
      options: { devtool },
    } = compilation.compiler

    const sourcemap =
      this.options.sourceMap === undefined
        ? ((devtool && (devtool as string).includes('source-map')) as boolean)
        : this.options.sourceMap

    const {
      include,
      exclude,
      test: testRegExp,
      targets: userTargets,
      features: transformFeatureOptions,
      ...transformOptions
    } = this.options

    const assets = compilation.getAssets().filter(
      (asset) =>
        // Filter out already minimized
        !asset.info.minimized &&
        // Filter out by file type
        (testRegExp || CSS_FILE_REG).test(asset.name) &&
        matchObject({ include, exclude }, asset.name),
    )

    await Promise.all(
      assets.map(async (asset) => {
        const { source, map } = asset.source.sourceAndMap()
        const sourceAsString = source.toString()
        const code = typeof source === 'string' ? Buffer.from(source) : source
        const targets = getTargets({
          default: userTargets,
          key: ECacheKey.minify,
        })

        let result
        try {
          result = await this.transform({
            filename: asset.name,
            code,
            minify: true,
            sourceMap: sourcemap,
            targets,
            ...transformFeatureOptions,
            ...transformOptions,
          })
        } catch (error: unknown) {
          const err = error as Record<string, any>
          const fileName = err.fileName || asset.name
          const loc = err.loc as { line: number; column?: number } | undefined

          const messageParts: string[] = [`${err.message || error}`]

          if (loc && typeof loc.line === 'number') {
            const position =
              typeof loc.column === 'number'
                ? `${loc.line}:${loc.column}`
                : `${loc.line}`
            messageParts.push(`  in ${fileName}:${position}`, '')

            const lines = sourceAsString.split('\n')
            const start = Math.max(0, loc.line - 4)
            const end = Math.min(lines.length, loc.line + 3)
            for (let i = start; i < end; i++) {
              const lineNum = i + 1
              const marker = lineNum === loc.line ? '>' : ' '
              messageParts.push(`${marker} ${lineNum} | ${lines[i]}`)
            }
          } else {
            messageParts.push(`  in ${fileName}`)
          }

          const tipsMessage = []
          const errorMessage = messageParts.join('\n')
          const maySyntaxError = errorMessage.includes('SyntaxError:')
          if (maySyntaxError) {
            tipsMessage.push('')
            // Tips: `errorRecovery: true`
            // https://lightningcss.dev/docs.html#error-recovery
            const tipLine = '='.repeat(80)
            tipsMessage.push(tipLine)
            tipsMessage.push(
              `\n[LightningCssMinifyPlugin] This error might be caused by a syntax error in the CSS. \n\nLightningCSS has an 'errorRecovery' option that can be enabled to attempt to recover from syntax errors and provide more detailed error messages. You can enable it in the plugin options:`,
            )
            tipsMessage.push(`
  new LightningCssMinifyPlugin({
    // other options...
    errorRecovery: true,
  })
`)
            tipsMessage.push(tipLine)
          }

          // print tips
          console.log()
          console.log(tipsMessage.join('\n'))
          // print error
          console.log()
          console.log(`[LightningCssMinifyPlugin] LightningCSS error:`)
          console.log(errorMessage)
          console.log()

          // throw
          throw new Error('[LightningCssMinifyPlugin] minification failed', {
            cause: error,
          })
        }
        const codeString = result.code.toString()

        compilation.updateAsset(
          asset.name,
          // @ts-ignore
          sourcemap
            ? new SourceMapSource(
                codeString,
                asset.name,
                JSON.parse(result.map!.toString()),
                sourceAsString,
                map as any,
                true,
              )
            : new RawSource(codeString),
          {
            ...asset.info,
            minimized: true,
          },
        )
      }),
    )
  }
}
