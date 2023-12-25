import { prog } from './_';
import { createJestConfig, JestConfigOptions } from '../../createJestConfig';
import { dirname } from 'path';
import { paths, resolveApp } from '../../constants';
import { appPackageJson } from '../appPackageJson';
import { pathExists } from 'fs-extra';
import { runCLI as jestRun } from 'jest';
import { mixinJestConfig } from '@bluelovers/jest-config';
import { normalizeOpts } from '../normalizeOpts';
import { EnumTsdxFormat } from '@ts-type/tsdx-extensions-by-format';
import { BuildOpts } from '../../types';
import { createBuildConfigs } from '../../createBuildConfigs';

prog
	.command('test')
	.describe('Run jest test runner. Passes through all flags directly to Jest')
	.option('--target', 'Specify your target environment', 'node')
	.example('build --target node')
	.option('--format', 'Specify module format(s)', EnumTsdxFormat.esm)
	.example('build --format esm')
	.option('--tsconfig', 'Specify custom tsconfig path')
	.example('test --tsconfig ./tsconfig.foo.json')
	.option('--jestconfig', 'Specify custom jest.config path')
	.example('test --jestconfig ./jest.config.js')
	.action(async (dirtyOpts: {
		jestconfig?: string,
	} & Pick<BuildOpts, 'format' | 'target' | 'tsconfig'>) =>
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

		const opts = await normalizeOpts(dirtyOpts);

		const buildConfigs = await createBuildConfigs(opts).then(ls => ls[0]);

		const argv = process.argv.slice(2);
		let jestConfig: JestConfigOptions = {
			...createJestConfig({
					rootDir: opts.jestconfig ? dirname(opts.jestconfig) : paths.appRoot,
					paths,
				}, buildConfigs
			),
			...appPackageJson.jest,
			passWithNoTests: true,
		};

		// Allow overriding with jest.config
		const defaultPathExists = await pathExists(paths.jestConfig);
		if (opts.jestconfig || defaultPathExists)
		{
			const jestConfigPath = resolveApp(opts.jestconfig || paths.jestConfig);

			console.log(`jestConfigPath:`, jestConfigPath);

			const jestConfigContents: JestConfigOptions = require(jestConfigPath);
			jestConfig = { ...jestConfig, ...jestConfigContents };
		}

//		console.dir(jestConfig, {
//			colors: true,
//		});

		// if custom path, delete the arg as it's already been merged
		if (opts.jestconfig)
		{
			let configIndex = argv.indexOf('--jestconfig');
			if (configIndex !== -1)
			{
				// case of "--config path", delete both args
				argv.splice(configIndex, 2);
			}
			else
			{
				// case of "--config=path", only one arg to delete
				const configRegex = /--jestconfig=.+/;
				configIndex = argv.findIndex(arg => arg.match(configRegex));
				if (configIndex !== -1)
				{
					argv.splice(configIndex, 1);
				}
			}
		}

		jestConfig = mixinJestConfig(jestConfig, true);
		delete jestConfig['testURL'];
//		console.log(`mixinJestConfig`)
		console.dir({
			jestConfig,
			buildConfigs,
		}, {
			colors: true,
			depth: 4,
		});

		argv.push(
			'--config',
			JSON.stringify(jestConfig)
		);

		//const [, ...argsToPassToJestCli] = argv;
		// @ts-ignore
		return jestRun({
			// @ts-ignore
			config: jestConfig,
			...jestConfig,
			debug: true,
		}, [paths.appRoot]);
	});
