import { transform, type TransformOptions } from '@parcel/css'

type Filter = string | RegExp
type Implementation = typeof import('@parcel/css')

// minify plugin
type AllowTransformOpts = Omit<
  TransformOptions,
  'filename' | 'code' | 'minify' | 'cssModules' | 'targets'
  /**
   * allow
   *
   * @sourceMap
   * @targets
   * @drafts
   * @analyzeDependencies
   * @pseudoClasses
   * @unusedSymbols
   */
>

export interface IMinifyPluginOpts extends AllowTransformOpts {
  include?: Filter | Filter[]
  exclude?: Filter | Filter[]
  targets?: string | string[]
  test?: RegExp
  implementation?: Implementation
}

// loader
type AllowLoaderTransformOpts = Omit<
  TransformOptions,
  'filename' | 'code' | 'targets'
  /**
   * allow
   *
   * @cssModules
   * @minify
   * @sourceMap
   * @targets
   * @drafts
   * @analyzeDependencies
   * @pseudoClasses
   * @unusedSymbols
   */
>

export interface IParcelCssLoaderConfig extends AllowLoaderTransformOpts {
  targets?: string | string[]
  implementation?: Implementation
}

// other
export type TransformType = typeof transform
export interface IPackageJson {
  version: string
  name: string
}

export enum ECacheKey {
  loader = 'loader',
  minify = 'minify',
}
