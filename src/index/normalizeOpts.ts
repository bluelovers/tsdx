import { NormalizedOpts, WatchOpts } from '../types';
import { appPackageJson } from './appPackageJson';
import { getInputs } from './getInputs';
import { EnumTsdxFormat, IModuleFormat } from '@ts-type/tsdx-extensions-by-format';
import { array_unique } from 'array-hyper-unique';

export function normalizeFormat(rawFormat: string)
{
	const list = rawFormat
		.split(/\s*,\s*/)
		.map((format: string) =>
		{
			format = format.trim();
			if (format === 'es')
			{
				return EnumTsdxFormat.esm;
			}
			return format;
		})
	;

	if (list.includes(EnumTsdxFormat.esm))
	{
		list.unshift(EnumTsdxFormat.esm);
	}

	return array_unique(list) as [IModuleFormat, ...IModuleFormat[]]
}

export function normalizeTarget(opts: WatchOpts)
{
	let target: string | WatchOpts["target"] = opts.target;
	let targetVersion: string = opts.targetVersion;

	if (target?.length)
	{
		let _m: RegExpExecArray;
		target = target.toLowerCase();

		if (target === 'node')
		{
			//targetVersion = '12';
		}
		else if (target === 'current')
		{
			target = 'node';
			targetVersion = 'current';
		}
		else if ((_m = /^(?:node)?(\d+)$/.exec(target))?.[1])
		{
			target = 'node';
			targetVersion = _m[1];
		}
	}

	if (targetVersion === 'node' && target === 'node')
	{
		targetVersion = 'current';
	}

	return {
		target,
		targetVersion,
	}
}

export async function normalizeOpts<T extends WatchOpts>(opts: T): Promise<NormalizedOpts & T>
{
	const format = normalizeFormat(opts.format);
	return <NormalizedOpts & T>{
		...opts,
		...normalizeTarget(opts),
		name: opts.name !== 'index' && opts.name || appPackageJson.name,
		outputName: opts.outputName || 'index',
		input: await getInputs(opts.entry, appPackageJson.source, format),
		format,
		esmMinify: opts.esmMinify,
	};
}
