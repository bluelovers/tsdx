import { remove } from 'fs-extra';
import { paths } from '../constants';

export async function cleanDistFolder()
{
	await remove(paths.appDist);
}
