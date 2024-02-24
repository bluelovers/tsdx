import { type Plugin } from "rollup"
import { type BundlerConfig } from 'dts-bundle-generator/config-schema';
import { paths, relativeApp, resolveApp } from '../constants';
import { handleTsconfigPath } from '../utils/ts';
import { readJSONSync } from 'fs-extra';
import { generateDtsBundle } from 'dts-bundle-generator';
import { sys as tsSys } from 'typescript';
import { logError } from '../logError';
// @ts-ignore
import { normalizeBundlerConfig, cliArgumentsEntryPointConfig, cliArgumentsCompilationOptions } from 'dts-bundle-generator/dist/config-file/normalize-config';

export interface ICliDtsBundleGeneratorConfig
{
	['no-check']?: boolean,
	'no-throw-when-check'?: boolean;

	['external-types']?: string[],
	['external-imports']?: string[],
	['external-inlines']?: string[],

	['inline-declare-externals']?: boolean,
	['inline-declare-global']?: boolean,
	['umd-module-name']?: string,
	['sort']?: boolean,
	['no-banner']?: boolean,
	['respect-preserve-const-enum']?: boolean,
	['export-referenced-types']?: boolean,

	['fail-on-class']?: boolean,

	['project']?: string,
	['disable-symlinks-following']?: boolean,
	['disable-symlinks-following']?: boolean,
	['symlinks-following']?: boolean,

	outputFile?: string,
	declarationDir?: string,
}

export interface IPluginDtsBundleGeneratorConfig extends ICliDtsBundleGeneratorConfig
{
	entries?: string | string[],
}

export function handleDtsBundleGeneratorConfig(entries: string | string[], opts: ICliDtsBundleGeneratorConfig = {})
{
	const appPackageJson = readJSONSync(paths.appPackageJson);
	let { outputFile } = opts;
	outputFile ??= appPackageJson.types ?? appPackageJson.typings ?? `${opts.declarationDir || 'dist'}/index.d.ts`;

	entries = [entries ?? 'src/index.ts'].flat();

	return normalizeBundlerConfig({
		entries: entries.map(inputFile => cliArgumentsEntryPointConfig(opts as any, {
			filePath: resolveApp(inputFile),
			outFile: resolveApp(outputFile),
		})),
		compilationOptions: cliArgumentsCompilationOptions(opts as any, {
			preferredConfigPath: handleTsconfigPath({
				tsconfig: opts['project'],
			}).tsconfigPath,
		}),
	}) as BundlerConfig
}

export function tsdxDtsBundleGenerator(entries: string | string[], opts: ICliDtsBundleGeneratorConfig = {})
{
	const bundlerConfig = handleDtsBundleGeneratorConfig(entries, opts);

	console.dir(bundlerConfig, {
		depth: null,
	});

	const result = generateDtsBundle(bundlerConfig.entries, bundlerConfig.compilationOptions)
		.map((generatedDts, i) => {
			const entry = bundlerConfig.entries[i];

			console.log(`Writing ${relativeApp(entry.filePath)} -> ${relativeApp(entry.outFile)}`);

			tsSys.writeFile(entry.outFile, generatedDts);

			return generatedDts
		})
	;

	return {
		...bundlerConfig,
		result,
	}
}

export async function tsdxDtsBundleGeneratorAsync(entries: string | string[], opts: ICliDtsBundleGeneratorConfig = {})
{
	return tsdxDtsBundleGenerator(entries, opts)
}

/**
 * @see https://gitlab.com/rondonjon/rollup-plugin-dts-bundle-generator/-/blob/master/src/index.ts?ref_type=heads
 */
export function rollupDtsBundleGenerator(pluginConfig: IPluginDtsBundleGeneratorConfig = {})
{
	return {
		name: "dts-bundle-generator",
		// @ts-ignore
		renderStart(outputConfig, inputConfig)
		{
			try
			{
				pluginConfig['no-throw-when-check'] ??= true;
				tsdxDtsBundleGenerator(pluginConfig.entries, pluginConfig);
			}
			catch (e)
			{
				logError(e);
			}

		},
	} satisfies Plugin
}
