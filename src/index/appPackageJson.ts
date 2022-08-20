import { PackageJson } from '../types';
import { paths } from '../constants';
import { readJSONSync } from 'fs-extra';

let appPackageJson: PackageJson;

try
{
	appPackageJson = readJSONSync(paths.appPackageJson);
}
catch (e)
{}

export { appPackageJson }
