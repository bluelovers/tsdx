import { prog } from './_';
import { createJestConfig, JestConfigOptions } from '../../createJestConfig';
import { dirname } from 'path';
import { paths } from '../../constants';
import { appPackageJson } from '../appPackageJson';
import { pathExists } from 'fs-extra';
import { resolveApp } from '../../utils';
import { run as jestRun } from 'jest';

prog
	.command('test')
	.describe('Run jest test runner. Passes through all flags directly to Jest')
	.action(async (opts: { config?: string }) =>
	{
		// Do this as the first thing so that any code reading it knows the right env.
		process.env.BABEL_ENV = 'test';
		process.env.NODE_ENV = 'test';
		// Makes the script crash on unhandled rejections instead of silently
		// ignoring them. In the future, promise rejections that are not handled will
		// terminate the Node.js process with a non-zero exit code.
		process.on('unhandledRejection', err =>
		{
			throw err;
		});

		const argv = process.argv.slice(2);
		let jestConfig: JestConfigOptions = {
			...createJestConfig(
				opts.config ? dirname(opts.config) : paths.appRoot
			),
			...appPackageJson.jest,
			passWithNoTests: true,
		};

		// Allow overriding with jest.config
		const defaultPathExists = await pathExists(paths.jestConfig);
		if (opts.config || defaultPathExists)
		{
			const jestConfigPath = resolveApp(opts.config || paths.jestConfig);
			const jestConfigContents: JestConfigOptions = require(jestConfigPath);
			jestConfig = { ...jestConfig, ...jestConfigContents };
		}

		// if custom path, delete the arg as it's already been merged
		if (opts.config)
		{
			let configIndex = argv.indexOf('--config');
			if (configIndex !== -1)
			{
				// case of "--config path", delete both args
				argv.splice(configIndex, 2);
			}
			else
			{
				// case of "--config=path", only one arg to delete
				const configRegex = /--config=.+/;
				configIndex = argv.findIndex(arg => arg.match(configRegex));
				if (configIndex !== -1)
				{
					argv.splice(configIndex, 1);
				}
			}
		}

		argv.push(
			'--config',
			JSON.stringify({
				...jestConfig,
			})
		);

		const [, ...argsToPassToJestCli] = argv;
		return jestRun(argsToPassToJestCli);
	});
