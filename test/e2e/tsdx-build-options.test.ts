import * as shell from 'shelljs';

import * as util from '../utils/fixture';
import { execWithCache, grep } from '../utils/shell';
import { checkCompileFiles } from '../utils/fixture';
import { test } from 'shelljs';

shell.config.silent = false;

const testDir = 'e2e';
const fixtureName = 'build-default';
// create a second version of build-default's stage for concurrent testing
const stageName = `stage-${testDir}-${fixtureName}`;

describe('tsdx build :: options', () => {
  beforeAll(() => {
    util.teardownStage(stageName);
    util.setupStageWithFixture(testDir, stageName, fixtureName);
  });

  it('should compile all formats', () => {
    const output = execWithCache(
      'node ../dist/index.js build --format cjs,esm,umd,system'
    );

    checkCompileFiles();

    [
      'dist/index.umd.development.cjs',
      'dist/index.umd.production.min.cjs',
      'dist/index.system.development.cjs',
      'dist/index.system.production.min.cjs',
    ].forEach(file =>
    {
      expect(test('-f', file)).toBeTruthy();
    })

    expect(output.code).toBe(0);
  });

  it.skip('should not bundle regeneratorRuntime when targeting Node', () => {
    const output = execWithCache('node ../dist/index.js build --target node');
    expect(output.code).toBe(0);

    const matched = grep(/regeneratorRuntime = r/, ['dist/build-default.*.js']);
    expect(matched).toBeFalsy();
  });

  afterAll(() => {
    util.teardownStage(stageName);
  });
});
