import { resolveApp } from '../utils';
import { isDir, jsOrTs } from './isFile';
import glob from 'tiny-glob/sync';

export async function getInputs(
	entries?: string | string[],
	source?: string,
): Promise<string[]>
{
	return ([] as any[])
			.concat(
				entries && entries.length
					? entries
					: (source && resolveApp(source)) ||
					((await isDir(resolveApp('src'))) && (await jsOrTs('src/index'))),
			)
			.map(file => glob(file)).flat()
}
