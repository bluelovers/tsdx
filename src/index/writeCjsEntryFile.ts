import { safePackageName } from '../utils';
import { outputFile } from 'fs-extra';
import { join } from 'path';
import { paths } from '../constants';

export function writeCjsEntryFile(name: string)
{
	const baseLine = `module.exports = require('./${safePackageName(name)}`;
	const contents = `
'use strict'

if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
  ${baseLine}.cjs.production.min.cjs')
} else {
  ${baseLine}.cjs.development.cjs')
}
`;
	return outputFile(join(paths.appDist, 'index.cjs'), contents);
}
