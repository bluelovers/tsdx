import { shellTestFile } from './shell';

export function expectShellTestFile(target: string, exists = true)
{
	const e = expect(shellTestFile(target));

	return exists ? e.toBeTruthy() : e.toBeFalsy()
}
