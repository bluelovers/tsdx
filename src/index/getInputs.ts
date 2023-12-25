import { isDir, isFile, jsOrTs } from './isFile';
import glob from 'tiny-glob/sync';
import { NormalizedOpts } from '../types';
import { IModuleFormat } from '@ts-type/tsdx-extensions-by-format';
import { map, reduce } from 'bluebird';
import isGlob from 'is-glob';
import { resolveApp } from '../constants';

export async function getInputs(
	entries: string | string[],
	source: string,
	formatList: IModuleFormat[],
)
{
	return reduce(formatList, async (a, format) => {
		a[format] = await getInputsWithFormat(entries, source, format)
		return a
	}, {} as NormalizedOpts["input"])
}

export async function getInputsWithFormat(
	entries: string | string[],
	source: string,
	currentFormat: IModuleFormat,
): Promise<string[]>
{
	if (entries?.length)
	{
		return resolveEntries(entries, currentFormat)
	}

	return [(source && resolveApp(source)) ||
		((await isDir(resolveApp('src'))) && (await jsOrTs('src/index', currentFormat)))];
}

async function resolveEntries(entries: string | string[], currentFormat: IModuleFormat)
{
	return map([entries].flat(), file => {
		if (isGlob(file))
		{
			return glob(file)
		}
		return file
	})
		.then(entries => entries.flat())
		.map(async(entry: string) =>
	{
		if (!await isFile(entry))
		{
			return jsOrTs(entry, currentFormat);
		}
		return entry
	})
}
