import { Template } from './template';

const basicTemplate: Template = {
  name: 'basic',
  dependencies: [
    'husky',
    //'tsdx',
    'tslib',
    'typescript@next',
    'size-limit',
    '@size-limit/preset-small-lib',
    '@bluelovers/tsconfig'
  ],
  packageJson: {
    // name: safeName,
    version: '1.0.0',
    license: 'MIT',
    // author: author,
    main: 'dist/index.js',
    // module: `dist/${safeName}.esm.js`,
    typings: `dist/index.d.ts`,
    files: ['dist', 'src'],
    engines: {
      node: '>=10',
    },
    scripts: {
      start: 'tsdx watch',
      build: 'tsdx build --target node',
      test: 'tsdx test --passWithNoTests',
      lint: 'tsdx lint',
      prepare: 'tsdx build',
      size: 'size-limit',
      analyze: 'size-limit --why',
    },
    peerDependencies: {

    },
    /*
    'size-limit': [
      {
        path: `dist/${safeName}.cjs.production.min.js`,
        limit: '10 KB',
      },
      {
        path: `dist/${safeName}.esm.js`,
        limit: '10 KB',
      },
    ],
    */
    husky: {
      hooks: {
        'pre-commit': 'tsdx lint',
      },
    },
    prettier: {
      printWidth: 80,
      semi: true,
      singleQuote: true,
      trailingComma: 'es5',
    },
  },
};

export default basicTemplate;
