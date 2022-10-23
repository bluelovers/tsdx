import { resolveApp } from '../utils';
import { isDir, isFile, jsOrTs } from './isFile';
import glob from 'tiny-glob/sync';
import { ModuleFormat, NormalizedOpts } from '../types';
import { reduce, map } from 'bluebird';
import isGlob from 'is-glob';

export async function getInputs(
	entries: string | string[],
	source: string,
	formatList: ModuleFormat[],
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
	currentFormat: ModuleFormat,
): Promise<string[]>
{
	if (entries?.length)
	{
		return resolveEntries(entries, currentFormat)
	}

	return [(source && resolveApp(source)) ||
		((await isDir(resolveApp('src'))) && (await jsOrTs('src/index', currentFormat)))];
}

async function resolveEntries(entries: string | string[], currentFormat: ModuleFormat)
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
