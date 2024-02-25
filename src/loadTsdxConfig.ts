import { OutputOptions, RollupOptions } from 'rollup';
import { TsdxOptions } from './types';
import { paths } from './constants';
import { ITSResolvable } from 'ts-type/lib/generic';
import { isFile } from './index/isFile';

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
		for (const ext of [
			'.js',
			'.cjs',
			'.mjs',
		] as const)
		{
			if (await isFile(paths.appConfig + ext))
			{
				if (ext === '.mjs')
				{
					tsdxConfig = await import(paths.appConfig + ext);
				}
				else
				{
					tsdxConfig = require(paths.appConfig + ext);
				}
				break;
			}
		}

		// @ts-ignore
		tsdxConfig = tsdxConfig.default ?? tsdxConfig;

		tsdxConfig.rollup ??= (config) => config
	}

	return tsdxConfig
}
