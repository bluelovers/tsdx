import { OutputOptions, RollupOptions } from 'rollup';
import { existsSync } from 'fs-extra';
import { concatAllArray } from 'jpjs';

import { paths } from './constants';
import { ModuleFormat, NormalizedOpts, TsdxOptions } from './types';

import { createRollupConfig } from './createRollupConfig';
import { EnumFormat } from './const';

// check for custom tsdx.config.js
let tsdxConfig = {
	rollup(config: RollupOptions, _options: TsdxOptions): RollupOptions
	{
		return config;
	},
};

if (existsSync(paths.appConfig))
{
	tsdxConfig = require(paths.appConfig);
}

export async function createBuildConfigs(
	opts: NormalizedOpts,
): Promise<Array<RollupOptions & { output: OutputOptions }>>
{
	const allInputs = concatAllArray(
		opts.input.map((input: string) =>
			createAllFormats(opts, input).map(
				(options: TsdxOptions, index: number) => ({
					...options,
					// We want to know if this is the first run for each entryfile
					// for certain plugins (e.g. css)
					writeMeta: index === 0,
				}),
			),
		),
	);

	return await Promise.all(
		allInputs.map(async (options: TsdxOptions, index: number) =>
		{
			// pass the full rollup config to tsdx.config.js override
			const config = await createRollupConfig(options, index);
			return tsdxConfig.rollup(config, options);
		}),
	);
}

function createFormats(
	format: ModuleFormat,
	opts: NormalizedOpts,
	input: string,
)
{
	if (format === EnumFormat.esm && !opts.esmMinify)
	{
		return [
			{
				...opts,
				format,
				input,
			},
		]
	}

	return [
		{
			...opts,
			format,
			env: 'development',
			input,
		},
		{
			...opts,
			format,
			env: 'production',
			input,
		},
	]
}

function createAllFormats(
	opts: NormalizedOpts,
	input: string,
): [TsdxOptions, ...TsdxOptions[]]
{
	return [
		EnumFormat.cjs,
		EnumFormat.esm,
		EnumFormat.umd,
		EnumFormat.system,
	]
		.map(format => opts.format.includes(format) && createFormats(format, opts, input))
		.flat()
		.filter(Boolean) as [TsdxOptions, ...TsdxOptions[]]
		;
}
