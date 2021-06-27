import { Template } from './template';

const basicTemplate: Template = {
  name: 'basic',
  dependencies: [
    //'husky',
    //'tsdx',
    'tslib',
    //'typescript@next',
    //'size-limit',
    //'@size-limit/preset-small-lib',
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
    "files": [
      "tsconfig.json",
      "src/**/*.*",
      "dist/**/*",
      "!**/*.test.ts",
      "!**/*.spec.ts",
      "!**/*.test.js",
      "!**/*.spec.js",
      "!**/__snapshots__/*"
    ],
    engines: {
      node: '>=10',
    },
    scripts: {
      start: 'tsdx watch',
      "build": "npm run build && npm run build:dts",
      "build:tsdx": 'tsdx build --target node',
      "build:dts": "dts-bundle-generator -o ./dist/index.d.ts ./src/index.ts --no-banner",
      test: 'tsdx test --passWithNoTests',
      lint: 'tsdx lint',
      "preversion": "npm run build && npm run test",
      prepare: 'tsdx build',
      size: 'size-limit',
      analyze: 'size-limit --why',
      "npm:publish": "yarn run preversion && npm publish && yarn run postpublishOnly",
      "npm:publish:bump": "yarn-tool version && yarn run preversion && npm publish && yarn run postpublishOnly",
      "postpublish:changelog": "ynpx --quiet @yarn-tool/changelog && git add ./CHANGELOG.md",
      "postpublish:git:commit": "git commit -m \"chore(release): publish\" . & echo postpublish:git:commit",
      "postpublish:git:push": "git push --follow-tags",
      "postpublish:git:tag": "ynpx --quiet @yarn-tool/tag",
      "postpublishOnly": "yarn run postpublish:changelog && yarn run postpublish:git:commit && yarn run postpublish:git:tag && yarn run postpublish:git:push",
    },
    "devDependencies": {
      "@bluelovers/tsconfig": "^1.0.22",
      "dts-bundle-generator": "^5.9.0",
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
