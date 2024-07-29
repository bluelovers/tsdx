import { join } from 'path';
import { homedir } from 'os';

// @ts-ignore
async function niceTry<T>(fn: () => T)
{
	try
	{
		return await fn() as T
	}
	catch (e)
	{
		//console.log(e)
	}
}

// @ts-ignore
function niceTryImport<T>(path: string)
{
	// @ts-ignore
	return niceTry(() => import(path) as T)
}

export async function tryImportTypescript(): Promise<typeof import('typescript')>
{
	const home = homedir();
	const name = 'typescript';
	const isWindows = process.platform === 'win32'

	let roaming_npm = isWindows ? 'AppData/Roaming/npm' : '.npm-global/lib'
	let local = isWindows ? 'AppData/Local' : '.local/share'

	for (let v of [
		[home, roaming_npm, 'node_modules', name],
		[home, local, 'pnpm/global/5/node_modules', name],
		[home, local, 'Yarn/Data/global', name],
	])
	{
		// @ts-ignore
		let m = await niceTryImport(join(...[v].flat()))
		if (m)
		{
			// @ts-ignore
			return m
		}
	}

	return import(name)
}
