import { checkCompileFiles, setupStageWithFixture, teardownStage } from '../utils/fixture';
import { execBinWithCache, shellSilentInCi } from '../utils/shell';
import { expectShellTestFile } from '../utils/test-utils';

shellSilentInCi()

const testDir = 'integration';
const fixtureName = 'build-options';
const stageName = `stage-${testDir}-${fixtureName}`;

describe('integration :: tsdx build :: options', () => {

  beforeAll(() => {
    teardownStage(stageName);
    setupStageWithFixture(testDir, stageName, fixtureName);
  });

  it('should create errors/ dir with --extractErrors', () => {
    const output = execBinWithCache('build --extractErrors');

    expectShellTestFile('errors/ErrorDev.js');
    expectShellTestFile('errors/ErrorProd.js');
    expectShellTestFile('errors/codes.json');

    expect(output.code).toBe(0);
  });

  it('should have correct errors/codes.json', () => {
    const output = execBinWithCache('build --extractErrors');

    const errors = require(`../../${stageName}/errors/codes.json`);
    expect(errors['0']).toBe('error occurred! o no');
    // TODO: warning is actually not extracted, only invariant
    // expect(errors['1']).toBe('warning - water is wet');

    expect(output.code).toBe(0);
  });

  it('should compile files into a dist directory', () => {
    const output = execBinWithCache('build --extractErrors');

    checkCompileFiles();

    expect(output.code).toBe(0);
  });

  afterAll(() => {
    teardownStage(stageName);
  });
});
