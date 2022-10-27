import { NormalizedOpts, WatchOpts } from '../types';
import { appPackageJson } from './appPackageJson';
import { getInputs } from './getInputs';
import { EnumTsdxFormat, IModuleFormat } from '@ts-type/tsdx-extensions-by-format';
import { array_unique } from 'array-hyper-unique';

export function normalizeFormat(rawFormat: string)
{
	return array_unique(rawFormat.split(',').map((format: string) =>
	{
		if (format === 'es')
		{
			return EnumTsdxFormat.esm;
		}
		return format;
	})) as [IModuleFormat, ...IModuleFormat[]]
}

export async function normalizeOpts(opts: WatchOpts): Promise<NormalizedOpts>
{
	const format = normalizeFormat(opts.format);
	return {
		...opts,
		name: opts.name !== 'index' && opts.name || appPackageJson.name,
		outputName: opts.outputName || 'index',
		input: await getInputs(opts.entry, appPackageJson.source, format),
		format,
		esmMinify: opts.esmMinify,
	};
}
