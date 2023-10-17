import { Config } from '@jest/types';

export type JestConfigOptions = Partial<Config.InitialOptions>;

function _requireResolve(name: string)
{
  let result;

  try
  {
    // @ts-ignore
    const { requireResolveExtra, requireResolveCore } = require('@yarn-tool/require-resolve');

    const paths = [
      requireResolveExtra('@bluelovers/tsdx').result,
      requireResolveExtra('tsdx').result,
    ].filter(Boolean);

    result = requireResolveCore(name, {
      includeGlobal: true,
      includeCurrentDirectory: true,
      paths,
    })
  }
  catch (e)
  {

  }

  result ||= require.resolve(name);

  console.info('[require.resolve]', name, '=>', result)

  return result
}

export function createJestConfig(
  _: (relativePath: string) => void,
  rootDir: string
): JestConfigOptions {
  const config: JestConfigOptions = {
    transform: {
      '.(ts|tsx)$': _requireResolve('ts-jest'),
      '.(js|jsx)$': _requireResolve('babel-jest'), // jest's default
    },
    transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}'],
    testMatch: ['<rootDir>/**/*.(spec|test).{ts,tsx,js,jsx}'],
    // @ts-ignore
    testURL: 'http://localhost',
    rootDir,
    watchPlugins: [
      require.resolve('jest-watch-typeahead/filename'),
      require.resolve('jest-watch-typeahead/testname'),
    ],
    passWithNoTests: true,
  };

  return config;
}
