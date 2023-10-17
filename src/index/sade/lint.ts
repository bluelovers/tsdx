import { prog } from './_';
import { existsSync, outputFile } from 'fs-extra';
import chalk from 'chalk';
import { createEslintConfig } from '../../createEslintConfig';
import { appPackageJson } from '../appPackageJson';
import { paths } from '../../constants';
import { ESLint } from 'eslint';

prog
	.command('lint')
	.describe('Run eslint with Prettier')
	.example('lint src test')
	.option('--fix', 'Fixes fixable errors and warnings')
	.example('lint src test --fix')
	.option('--ignore-pattern', 'Ignore a pattern')
	.example('lint src test --ignore-pattern test/foobar.ts')
	.option(
		'--max-warnings',
		'Exits with non-zero error code if number of warnings exceed this number',
		Infinity
	)
	.example('lint src test --max-warnings 10')
	.option('--write-file', 'Write the config file locally')
	.example('lint --write-file')
	.option('--report-file', 'Write JSON report to file locally')
	.example('lint --report-file eslint-report.json')
	.action(
		async (opts: {
			fix: boolean;
			'ignore-pattern': string;
			'write-file': boolean;
			'report-file': string;
			'max-warnings': number;
			_: string[];
		}) =>
		{
			if (opts['_'].length === 0 && !opts['write-file'])
			{
				const defaultInputs = ['src', 'test'].filter(existsSync);
				opts['_'] = defaultInputs;
				console.log(
					chalk.yellow(
						`Defaulting to "tsdx lint ${defaultInputs.join(' ')}"`,
						'\nYou can override this in the package.json scripts, like "lint": "tsdx lint src otherDir"'
					)
				);
			}

			const config = await createEslintConfig({
				pkg: appPackageJson,
				rootDir: paths.appRoot,
				writeFile: opts['write-file'],
			});

			const cli = new ESLint({
				baseConfig: {
					...config,
					...appPackageJson?.eslint,
				},
				extensions: ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs'],
				fix: opts.fix,
				overrideConfig: {
					ignorePatterns: opts['ignore-pattern'],
				},
			});

			const report = await cli.lintFiles(opts['_']);
			if (opts.fix)
			{
				await ESLint.outputFixes(report);
			}
			const formater = await cli.loadFormatter();
			console.log(formater.format(report));
			if (opts['report-file'])
			{
				const formaterJson = await cli.loadFormatter('json');
				await outputFile(
					opts['report-file'],
					formaterJson.format(report)
				);
			}

			console.dir(report)
			console.dir(ESLint.getErrorResults(report))

			if (ESLint.getErrorResults(report).length)
			{
				process.exit(1);
			}

			let warningCount = 0;
			for (const entry of report)
			{
				warningCount += entry.warningCount;
				if (warningCount > opts['max-warnings'])
				{
					console.log([warningCount, opts['max-warnings']])
					process.exit(1);
				}
			}
		}
	);
