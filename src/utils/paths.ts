import { realpathSync } from 'fs-extra';
import { relative, resolve } from 'upath2';

export function _makeAppDirectoryFn(cwd?: string)
{
	cwd ??= process.cwd()

	/**
	 * Make sure any symlinks in the project folder are resolved:
	 * https://github.com/facebookincubator/create-react-app/issues/637
	 */
	const appDirectory = realpathSync(cwd);

	return {
		appDirectory,
		resolveApp<S extends string>(relativePath: S)
		{
			return resolve(appDirectory, relativePath) as S;
		},
		relativeApp<S extends string>(relativePath: S)
		{
			return relative(appDirectory, relativePath) as S;
		}
	} as const
}

export function _makeAppPathsCore(cwd?: string)
{
	const {
		resolveApp,
		relativeApp,
	} = _makeAppDirectoryFn(cwd);

	return {
		resolveApp,
		relativeApp,
		paths: {
			appPackageJson: resolveApp('package.json'),
			tsconfigJson: resolveApp('tsconfig.json'),
			testsSetup: resolveApp('test/setupTests.ts'),
			appRoot: resolveApp('.'),
			appSrc: resolveApp('src'),
			appErrorsJson: resolveApp('errors/codes.json'),
			appErrors: resolveApp('errors'),
			appDist: resolveApp('dist'),
			appConfig: resolveApp('tsdx.config.js'),
			jestConfig: resolveApp('jest.config.js'),
			progressEstimatorCache: resolveApp('node_modules/.cache/.progress-estimator'),
		} as const,
	} as const
}

export type IAppPaths = ReturnType<typeof _makeAppPathsCore>["paths"];
