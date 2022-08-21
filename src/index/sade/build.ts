import { prog } from './_';
import { BuildOpts } from '../../types';
import { normalizeOpts } from '../normalizeOpts';
import { printOptsTable } from '../printOptsTable';
import { createBuildConfigs } from '../../createBuildConfigs';
import { cleanDistFolder } from '../cleanDistFolder';
import { createProgressEstimator } from '../../createProgressEstimator';
import { writeCjsEntryFile } from '../writeCjsEntryFile';
import { mapSeries } from 'bluebird';
import { OutputOptions, rollup, RollupOptions } from 'rollup';
import { moveTypes } from '../../deprecated';
import { logError } from '../../logError';
import { assertCheckEntryExists } from '../checkEntryExists';
import { EnumFormat } from '../../const';

prog
	.command('build')
	.describe('Build your project once and exit')
	.option('--entry, -i', 'Entry module')
	.example('build --entry src/foo.tsx')
	.option('--target', 'Specify your target environment', 'node')
	.example('build --target node')
	.example('build --target browser')
	.option('--name', 'Specify name exposed in UMD builds')
	.example('build --name Foo')
	.option('--outputName', 'Specify name of output file', 'index')
	.example('build --outputName index')
	.option('--format', 'Specify module format(s)', 'cjs,esm,umd')
	.example('build --format cjs,esm')
	.option('--noClean', "Don't clean the dist folder")
	.example('build --noClean')
	.option('--tsconfig', 'Specify custom tsconfig path')
	.example('build --tsconfig ./tsconfig.foo.json')
	.option('--transpileOnly', 'Skip type checking')
	.example('build --transpileOnly')
	.option('--esmMinify', 'Minify esm')
	.example('build --esmMinify')
	.option(
		'--extractErrors',
		'Extract errors to ./errors/codes.json and provide a url for decoding.'
	)
	.example(
		'build --extractErrors=https://reactjs.org/docs/error-decoder.html?invariant='
	)
	.action(async (dirtyOpts: BuildOpts) =>
	{
		const opts = await normalizeOpts(dirtyOpts);

		printOptsTable(opts);

		await assertCheckEntryExists(opts);

		const buildConfigs = await createBuildConfigs(opts);
		if (!opts.noClean)
		{
			await cleanDistFolder();
		}

		const logger = await createProgressEstimator();
		if (opts.format.includes(EnumFormat.cjs))
		{
			const promise = writeCjsEntryFile(opts.outputName || opts.name).catch(logError);
			await logger(promise, 'Creating CJS entry file');
		}
		try
		{
			const promise = mapSeries(
					buildConfigs,
					async (inputOptions: RollupOptions & { output: OutputOptions }) =>
					{
						const bundle = await rollup(inputOptions);
						return bundle.write(inputOptions.output);
					}
				)
				.tap(moveTypes);
			await logger(promise, 'Building modules');
		}
		catch (error)
		{
			logError(error);
			process.exit(1);
		}
	});
