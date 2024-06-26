import { execBinWithCache, shellSilentInCi } from '../utils/shell';
import {
  checkCompileFiles,
  checkCompileFilesDeclarationCustom,
  getStageName,
  setupStageWithFixture,
  teardownStage,
} from '../utils/fixture';

shellSilentInCi();

const testDir = 'e2e' as const;
const fixtureName = 'build-withTsconfig' as const;
const stageName = getStageName(testDir, fixtureName);

describe('tsdx build :: build with custom tsconfig.json options', () => {
  beforeAll(() => {
    teardownStage(stageName);
    setupStageWithFixture(testDir, stageName, fixtureName);
  });

  it('should use the declarationDir when set', () => {
    const output = execBinWithCache('build');

    checkCompileFiles({
      ignoreESM: true,
      ignoreDeclaration: true,
    });

    checkCompileFilesDeclarationCustom('typings');

    expect(output.code).toBe(0);
  });

  it('should set __esModule according to esModuleInterop', () => {
    const output = execBinWithCache('build');

    const lib = require(`../../${stageName}/dist/index.cjs.production.min.cjs`);
    // if esModuleInterop: false, no __esModule is added, therefore undefined
    expect(lib.__esModule).toBe(undefined);

    expect(output.code).toBe(0);
  });

  it('should read custom --tsconfig path', () => {
    const output = execBinWithCache('build --format cjs --tsconfig ./src/tsconfig.json'
    );

    checkCompileFiles({
      ignoreESM: true,
      ignoreDeclaration: true,
    });

    checkCompileFilesDeclarationCustom('typingsCustom');

    expect(output.code).toBe(0);
  });

  afterAll(() => {
    teardownStage(stageName);
  });
});
