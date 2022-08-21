import { NormalizedOpts } from '../types';
import { pathExists } from 'fs-extra';
import { each } from 'bluebird';
import { EnumFormat } from '../const';
import { ITSTypeAndStringLiteral } from 'ts-type/lib/helper/string';

export async function _checkEntryExists(inputList: string[], format: ITSTypeAndStringLiteral<EnumFormat>)
{
	let bool: boolean = inputList.length > 0;

	if (bool)
	{
		for (const input of inputList)
		{
			bool = await pathExists(input);

			if (!bool)
			{
				throw new Error(`[format:${format}] entry file not exists: ${input}`);
			}
		}
	}
	else
	{
		throw new Error(`[format:${format}] entry list not set`);
	}
}

export function assertCheckEntryExists(opts: NormalizedOpts)
{
	return each(opts.format, (format) => {
		return _checkEntryExists(opts.input[format], format)
	})
}
