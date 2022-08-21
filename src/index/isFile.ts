import { stat } from 'fs-extra';
import { resolveApp } from '../utils';
import { ModuleFormat } from '../types';
import { EnumFormat } from '../const';

export const isFile = (name: string) =>
	stat(name)
		.then(stats => stats.isFile())
		.catch(() => false);

export const isDir = (name: string) =>
	stat(name)
		.then(stats => stats.isDirectory())
		.catch(() => false);

export async function jsOrTs(filename: string, currentFormat: ModuleFormat)
{

	let ret: string;
	for (const ext of [
		...(currentFormat === EnumFormat.cjs ? [
			'.cts',
		] : currentFormat === EnumFormat.esm ? [
			'.mts',
		] : []),
		'.ts',
		'.tsx',
		...(currentFormat === EnumFormat.cjs ? [] : currentFormat === EnumFormat.esm ? [] : [
			'.mts',
			'.cts',
		]),
		'.jsx',
		...(currentFormat === EnumFormat.cjs ? [
			'.cjs',
		] : currentFormat === EnumFormat.esm ? [
			'.mjs',
		] : []),
		'.js',
		...(currentFormat === EnumFormat.cjs ? [] : currentFormat === EnumFormat.esm ? [] : [
			'.mjs',
			'.cjs',
		]),
		'.js',
	] as const)
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
