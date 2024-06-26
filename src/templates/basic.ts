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
    main: 'dist/index.cjs',
    // module: `dist/${safeName}.esm.mjs`,
    module: `dist/index.esm.mjs`,
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
      "build": "npm run build:tsdx && npm run build:dts",
      "build:tsdx": 'tsdx build --target node --name index',
      "build:dts": "ynpx dts-bundle-generator -o ./dist/index.d.ts ./src/index.ts --no-banner",
      "test": "tsdx test --passWithNoTests",
    "test:jest": "jest --passWithNoTests",
    "test:mocha": "ynpx --quiet -p ts-node -p mocha mocha -- --require ts-node/register \"!(node_modules)/**/*.{test,spec}.{ts,tsx}\"",
      "posttest": "yarn run build",

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
        path: `dist/${safeName}.esm.mjs`,
        limit: '10 KB',
      },
    ],
    */
  },
};

export default basicTemplate;
