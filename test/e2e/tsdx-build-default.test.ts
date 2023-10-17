import * as shell from 'shelljs';

import * as util from '../utils/fixture';
import { execWithCache, grep } from '../utils/shell';
import { checkCompileFiles } from '../utils/fixture';
import { test } from 'shelljs';

shell.config.silent = false;

const testDir = 'e2e';
const fixtureName = 'build-default';
const stageName = `stage-${testDir}-${fixtureName}`;

describe('tsdx build :: zero-config defaults', () => {
  beforeAll(() => {
    util.teardownStage(stageName);
    util.setupStageWithFixture(testDir, stageName, fixtureName);
  });

  it('should compile files into a dist directory', () => {
    const output = execWithCache('node ../dist/index.js build');

    checkCompileFiles();

    expect(output.code).toBe(0);
  });

  it("shouldn't compile files in test/ or types/", () => {
    const output = execWithCache('node ../dist/index.js build');

    expect(shell.test('-d', 'dist/test/')).toBeFalsy();
    expect(shell.test('-d', 'dist/types/')).toBeFalsy();

    expect(output.code).toBe(0);
  });

  it('should create the library correctly', async () => {
    const output = execWithCache('node ../dist/index.js build');

    const lib = require(`../../${stageName}/dist`);
    expect(lib.returnsTrue()).toBe(true);
    expect(lib.__esModule).toBe(true); // test that ESM -> CJS interop was output

    // syntax tests
    expect(lib.testNullishCoalescing()).toBe(true);
    expect(lib.testOptionalChaining()).toBe(true);
    // can't use an async generator in Jest yet, so use next().value instead of yield
    expect(lib.testGenerator().next().value).toBe(true);
    expect(await lib.testAsync()).toBe(true);

    expect(output.code).toBe(0);
  });

  it.skip('should bundle regeneratorRuntime', () => {
    const output = execWithCache('node ../dist/index.js build');
    expect(output.code).toBe(0);

    const matched = grep(/regeneratorRuntime = r/, [
      'dist/index.cjs.development.cjs',
    ]);
    expect(matched).toBeTruthy();
  });

  it('should use lodash for the CJS build', () => {
    const output = execWithCache('node ../dist/index.js build');
    expect(output.code).toBe(0);

    const matched = grep(/lodash/, [
      'dist/index.cjs.*.cjs',
    ]);
    expect(matched).toBeTruthy();
  });

  it('should use lodash-es for the ESM build', () => {
    const output = execWithCache('node ../dist/index.js build');
    expect(output.code).toBe(0);

    const matched = grep(/lodash-es/, [
      'dist/index.esm.mjs'
    ]);
    expect(matched).toBeTruthy();
  });

  it("shouldn't replace lodash/fp", () => {
    const output = execWithCache('node ../dist/index.js build');
    expect(output.code).toBe(0);

    const matched = grep(/lodash\/fp/, [
      'dist/index.cjs.*.cjs',
      'dist/index.esm.mjs'
    ]);
    expect(matched).toBeTruthy();
  });

  it('should clean the dist directory before rebuilding', () => {
    let output = execWithCache('node ../dist/index.js build');
    expect(output.code).toBe(0);

    shell.mv('package.json', 'package-og.json');
    shell.mv('package2.json', 'package.json');

    shell.mv('dist/index.cjs.development.cjs', 'dist/index.cjs.development.cjs.old');
    shell.mv('dist/index.esm.mjs', 'dist/index.esm.mjs.old');

    // cache bust because we want to re-run this command with new package.json
    output = execWithCache('node ../dist/index.js build', { noCache: true });

    // build-default files have been cleaned out
    [
      'dist/index.cjs.development.cjs.old',
      'dist/index.esm.mjs.old',
    ].forEach(file =>
    {
      expect(test('-f', file)).toBeFalsy();
    })

    checkCompileFiles();

    expect(output.code).toBe(0);

    // reset package.json files
    shell.mv('package.json', 'package2.json');
    shell.mv('package-og.json', 'package.json');
  });

  afterAll(() => {
    util.teardownStage(stageName);
  });
});
