import { stat } from 'fs-extra';
import { resolveApp } from '../utils';

export const isFile = (name: string) =>
	stat(name)
		.then(stats => stats.isFile())
		.catch(() => false);

export const isDir = (name: string) =>
	stat(name)
		.then(stats => stats.isDirectory())
		.catch(() => false);

export async function jsOrTs(filename: string)
{
	const extension = (await isFile(resolveApp(filename + '.ts')))
		? '.ts'
		: (await isFile(resolveApp(filename + '.tsx')))
			? '.tsx'
			: (await isFile(resolveApp(filename + '.mts')))
				? '.mts'
				: (await isFile(resolveApp(filename + '.cts')))
					? '.cts'
					: (await isFile(resolveApp(filename + '.jsx')))
						? '.jsx'
						: '.js';

	return resolveApp(`${filename}${extension}`);
}
