import { prog } from './_';
import { WatchOpts } from '../../types';
import { createBuildConfigs } from '../../createBuildConfigs';
import execa from 'execa';
import ora from 'ora';
import { RollupWatchOptions, watch, WatcherOptions } from 'rollup';
import { clearConsole } from '../../utils';
import chalk from 'chalk';
import { logError } from '../../logError';
import { moveTypes } from '../../deprecated';
import { normalizeOpts } from '../normalizeOpts';
import { cleanDistFolder } from '../cleanDistFolder';
import { writeCjsEntryFile } from '../writeCjsEntryFile';
import { EnumTsdxFormat } from '@ts-type/tsdx-extensions-by-format';

prog
	.command('watch')
	.describe('Rebuilds on any change')
	.option('--entry, -i', 'Entry module')
	.example('watch --entry src/foo.tsx')
	.option('--target', 'Specify your target environment', 'browser')
	.example('watch --target node')
	.option('--name', 'Specify name exposed in UMD builds')
	.example('watch --name Foo')
	.option('--outputName', 'Specify name of output file', 'index')
	.example('build --outputName index')
	.option('--format', 'Specify module format(s)', 'cjs,esm')
	.example('watch --format cjs,esm')
	.option(
		'--verbose',
		'Keep outdated console output in watch mode instead of clearing the screen'
	)
	.example('watch --verbose')
	.option('--noClean', "Don't clean the dist folder")
	.example('watch --noClean')
	.option('--tsconfig', 'Specify custom tsconfig path')
	.example('watch --tsconfig ./tsconfig.foo.json')
	.option('--onFirstSuccess', 'Run a command on the first successful build')
	.example('watch --onFirstSuccess "echo The first successful build!"')
	.option('--onSuccess', 'Run a command on a successful build')
	.example('watch --onSuccess "echo Successful build!"')
	.option('--onFailure', 'Run a command on a failed build')
	.example('watch --onFailure "The build failed!"')
	.option('--transpileOnly', 'Skip type checking')
	.example('watch --transpileOnly')
	.option('--extractErrors', 'Extract invariant errors to ./errors/codes.json.')
	.example('watch --extractErrors')
	.action(async (dirtyOpts: WatchOpts) =>
	{
		const opts = await normalizeOpts(dirtyOpts);
		const buildConfigs = await createBuildConfigs(opts);
		if (!opts.noClean)
		{
			await cleanDistFolder();
		}
		if (opts.format.includes(EnumTsdxFormat.cjs))
		{
			await writeCjsEntryFile(opts.outputName || opts.name);
		}

		type Killer = execa.ExecaChildProcess | null;

		let firstTime = true;
		let successKiller: Killer = null;
		let failureKiller: Killer = null;

		function run(command?: string)
		{
			if (!command)
			{
				return null;
			}

			const [exec, ...args] = command.split(' ');
			return execa(exec, args, {
				stdio: 'inherit',
			});
		}

		function killHooks()
		{
			return Promise.all([
				successKiller ? successKiller.kill('SIGTERM') : null,
				failureKiller ? failureKiller.kill('SIGTERM') : null,
			]);
		}

		const spinner = ora().start();
		watch(
			(buildConfigs as RollupWatchOptions[]).map(inputOptions => ({
				watch: {
					silent: true,
					include: ['src/**'],
					exclude: ['node_modules/**'],
				} as WatcherOptions,
				...inputOptions,
			}))
		).on('event', async event =>
		{
			// clear previous onSuccess/onFailure hook processes so they don't pile up
			await killHooks();

			if (event.code === 'START')
			{
				if (!opts.verbose)
				{
					clearConsole();
				}
				spinner.start(chalk.bold.cyan('Compiling modules...'));
			}
			if (event.code === 'ERROR')
			{
				spinner.fail(chalk.bold.red('Failed to compile'));
				logError(event.error);
				failureKiller = run(opts.onFailure);
			}
			if (event.code === 'END')
			{
				spinner.succeed(chalk.bold.green('Compiled successfully'));
				console.log(`
  ${chalk.dim('Watching for changes')}
`);

				try
				{
					await moveTypes();

					if (firstTime && opts.onFirstSuccess)
					{
						firstTime = false;
						run(opts.onFirstSuccess);
					}
					else
					{
						successKiller = run(opts.onSuccess);
					}
				}
				catch (_error)
				{}
			}
		});
	});
