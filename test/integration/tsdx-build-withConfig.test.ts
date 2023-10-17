import { readFile } from 'fs-extra';
import { config, test } from 'shelljs';

import { execWithCache } from '../utils/shell';
import { checkCompileFiles, setupStageWithFixture, teardownStage } from '../utils/fixture';

config.silent = false;

const testDir = 'integration';
const fixtureName = 'build-withConfig';
const stageName = `stage-integration-${fixtureName}`;

describe('integration :: tsdx build :: tsdx.config.js', () => {
  beforeAll(() => {
    teardownStage(stageName);
    setupStageWithFixture(testDir, stageName, fixtureName);
  });

  it('should create a CSS file in the dist/ directory', () => {
    const output = execWithCache('node ../dist/index.js build');

    // TODO: this is kind of subpar naming, rollup-plugin-postcss just names it
    // the same as the output file, but with the .css extension
    expect(test('-f', 'dist/index.cjs.development.css'));

    expect(output.code).toBe(0);
  });

  it('should autoprefix and minify the CSS file', async () => {
    const output = execWithCache('node ../dist/index.js build');

    const cssText = await readFile(
      './dist/index.cjs.development.css'
    );

    // autoprefixed and minifed output
    expect(
      cssText.includes('.test::-moz-placeholder{color:"blue"}')
    ).toBeTruthy();

    expect(output.code).toBe(0);
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
