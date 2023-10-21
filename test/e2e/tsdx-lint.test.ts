import { getFixturePath, setupStageWithFixture, teardownStage } from '../utils/fixture';
import { join } from 'upath2';
import { __ROOT_TEST } from '../__root';
import { execBin } from '../utils/shell';
import { expectShellTestFile } from '../utils/test-utils';

const testDir = 'e2e';
const fixtureName = 'lint';
const stageName = `stage-${testDir}-${fixtureName}`;

const lintDir = join(__ROOT_TEST, getFixturePath(testDir, fixtureName));

function testLintFile(fileName: string, code: number = 0, argv: string | unknown[] = [])
{
  const argvString = [argv].flat().join(' ');

  const testFile = `${lintDir}/${fileName}`;
  const output = execBin(`lint "${testFile}" ${argvString}`);

  expect(output.code).toBe(code);

  return output
}

describe('tsdx lint', () => {
  it('should fail to lint a ts file with errors', () => {
    const output = testLintFile('file-with-lint-errors.ts', 1);

    expect(output.stdout).toMatch('Parsing error:');
  });

  it('should succeed linting a ts file without errors', () => {
    const output = testLintFile('file-without-lint-error.ts', 0);

    expect(output.code).toBe(0);
  });

  it('should fail to lint a ts file with prettier errors', () => {
    const output = testLintFile('file-with-prettier-lint-errors.ts', 1);

    expect(output.stdout.includes('prettier/prettier')).toBe(true);
  });

  it('should fail to lint a tsx file with errors', () => {
    const output = testLintFile('react-file-with-lint-errors.tsx', 1);

    expect(output.stdout).toMatch('Parsing error:');
  });

  it('should succeed linting a tsx file without errors', () => {
    testLintFile('react-file-without-lint-error.tsx', 0);
  });

  it('should succeed linting a ts file with warnings when --max-warnings is not used', () => {
    const output = testLintFile('file-with-lint-warnings.ts', 0);

    expect(output.stdout.includes('@typescript-eslint/no-unused-vars')).toBe(
      true
    );
  });

  it('should succeed linting a ts file with fewer warnings than --max-warnings', () => {
    const output = testLintFile('file-with-lint-warnings.ts', 0, [
      '--max-warnings',
      4,
    ]);

    expect(output.stdout.includes('@typescript-eslint/no-unused-vars')).toBe(
      true
    );
  });

  it('should succeed linting a ts file with same number of warnings as --max-warnings', () => {
    const output = testLintFile('file-with-lint-warnings.ts', 0, [
      '--max-warnings',
      3,
    ]);

    expect(output.stdout.includes('@typescript-eslint/no-unused-vars')).toBe(
      true
    );
  });

  it('should fail to lint a ts file with more warnings than --max-warnings', () => {
    const output = testLintFile('file-with-lint-warnings.ts', 1, [
      '--max-warnings',
      2,
    ]);

    expect(output.stdout.includes('@typescript-eslint/no-unused-vars')).toBe(
      true
    );
  });

  it('should not lint', () => {
    const output = execBin(`lint`);
    expect(output.code).toBe(1);
    expect(output.toString()).toContain('Defaulting to "tsdx lint src test"');
    expect(output.toString()).toContain(
      'You can override this in the package.json scripts, like "lint": "tsdx lint src otherDir"'
    );
  });

  describe('when --write-file is used', () => {
    beforeEach(() => {
      teardownStage(stageName);
      setupStageWithFixture(testDir, stageName, 'build-default');
    });

    it('should create the file', () => {
      const output = execBin(`lint --write-file`);

      expectShellTestFile('.eslintrc.js');
      expect(output.code).toBe(0);
    });

    afterAll(() => {
      teardownStage(stageName);
    });
  });
});
