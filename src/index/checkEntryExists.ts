import { NormalizedOpts } from '../types';
import { pathExists } from 'fs-extra';

export async function checkEntryExists(opts: NormalizedOpts)
{
	let bool: boolean = opts.input.length > 0;

	if (bool)
	{
		for (const input of opts.input.flat())
		{
			bool = await pathExists(input);

			if (!bool)
			{
				throw new Error(`entry file not exists: ${input}`);
			}
		}
	}
	else
	{
		throw new Error(`entry file not set`);
	}
}
