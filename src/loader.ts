import type { LoaderContext } from 'webpack'
import { ECacheKey, IParcelCssLoaderConfig } from './interface'
import { transform as _transform } from '@parcel/css'
import { Buffer } from 'buffer'
import { getTargets } from './utils'

const LOADER_NAME = `parcel-css-loader`
export async function ParcelCssLoader(
  this: LoaderContext<IParcelCssLoaderConfig>,
  source: string
): Promise<void> {
  const done = this.async()
  const options = this.getOptions()
  const { implementation, targets: userTargets, ...opts } = options

  if (implementation && typeof implementation.transform !== 'function') {
    done(
      new TypeError(
        `[${LOADER_NAME}]: options.implementation.transform must be an '@parcel/css' transform function. Received ${typeof implementation.transform}`
      )
    )
    return
  }

  const transform = implementation?.transform ?? _transform

  try {
    const { code, map } = transform({
      filename: this.resourcePath,
      code: Buffer.from(source),
      sourceMap: this.sourceMap,
      targets: getTargets({ default: userTargets, key: ECacheKey.loader }),
      ...opts,
    })
    const codeAsString = code.toString()
    done(null, codeAsString, map && JSON.parse(map.toString()))
  } catch (error: unknown) {
    done(error as Error)
  }
}
