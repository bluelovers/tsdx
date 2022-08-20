import { ModuleFormat, NormalizedOpts, WatchOpts } from '../types';
import { appPackageJson } from './appPackageJson';
import { getInputs } from './getInputs';
import { EnumFormat } from '../const';

export async function normalizeOpts(opts: WatchOpts): Promise<NormalizedOpts>
{
	return {
		...opts,
		name: opts.name !== 'index' && opts.name || appPackageJson.name,
		outputName: opts.outputName || 'index',
		input: await getInputs(opts.entry, appPackageJson.source),
		format: opts.format.split(',').map((format: string) =>
		{
			if (format === 'es')
			{
				return EnumFormat.esm;
			}
			return format;
		}) as [ModuleFormat, ...ModuleFormat[]],
		esmMinify: opts.esmMinify,
	};
}
