import {
  transform,
  type TransformOptions as InternalTransformOptions,
  type CustomAtRules,
} from 'lightningcss'

type Filter = string | RegExp
type Implementation = typeof import('lightningcss')
type TransformOptions = InternalTransformOptions<CustomAtRules>

// feature options
type TransformFeature = Pick<TransformOptions, 'include' | 'exclude'>
interface IFeatureOptions {
  features?: TransformFeature
}

// minify plugin
type AllowMinifyOpts = Omit<
  TransformOptions,
  | 'filename'
  | 'code'
  | 'minify'
  | 'cssModules'
  | 'targets'
  | 'inputSourceMap'
  | 'include'
  | 'exclude'

  /**
   * support
   *
   * @sourceMap
   * @projectRoot
   * @drafts
   * @nonStandard
   * @analyzeDependencies
   * @pseudoClasses
   * @unusedSymbols
   * @errorRecovery
   * @visitor
   * @customAtRules
   */
>

export interface IMinifyPluginOpts extends AllowMinifyOpts, IFeatureOptions {
  include?: Filter | Filter[]
  exclude?: Filter | Filter[]
  targets?: string | string[]
  test?: RegExp
  implementation?: Implementation
}

// loader
type AllowLoaderTransformOpts = Omit<
  TransformOptions,
  'filename' | 'code' | 'targets' | 'inputSourceMap'

  /**
   * support
   *
   * @cssModules
   * @minify
   * @sourceMap
   * @projectRoot
   * @drafts
   * @nonStandard
   * @analyzeDependencies
   * @pseudoClasses
   * @unusedSymbols
   * @errorRecovery
   * @visitor
   * @customAtRules
   */
>

export interface ILightningCssLoaderConfig extends AllowLoaderTransformOpts {
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
