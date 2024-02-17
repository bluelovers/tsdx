const { mixinJestConfig } = require('@bluelovers/jest-config');

/**
 * // @type { import('@jest/types').Config.InitialOptions }
 * // @type { import('ts-jest').InitialOptionsTsJest }
 * @type { import('ts-jest').JestConfigWithTsJest }
 */
const jestConfig = mixinJestConfig({
	testEnvironment: 'node',
	testMatch: ['<rootDir>/test/**/*(*.)@(test).[tj]s?(x)'],
	testPathIgnorePatterns: [
		'/node_modules/', // default
		'<rootDir>/templates/', // don't run tests in the templates
		'<rootDir>/templates/*',
		'templates/*',
		'/templates/',
		'templates',
		'<rootDir>/test/.*/fixtures/', // don't run tests in fixtures
		'<rootDir>/stage-.*/', // don't run tests in auto-generated (and auto-removed) test dirs
	],
	"setupFilesAfterEnv": ["jest-expect-message"]
}, true, {
	file: __filename,
});

module.exports = jestConfig;
