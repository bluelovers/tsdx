import { OutputOptions, RollupOptions } from 'rollup';
import { existsSync } from 'fs-extra';

import { paths } from './constants';
import { NormalizedOpts, TsdxOptions } from './types';

import { createRollupConfig } from './createRollupConfig';
import { EnumTsdxFormat, IModuleFormat, isAllowedFormat } from '@ts-type/tsdx-extensions-by-format';
import { map } from 'bluebird';

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

export function createBuildAllInputs(opts: NormalizedOpts)
{
	return opts.format.map(format => {
		if (isAllowedFormat(format))
		{
			const options = opts.input[format].map(input =>
			{
				return createFormats(format, opts, input) as TsdxOptions[]
			}).flat();

			options[0] = {
				...options[0],
				writeMeta: true,
			};

			return options;
		}

		return void 0
	}).flat().filter(Boolean)
}

export async function createBuildConfigs(
	opts: NormalizedOpts,
): Promise<Array<RollupOptions & { output: OutputOptions }>>
{
	/*
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
	 */
	const allInputs = createBuildAllInputs(opts);

	return map(allInputs, async (options: TsdxOptions, index: number) =>
		{
			// pass the full rollup config to tsdx.config.js override
			const config = await createRollupConfig(options, index);
			return tsdxConfig.rollup(config, options) as any;
		})
}

function createFormats(
	format: IModuleFormat,
	opts: NormalizedOpts,
	input: string,
)
{
	if (format === EnumTsdxFormat.esm && !opts.esmMinify)
	{
		return [
			{
				...opts,
				format,
				env: 'production',
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

/*
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
 */
