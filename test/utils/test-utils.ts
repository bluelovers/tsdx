import { shellTestFile } from './shell';

export function expectShellTestFile(target: string, exists = true)
{
	// @ts-ignore
	const e = expect(shellTestFile(target), target);

	return exists ? e.toBeTruthy() : e.toBeFalsy()
}
