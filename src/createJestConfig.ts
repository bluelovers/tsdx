import { Config } from '@jest/types';
import { requireResolveCore } from '@yarn-tool/require-resolve';
import { paths } from './constants';
import { __ROOT_TSDX } from './const';
import {
	_handleFileExtensions,
	defaultCoverageFileExtensions,
	defaultTestFileExtensions, defaultTransformFileExtensions,
	makeTestRegexConfig,
	mixinJestConfig,
} from '@bluelovers/jest-config';

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
	const config = mixinJestConfig({
		transform: {
			[`.(${_handleFileExtensions(defaultTransformFileExtensions(), '|')})$`]: _requireResolve('ts-jest'),
			[`.(${_handleFileExtensions(['js', 'jsx', 'cjs', 'mjs'], '|')})$`]: _requireResolve('babel-jest'), // jest's default
		},
		transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
		//moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
		collectCoverageFrom: [
			`src/**/*.{${_handleFileExtensions(defaultCoverageFileExtensions(), ',')}}`,
		],
		//testRegex: null as undefined,
		//testMatch: ['<rootDir>/**/*.(spec|test).{ts,tsx,js,jsx}'],
		...makeTestRegexConfig([...defaultTestFileExtensions(), 'ts', 'tsx', 'js', 'jsx']),
		// @ts-ignore
		testURL: 'http://localhost',
		rootDir,
		watchPlugins: [
			_requireResolve('jest-watch-typeahead/filename'),
			_requireResolve('jest-watch-typeahead/testname'),
		],
		passWithNoTests: true,
	} satisfies JestConfigOptions)

	return config;
}
