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

export async function jsOrTs(filename: string, currentFormat: IModuleFormat)
{
	let ret: string;
	for (const ext of getExtensionsByFormat(currentFormat))
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
