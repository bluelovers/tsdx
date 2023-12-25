import { Config } from '@jest/types';
import { requireResolveCore } from '@yarn-tool/require-resolve';
import { __ROOT_TSDX } from './const';
import {
	_handleFileExtensions,
	defaultCoverageFileExtensions,
	defaultTestFileExtensions,
	defaultTransformFileExtensions,
	makeTestRegexConfig
} from '@bluelovers/jest-config';
import { RollupOptions } from 'rollup';
import { IAppPaths } from './utils/paths';

export type JestConfigOptions = Partial<Config.InitialOptions>;

export function _requireResolve<T extends string>(name: T, paths: IAppPaths)
{
	let result = requireResolveCore(name, {
		includeGlobal: true,
		includeCurrentDirectory: true,
		paths: [
			paths.appRoot,
			__ROOT_TSDX,
		],
	})

	return result as T
}

export function createJestConfig({
	rootDir,
	paths,
}: {
	rootDir: string,
	paths: IAppPaths,
}, rollupOptions?: RollupOptions): JestConfigOptions
{
	const config = {
		transform: {
			[`.(${_handleFileExtensions([...defaultTransformFileExtensions(), 'js', 'jsx', 'cjs', 'mjs'], '|')})$`]: [
				_requireResolve('rollup-jest', paths),
				<RollupOptions>{
					...rollupOptions,
				},
			] as Config.TransformerConfig,
			//[`.(${_handleFileExtensions(['js', 'jsx', 'cjs', 'mjs'], '|')})$`]: _requireResolve('babel-jest'), // jest's default
		},
		transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
		//moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
		collectCoverageFrom: [
			`src/**/*.{${_handleFileExtensions(defaultCoverageFileExtensions(), ',')}}`,
		],
		//testRegex: null as undefined,
		//testMatch: ['<rootDir>/**/*.(spec|test).{ts,tsx,js,jsx}'],
		...makeTestRegexConfig([...defaultTestFileExtensions(), 'ts', 'tsx', 'js', 'jsx', 'cjs', 'mjs']),
		// @ts-ignore
		testURL: 'http://localhost',
		rootDir,
		watchPlugins: [
			_requireResolve('jest-watch-typeahead/filename', paths),
			_requireResolve('jest-watch-typeahead/testname', paths),
		],
		passWithNoTests: true,
	} satisfies JestConfigOptions

	return config;
}
