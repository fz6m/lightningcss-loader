import type { LoaderContext } from 'webpack'
import { ECacheKey, ILightningCssLoaderConfig } from './interface'
import lightningcss from 'lightningcss'
import { Buffer } from 'buffer'
import { getTargets } from './utils'

const LOADER_NAME = `lightningcss-loader`

// match `Custom media query {} is not defined`
// https://github.com/parcel-bundler/lightningcss/blob/master/src/error.rs#L375
const CUSTOM_MEDIA_ERROR_REG = /Custom media query (.+?) is not defined/
const isCustomMediaError = (err?: Error) => {
  const msg = err?.message
  if (!msg?.length) {
    return false
  }
  const isMatch = CUSTOM_MEDIA_ERROR_REG.test(msg)
  return isMatch
}

export async function LightningCssLoader(
  this: LoaderContext<ILightningCssLoaderConfig>,
  source: string,
  prevMap?: Record<string, any>,
): Promise<void> {
  const done = this.async()
  const options = this.getOptions()
  const { implementation, targets: userTargets, ...opts } = options

  if (implementation && typeof implementation.transform !== 'function') {
    done(
      new TypeError(
        `[${LOADER_NAME}]: options.implementation.transform must be an 'lightningcss' transform function. Received ${typeof implementation.transform}`,
      ),
    )
    return
  }

  const transform = implementation?.transform ?? lightningcss.transform
  const bundle = implementation?.bundle ?? lightningcss.bundle

  const filename = this.resourcePath
  const enableSourceMap = this.sourceMap
  const targets = getTargets({ default: userTargets, key: ECacheKey.loader })
  const inputSourceMap =
    enableSourceMap && prevMap ? JSON.stringify(prevMap) : undefined

  try {
    const codeBuffer = Buffer.from(source)

    const { code, map } = transform({
      filename,
      code: codeBuffer,
      sourceMap: enableSourceMap,
      targets,
      inputSourceMap,
      ...opts,
    })
    const codeAsString = code.toString()
    done(null, codeAsString, map && JSON.parse(map.toString()))
  } catch (error: unknown) {
    // support @custom-media queries
    const isCustomMediaEnabled = opts?.drafts?.customMedia === true
    if (isCustomMediaEnabled) {
      const canBundle =
        typeof bundle === 'function' &&
        isCustomMediaError(error as Error) &&
        filename
      if (canBundle) {
        // fallback to bundle API
        try {
          const { code, map } = bundle({
            filename,
            sourceMap: enableSourceMap,
            targets,
            inputSourceMap,
            ...opts,
          })
          const codeAsString = code.toString()
          done(null, codeAsString, map && JSON.parse(map.toString()))
          return
        } catch {}
      }
    }

    done(error as Error)
  }
}
