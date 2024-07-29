import { join } from 'upath2';
import { homedir } from 'os';
import { console } from 'debug-color2';

let ts: typeof import('typescript');

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

async function _tryImportTypescript(): Promise<typeof import('typescript')>
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
		const path = join(...[v].flat());
		// @ts-ignore
		let m = await niceTryImport(path)
		if (m)
		{
			await niceTryImport(join(path, 'package.json'))
				.then(v => {
					console.info(name, `:`, path)
					// @ts-ignore
					if (v?.version)
					{
						// @ts-ignore
						console.info('version', `:`, v.version)
					}
				})
			// @ts-ignore
			return m
		}
	}

	return import(name)
}

export async function tryImportTypescript()
{
	return ts ??= await _tryImportTypescript()
}
