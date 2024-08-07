import { external, safePackageName } from './utils';
import { safeVariableName } from 'safe-variable-name';
import { paths } from './constants';
import { InputPluginOption, OutputOptions, RollupOptions } from 'rollup';
import terser from '@rollup/plugin-terser';
import { DEFAULT_EXTENSIONS as DEFAULT_BABEL_EXTENSIONS } from '@babel/core';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import resolve, { DEFAULTS as RESOLVE_DEFAULTS } from '@rollup/plugin-node-resolve';
//import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
//import ts from 'typescript';
// @ts-ignore
import cleanup from 'rollup-plugin-cleanup';

import { extractErrors } from './errors/extractErrors';
import { babelPluginTsdx } from './babelPluginTsdx';
import { TsdxOptions } from './types';
import { getCurrentTsconfig } from 'get-current-tsconfig';
import { RollupBabelInputPluginOptions } from '@rollup/plugin-babel';
import { EnumTsdxFormat } from '@ts-type/tsdx-extensions-by-format';
import { assertTsconfigPathExists, handleTsconfigPath } from './utils/ts';
import { rollupDtsBundleGenerator } from './plugin/rollupDtsBundleGenerator';
import { tryImportTypescript } from './utils/try-import';

// shebang cache map thing because the transform only gets run once
let shebang: any = {};

export async function createRollupConfig(
  opts: TsdxOptions,
  outputNum: number
): Promise<RollupOptions & { output: OutputOptions }> {
  const ts = await tryImportTypescript()

  const findAndRecordErrorCodes = await extractErrors({
    errorMapFilePath: paths.appErrorsJson,
    ...opts,
  });

  const isEsm = opts.format === EnumTsdxFormat.esm;

  const shouldMinify =
    opts.minify !== undefined ? opts.minify : opts.env === 'production' || isEsm;

  const outputName = [
    //`${paths.appDist}/${safePackageName(opts.name)}`,
    `${paths.appDist}/${safePackageName(opts.outputName || opts.name)}`,
    opts.format,
    (!isEsm || opts.env !== 'production') && opts.env,
    shouldMinify && (opts.esmMinify || !isEsm) ? 'min' : '',
    isEsm ? 'mjs' : EnumTsdxFormat.cjs,
  ]
    .filter(Boolean)
    .join('.');

  const {
    tsconfig,
    tsconfigPath,
  } = handleTsconfigPath(opts);

  assertTsconfigPathExists(tsconfig, tsconfigPath);

  // borrowed from https://github.com/facebook/create-react-app/pull/7248
  //const tsconfigJSON = ts.readConfigFile(tsconfigPath, ts.sys.readFile).config;
  const tsconfigJSON = getCurrentTsconfig(paths.appRoot, null, tsconfigPath);

  tsconfigJSON.include ??= [];
  tsconfigJSON.include = [
    tsconfigJSON.include,
    opts.input
  ].flat().filter(v => (v ?? false) !== false);

//  if (outputNum > 0 && tsconfigJSON.compilerOptions)
//  {
//    tsconfigJSON.compilerOptions.declaration = false;
//    tsconfigJSON.compilerOptions.declarationMap = false;
//    tsconfigJSON.compilerOptions.declarationDir = undefined;
//  }

  // borrowed from https://github.com/ezolenko/rollup-plugin-typescript2/blob/42173460541b0c444326bf14f2c8c27269c4cb11/src/parse-tsconfig.ts#L48
  const parsedConfig = ts.parseJsonConfigFileContent(
    tsconfigJSON,
    ts.sys,
    './',
    void 0,
    tsconfigPath,
  );

  const tsCompilerOptions = parsedConfig.options;

  const useTsconfigDeclarationDir = Boolean(tsCompilerOptions?.declarationDir);

  /*
  console.dir({
    tsconfigPath,
    tsconfig,
    parsedConfig,
  }, {
    colors: true,
    depth: 5,
  });
  console.dir({
    outputNum,
    format: opts.format,
    tsconfigJSON,
    tsCompilerOptions,
  }, {
    colors: true,
  });
   */

  return {
    // Tell Rollup the entry point to the package
    input: opts.input,
    // Tell Rollup which packages to ignore
    external: (id: string) => {
      // bundle in polyfills as TSDX can't (yet) ensure they're installed as deps
      if (id.startsWith('regenerator-runtime')) {
        return false;
      }

      return external(id);
    },
    // Rollup has treeshaking by default, but we can optimize it further...
    treeshake: {
      // We assume reading a property of an object never has side-effects.
      // This means tsdx WILL remove getters and setters defined directly on objects.
      // Any getters or setters defined on classes will not be effected.
      //
      // @example
      //
      // const foo = {
      //  get bar() {
      //    console.log('effect');
      //    return 'bar';
      //  }
      // }
      //
      // const result = foo.bar;
      // const illegalAccess = foo.quux.tooDeep;
      //
      // Punchline....Don't use getters and setters
      propertyReadSideEffects: false,
    },
    // Establish Rollup output
    output: {
      // Set filenames of the consumer's package
      file: outputName,
      // Pass through the file format
      format: opts.format,
      // Do not let Rollup call Object.freeze() on namespace import objects
      // (i.e. import * as namespaceImportObject from...) that are accessed dynamically.
      freeze: false,
      // Respect tsconfig esModuleInterop when setting __esModule.
      esModule: Boolean(tsCompilerOptions?.esModuleInterop),
      name: safeVariableName(opts.name),
      sourcemap: true,
      globals: {
        react: 'React',
        'react-native': 'ReactNative',
        'lodash-es': 'lodashEs',
        'lodash/fp': 'lodashFp',
      },
      exports: 'named',
    },
    plugins: [
      !!opts.extractErrors && {
        async transform(source) {
          await findAndRecordErrorCodes(source);
          return source;
        },
      },
      resolve({
        mainFields: [
          'module',
          'main',
          opts.target !== 'node' ? 'browser' : undefined,
        ].filter(Boolean) as string[],
        extensions: [
          ...(isEsm ? ['.mjs', '.cjs'] : ['.cjs', '.mjs']),
          ...RESOLVE_DEFAULTS.extensions,
          '.jsx',
          '.ts', '.tsx',
          ...(isEsm ? ['.mts', '.cts'] : ['.cts', '.mts']),
        ],
      }),
      // all bundled external modules need to be converted from CJS to ESM
      commonjs({
        // use a regex to make sure to include eventual hoisted packages
        include:
          opts.format === 'umd'
            ? /\/node_modules\//
            : /\/regenerator-runtime\//,
        // @ts-ignore
        defaultIsModuleExports: false,
        transformMixedEsModules: true,
      }),
      json(),
      {
        // Custom plugin that removes shebang from code because newer
        // versions of bublé bundle their own private version of `acorn`
        // and I don't know a way to patch in the option `allowHashBang`
        // to acorn. Taken from microbundle.
        // See: https://github.com/Rich-Harris/buble/pull/165
        transform(code: string) {
          let reg = /^#!(.*)/;
          let match = code.match(reg);

          shebang[opts.name] = match ? '#!' + match[1] : '';

          code = code.replace(reg, '');

          return {
            code,
            map: null,
          };
        },
      },
      cleanup({
        extensions: [...DEFAULT_BABEL_EXTENSIONS, 'ts', 'tsx'],
        comments: [
          'ts',
          'ts3s',
          'jsdoc',
        ],
        maxEmptyLines: 0,
      }),
      typescript({
        //verbosity: 1,
        typescript: ts,
        tsconfig: tsconfigPath,
        tsconfigDefaults: {
          exclude: [
            // all TS test files, regardless whether co-located or in test/ etc
            '**/*.spec.ts',
            '**/*.test.ts',
            '**/*.spec.tsx',
            '**/*.test.tsx',
            // TS defaults below
            'node_modules',
            'bower_components',
            'jspm_packages',
            paths.appDist,
          ],
          compilerOptions: {
            "esModuleInterop": true,
            //"module": "esnext",

            sourceMap: true,
            declaration: false,
            declarationDir: void 0,
            declarationMap: false,

            "removeComments": true,

            "target": "ES2019",
            "jsx": "preserve",
            "experimentalDecorators": true,
            "allowSyntheticDefaultImports": true,
            "resolveJsonModule": true,

            strictPropertyInitialization: false,
            "strictBindCallApply": true,
            "strictNullChecks": false,
            "strictFunctionTypes": true,

            "preserveConstEnums": true,

            "noErrorTruncation": true,

            "pretty": true,

            "inlineSourceMap": false,
            "skipLibCheck": true,

            "newLine": "lf",

            //...parsedConfig.raw.compilerOptions,
          },
        },
        tsconfigOverride: {
          compilerOptions: {
            ...parsedConfig.raw.compilerOptions,
            "strictPropertyInitialization": false,
            // TS -> esnext, then leave the rest to babel-preset-env
            target: 'esnext',
            //"module": "esnext",
            // don't output declarations more than once
            ...(outputNum > 0 ? ({
              declaration: false,
              declarationMap: false,
              declarationDir: void 0,
            }) : {}),
            "noPropertyAccessFromIndexSignature": false,
            "noUnusedParameters": false,
            "allowUnusedLabels": true,
            "noUnusedLocals": false,
          },
          include: tsconfigJSON.include,
        },
        check: !opts.transpileOnly && outputNum === 0,
        useTsconfigDeclarationDir,

        exclude: [
          "*.d.ts", "**/*.d.ts", "**/*.d.cts", "**/*.d.mts",
          /**
           * 此處用來支援 build-lazy-cjs
           */
          opts.input.endsWith('.cts') && opts.input,
        ].filter(Boolean)
      }),
      babelPluginTsdx({
        exclude: 'node_modules/**',
        extensions: [
          '.js', '.jsx',
          ...(isEsm ? ['.mjs', '.cjs'] : ['.cjs', '.mjs']),
          ...DEFAULT_BABEL_EXTENSIONS,
          '.ts', '.tsx',
          ...(isEsm ? ['.mts', '.cts'] : ['.cts', '.mts']),
        ],
        passPerPreset: true,
        custom: {
          targets: opts.target === 'node' ? { node: opts.targetVersion ?? '12' } : undefined,
          extractErrors: opts.extractErrors,
          format: opts.format,
        },
        babelHelpers: 'bundled',
        inputSourceMap: true as any,
      } as RollupBabelInputPluginOptions),
      replace({
        preventAssignment: true,
        objectGuards: true,
        values: {
          'process.env.NODE_ENV': JSON.stringify(opts.env),
          'process.env.TSDX_FORMAT': JSON.stringify(opts.format),
          '__TSDX_FORMAT__': JSON.stringify(opts.format),
        },
      }),
      //sourceMaps(),
      shouldMinify &&
        terser({
          //sourcemap: true,
          output: {
            comments: false,
            beautify: shouldMinify || isEsm,
            indent_level: 2,
            keep_numbers: true,
            preserve_annotations: true,
          },
          compress: {
            keep_infinity: true,
            pure_getters: true,
            passes: 10,
            booleans: true,
            comparisons: true,
            computed_props: true,
            conditionals: true,
          },
          ecma: 2019,
          toplevel: opts.format === EnumTsdxFormat.cjs,
          warnings: true,
          keep_classnames: true,
          keep_fnames: true,
        } as any),
      outputNum === 0 && rollupDtsBundleGenerator({
        entries: opts.input,
        declarationDir: useTsconfigDeclarationDir && tsCompilerOptions.declarationDir,
      }),
    ] as InputPluginOption[],
  } satisfies RollupOptions & { output: OutputOptions };
}
