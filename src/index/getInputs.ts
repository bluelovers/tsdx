import { resolveApp } from '../utils';
import { isDir, jsOrTs } from './isFile';
import glob from 'tiny-glob/sync';
import { ModuleFormat, NormalizedOpts } from '../types';
import { reduce } from 'bluebird';

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
	return ([] as any[])
			.concat(
				entries && entries.length
					? entries
					: (source && resolveApp(source)) ||
					((await isDir(resolveApp('src'))) && (await jsOrTs('src/index', currentFormat))),
			)
			.map(file => glob(file)).flat()
}
