import path from 'upath2';
import { cd, ln, mkdir, rm } from 'shelljs';
import { __ROOT } from '../__root';
import { copySync } from 'fs-extra';
import { fsSameRealpath } from 'path-is-same';
import { grep } from './shell';
import { expectShellTestFile } from './test-utils';

export const rootDir = __ROOT;

export function getStagePath(stageName: string)
{
  const stagePath = path.join(rootDir, stageName);

  if (fsSameRealpath(rootDir, stagePath))
  {
    throw new RangeError(`stagePath not allow`)
  }

  return stagePath
}

export function getStageName<T extends string, F extends string>(testDir: T, fixtureName: F)
{
  return `stage-${testDir}-${fixtureName}` as const;
}

export function getFixturePath<T extends string, F extends string>(testDir: T, fixtureName: F)
{
  return `${testDir}/fixtures/${fixtureName}` as const
}

export function setupStageWithFixture(
  testDir: string,
  stageName: string,
  fixtureName: string
): void {
  const stagePath = getStagePath(stageName);
  mkdir(stagePath);
  copySync(`${rootDir}/test/${getFixturePath(testDir, fixtureName)}/`, `${stagePath}/`, {
    preserveTimestamps: true,
    overwrite: true,
  });
  ln(
    '-s',
    path.join(rootDir, 'node_modules'),
    path.join(stagePath, 'node_modules')
  );
  cd(stagePath);
}

export function teardownStage(stageName: string): void {
  cd(rootDir);
  const stagePath = getStagePath(stageName);
  rm('-rf', stagePath);
}

export function checkCompileFiles(opts?: {
  ignoreDeclaration?: boolean,
  ignoreESM?: boolean,
})
{
  [
    'dist/index.cjs',
    'dist/index.cjs.development.cjs',
    'dist/index.cjs.production.min.cjs',
    !opts?.ignoreESM && 'dist/index.esm.mjs',
    !opts?.ignoreDeclaration && 'dist/index.d.ts',
  ].forEach(file =>
  {
    file && expectShellTestFile(file);
  })
}

export function checkCompileFilesDeclarationCustom(typingsCustom: 'typingsCustom' | 'typings')
{
  expectShellTestFile('dist/index.d.ts', false);
  [
    `${typingsCustom}/index.d.ts`,
    `${typingsCustom}/index.d.ts.map`,
  ].forEach(file =>
  {
    expectShellTestFile(file);
  })
}

export function grepCompileFiles(pattern: RegExp, outputName: string = 'index')
{
  const matched = grep(pattern, [
    `dist/${outputName}.cjs.*.cjs`,
    `dist/${outputName}.esm.mjs`,
  ]);
  return matched
}
