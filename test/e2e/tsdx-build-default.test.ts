import { execBinWithCache, grep, shellSilentInCi } from '../utils/shell';
import { checkCompileFiles, setupStageWithFixture, teardownStage } from '../utils/fixture';
import { mv, test } from 'shelljs';
import { expectShellTestFile } from '../utils/test-utils';

shellSilentInCi();

const testDir = 'e2e';
const fixtureName = 'build-default';
const stageName = `stage-${testDir}-${fixtureName}`;

describe('tsdx build :: zero-config defaults', () => {
  beforeAll(() => {
    teardownStage(stageName);
    setupStageWithFixture(testDir, stageName, fixtureName);
  });

  it('should compile files into a dist directory', () => {
    const output = execBinWithCache('build');

    checkCompileFiles();

    expect(output.code).toBe(0);
  });

  it("shouldn't compile files in test/ or types/", () => {
    const output = execBinWithCache('build');

    expect(test('-d', 'dist/test/')).toBeFalsy();
    expect(test('-d', 'dist/types/')).toBeFalsy();

    expect(output.code).toBe(0);
  });

  it('should create the library correctly', async () => {
    const output = execBinWithCache('build');

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
    const output = execBinWithCache('build');
    expect(output.code).toBe(0);

    const matched = grep(/regeneratorRuntime = r/, [
      'dist/index.cjs.development.cjs',
    ]);
    expect(matched).toBeTruthy();
  });

  it('should use lodash for the CJS build', () => {
    const output = execBinWithCache('build');
    expect(output.code).toBe(0);

    const matched = grep(/lodash/, [
      'dist/index.cjs.*.cjs',
    ]);
    expect(matched).toBeTruthy();
  });

  it('should use lodash-es for the ESM build', () => {
    const output = execBinWithCache('build');
    expect(output.code).toBe(0);

    const matched = grep(/lodash-es/, [
      'dist/index.esm.mjs'
    ]);
    expect(matched).toBeTruthy();
  });

  it("shouldn't replace lodash/fp", () => {
    const output = execBinWithCache('build');
    expect(output.code).toBe(0);

    const matched = grep(/lodash\/fp/, [
      'dist/index.cjs.*.cjs',
      'dist/index.esm.mjs'
    ]);
    expect(matched).toBeTruthy();
  });

  it('should clean the dist directory before rebuilding', () => {
    let output = execBinWithCache('build');
    expect(output.code).toBe(0);

    mv('package.json', 'package-og.json');
    mv('package2.json', 'package.json');

    mv('dist/index.cjs.development.cjs', 'dist/index.cjs.development.cjs.old');
    mv('dist/index.esm.mjs', 'dist/index.esm.mjs.old');

    // cache bust because we want to re-run this command with new package.json
    output = execBinWithCache('build', { noCache: true });

    // build-default files have been cleaned out
    [
      'dist/index.cjs.development.cjs.old',
      'dist/index.esm.mjs.old',
    ].forEach(file =>
    {
      expectShellTestFile(file, false);
    })

    checkCompileFiles();

    expect(output.code).toBe(0);

    // reset package.json files
    mv('package.json', 'package2.json');
    mv('package-og.json', 'package.json');
  });

  it("test", () =>
  {
    const output = execBinWithCache('test');

    expect(output.code).toBe(0);
  });

  afterAll(() => {
    //teardownStage(stageName);
  });
});
