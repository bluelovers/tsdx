import { execWithCache } from '../utils/shell';
import { checkCompileFiles, grepCompileFiles, setupStageWithFixture, teardownStage } from '../utils/fixture';
import { config } from 'shelljs';

config.silent = false;

const testDir = 'integration';
const fixtureName = 'build-withBabel';
const stageName = `stage-integration-${fixtureName}`;

describe('integration :: tsdx build :: .babelrc.js', () => {
  beforeAll(() => {
    teardownStage(stageName);
    setupStageWithFixture(testDir, stageName, fixtureName);
  });

  it('should convert styled-components template tags', () => {
    const output = execWithCache('node ../dist/index.js build');
    expect(output.code).toBe(0);

    // from styled.h1` to styled.h1.withConfig(
    const matched = grepCompileFiles(/styled.h1.withConfig\(/);
    expect(matched).toBeTruthy();
  });

  // TODO: make styled-components work with its Babel plugin and not just its
  // macro by allowing customization of plugin order
  it('should remove comments in the CSS', () => {
    const output = execWithCache('node ../dist/index.js build');
    expect(output.code).toBe(0);

    // the comment "should be removed" should no longer be there
    const matched = grepCompileFiles(/should be removed/);
    expect(matched).toBeFalsy();
  });

  it('should merge and apply presets', () => {
    const output = execWithCache('node ../dist/index.js build');
    expect(output.code).toBe(0);

    // ensures replace-identifiers was used
    const matched = grepCompileFiles(/replacedSum/);
    expect(matched).toBeTruthy();
  });

  it('should compile files into a dist directory', () => {
    const output = execWithCache('node ../dist/index.js build');

    checkCompileFiles();

    expect(output.code).toBe(0);
  });

  afterAll(() => {
    teardownStage(stageName);
  });
});
