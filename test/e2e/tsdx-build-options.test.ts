import { checkCompileFiles, setupStageWithFixture, teardownStage } from '../utils/fixture';
import { execBinWithCache, grep, shellSilentInCi } from '../utils/shell';
import { expectShellTestFile } from '../utils/test-utils';

shellSilentInCi();

const testDir = 'e2e';
const fixtureName = 'build-default';
// create a second version of build-default's stage for concurrent testing
const stageName = `stage-${testDir}-${fixtureName}`;

describe('tsdx build :: options', () => {
  beforeAll(() => {
    teardownStage(stageName);
    setupStageWithFixture(testDir, stageName, fixtureName);
  });

  it('should compile all formats', () => {
    const output = execBinWithCache('build --format cjs,esm,umd,system'
    );

    checkCompileFiles();

    [
      'dist/index.umd.development.cjs',
      'dist/index.umd.production.min.cjs',
      'dist/index.system.development.cjs',
      'dist/index.system.production.min.cjs',
    ].forEach(file =>
    {
      expectShellTestFile(file);
    })

    expect(output.code).toBe(0);
  });

  it.skip('should not bundle regeneratorRuntime when targeting Node', () => {
    const output = execBinWithCache('build --target node');
    expect(output.code).toBe(0);

    const matched = grep(/regeneratorRuntime = r/, ['dist/build-default.*.js']);
    expect(matched).toBeFalsy();
  });

  afterAll(() => {
    teardownStage(stageName);
  });
});
