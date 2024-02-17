import { NormalizedOpts, TsdxOptions } from '../types';
import { findTsconfig } from '@yarn-tool/find-tsconfig';
import { paths } from '../constants';
import { resolve } from 'upath2';
import { pathExistsSync } from 'fs-extra';

export function handleTsconfigPath<T extends Pick<NormalizedOpts | TsdxOptions, 'tsconfig'>>(opts: T)
{
	let tsconfig = opts.tsconfig;

	if (tsconfig)
	{
		tsconfig = resolve(paths.appRoot, tsconfig)
	}
	else
	{
		tsconfig = void 0
	}

	const tsconfigPath = tsconfig || findTsconfig(paths.appRoot) || paths.tsconfigJson;

	return {
		tsconfig,
		tsconfigPath,
	}
}

export function assertTsconfigPathExists(tsconfig: string, tsconfigPath: string)
{
	if (tsconfig && !pathExistsSync(tsconfigPath))
	{
		throw new Error('Target tsconfig does not exist: ' + tsconfigPath);
	}
}
