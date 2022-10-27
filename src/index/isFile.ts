import { stat } from 'fs-extra';
import { resolveApp } from '../utils';
import { getExtensionsByFormat, IModuleFormat } from '@ts-type/tsdx-extensions-by-format';

export const isFile = (name: string) =>
	stat(name)
		.then(stats => stats.isFile())
		.catch(() => false);

export const isDir = (name: string) =>
	stat(name)
		.then(stats => stats.isDirectory())
		.catch(() => false);

const cacheFormatExt = new Map<IModuleFormat, ReturnType<typeof getExtensionsByFormat>>();

export function _getExtensionsByFormat(currentFormat: IModuleFormat)
{
	let list: ReturnType<typeof getExtensionsByFormat>
	if (cacheFormatExt.has(currentFormat))
	{
		list = cacheFormatExt.get(currentFormat)
	}
	else
	{
		list = getExtensionsByFormat(currentFormat);
	}

	return list.slice();
}

export async function jsOrTs(filename: string, currentFormat: IModuleFormat)
{
	let ret: string;
	for (const ext of _getExtensionsByFormat(currentFormat))
	{
		const name = `${filename}${ext}`;
		ret = resolveApp(name);
		if (await isFile(ret))
		{
			break;
		}
	}

	return ret;
}
