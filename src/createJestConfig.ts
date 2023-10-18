import { Config } from '@jest/types';
import { requireResolveCore } from '@yarn-tool/require-resolve';
import { paths } from './constants';
import { __ROOT_TSDX } from './const';

export type JestConfigOptions = Partial<Config.InitialOptions>;

export function _requireResolve(name: string)
{
	let result = requireResolveCore(name, {
		includeGlobal: true,
		includeCurrentDirectory: true,
		paths: [
			paths.appRoot,
			__ROOT_TSDX,
		],
	})

	return result
}

export function createJestConfig(rootDir: string): JestConfigOptions
{
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
			_requireResolve('jest-watch-typeahead/filename'),
			_requireResolve('jest-watch-typeahead/testname'),
		],
		passWithNoTests: true,
	};

	return config;
}
