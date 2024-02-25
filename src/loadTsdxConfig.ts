import { OutputOptions, RollupOptions } from 'rollup';
import { TsdxOptions } from './types';
import { existsSync } from 'fs-extra';
import { paths } from './constants';
import { ITSResolvable } from 'ts-type/lib/generic';

export interface ITsdxConfig
{
	rollup<T extends RollupOptions & { output: OutputOptions }>(config: T, _options: TsdxOptions): ITSResolvable<T>;
}

let tsdxConfig: ITsdxConfig;

export async function loadTsdxConfig()
{
	if (typeof tsdxConfig === 'undefined')
	{
		tsdxConfig = {} as any;

		// check for custom tsdx.config.js
		if (existsSync(paths.appConfig))
		{
			tsdxConfig = require(paths.appConfig);
		}

		tsdxConfig.rollup ??= (config) => config
	}

	return tsdxConfig
}
