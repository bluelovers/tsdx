import { NormalizedOpts } from '../types';
import Table from 'cli-table3';
import { pkg } from './_';
import { inspect } from 'util';
import { findTsconfig } from '@yarn-tool/find-tsconfig';
import { paths } from '../constants';
import { pathInsideDirectory } from 'path-in-dir';
import chalk from 'chalk';
import { relative } from 'path';

export function printOptsTable<T extends NormalizedOpts>(opts: T)
{
	const table = new Table({
		colAligns: ['right', 'left'],
		chars: {
			//top: '',
			'top-mid': '',
			'top-left': '',
			'top-right': '',
			//bottom: '',
			'bottom-mid': '',
			'bottom-left': '',
			'bottom-right': '',
			left: '',
			'left-mid': '',
			mid: '',
			'mid-mid': '',
			right: '',
			'right-mid': '',
			middle: '',
		},
	});

	table.push([pkg.name, pkg.version]);
	table.push(['process.versions.node', process.versions.node]);
	table.push(['']);

	const tsconfigPath = opts.tsconfig || findTsconfig(paths.appRoot) || paths.tsconfigJson;

	table.push([
		`cwd`, process.cwd(),
	]);
	table.push([
		`appRoot`, paths.appRoot,
	]);
	table.push([
		`tsconfig`,
		!pathInsideDirectory(tsconfigPath, paths.appRoot) ? chalk.red(tsconfigPath) : relative(paths.appRoot, tsconfigPath),
	]);

	for (let key in opts)
	{
		const value = opts[key];
		if (key === '_' || typeof value === 'undefined') continue;

		table.push([key, typeof value === 'string' ? value : inspect(value, {
			colors: true,
		})]);
	}

	console.log(table.toString());
	console.log('');
}
