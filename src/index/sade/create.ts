import { prog } from './_';
import { templates } from '../../templates/index';
import chalk from 'chalk';
import ora from 'ora';
import { copy, move, outputJSON, pathExists, readFile, realpath, writeFile } from 'fs-extra';
// @ts-ignore
import { Input, Select } from 'enquirer';
import path from 'path';
import { composePackageJson } from '../../templates/utils/index';
import { getNodeEngineRequirement, safePackageName } from '../../utils';
import semver from 'semver';
import * as Messages from '../../messages';
import { logError } from '../../logError';
import { getInstallCmd } from '../../getInstallCmd';
import { getInstallArgs } from '../../getInstallArgs';
import execa from 'execa';
import { getAuthorName, setAuthorName } from '../author';
import { pkg } from '../_';

prog
	.version(pkg.version)
	.command('create <pkg>')
	.describe('Create a new package with TSDX')
	.example('create mypackage')
	.option(
		'--template',
		`Specify a template. Allowed choices: [${Object.keys(templates).join(
			', '
		)}]`
	)
	.example('create --template react mypackage')
	.option(
		'--install',
		`Auto run install`
	)
	.action(async (pkg: string, opts: any) =>
	{
		console.log(
			chalk.blue(`
::::::::::: ::::::::  :::::::::  :::    :::
    :+:    :+:    :+: :+:    :+: :+:    :+:
    +:+    +:+        +:+    +:+  +:+  +:+
    +#+    +#++:++#++ +#+    +:+   +#++:+
    +#+           +#+ +#+    +#+  +#+  +#+
    #+#    #+#    #+# #+#    #+# #+#    #+#
    ###     ########  #########  ###    ###
`)
		);
		const bootSpinner = ora(`Creating ${chalk.bold.green(pkg)}...`);
		let template;
		// Helper fn to prompt the user for a different
		// folder name if one already exists
		async function getProjectPath(projectPath: string): Promise<string>
		{
			const exists = await pathExists(projectPath);
			if (!exists)
			{
				return projectPath;
			}

			bootSpinner.fail(`Failed to create ${chalk.bold.red(pkg)}`);
			const prompt = new Input({
				message: `A folder named ${chalk.bold.red(
					pkg
				)} already exists! ${chalk.bold('Choose a different name')}`,
				initial: pkg + '-1',
				result: (v: string) => v.trim(),
			});

			pkg = await prompt.run();
			projectPath = (await realpath(process.cwd())) + '/' + pkg;
			bootSpinner.start(`Creating ${chalk.bold.green(pkg)}...`);
			return await getProjectPath(projectPath); // recursion!
		}

		try
		{
			// get the project path
			const realPath = await realpath(process.cwd());
			let projectPath = await getProjectPath(realPath + '/' + pkg);

			const prompt = new Select({
				message: 'Choose a template',
				choices: Object.keys(templates),
			});

			if (opts.template)
			{
				template = opts.template.trim();
				if (!prompt.choices.includes(template))
				{
					bootSpinner.fail(`Invalid template ${chalk.bold.red(template)}`);
					template = await prompt.run();
				}
			}
			else
			{
				template = await prompt.run();
			}

			bootSpinner.start();
			// copy the template
			await copy(
				path.resolve(__dirname, `../templates/${template}`),
				projectPath,
				{
					overwrite: true,
				}
			);
			// fix gitignore
			await move(
				path.resolve(projectPath, './gitignore'),
				path.resolve(projectPath, './.gitignore')
			);

			// update license year and author
			let license: string = await readFile(
				path.resolve(projectPath, 'LICENSE'),
				{ encoding: 'utf-8' }
			);

			license = license.replace(/<year>/, `${new Date().getFullYear()}`);

			// attempt to automatically derive author name
			let author = getAuthorName();

			if (!author)
			{
				bootSpinner.stop();
				const licenseInput = new Input({
					name: 'author',
					message: 'Who is the package author?',
				});
				author = await licenseInput.run();
				setAuthorName(author);
				bootSpinner.start();
			}

			license = license.replace(/<author>/, author.trim());

			await writeFile(path.resolve(projectPath, 'LICENSE'), license, {
				encoding: 'utf-8',
			});

			const templateConfig = templates[template as keyof typeof templates];
			const generatePackageJson = composePackageJson(templateConfig);

			// Install deps
			process.chdir(projectPath);
			const safeName = safePackageName(pkg);
			const pkgJson = generatePackageJson({ name: safeName, author });

			const nodeVersionReq = getNodeEngineRequirement(pkgJson);
			if (
				nodeVersionReq &&
				!semver.satisfies(process.version, nodeVersionReq)
			)
			{
				bootSpinner.fail(Messages.incorrectNodeVersion(nodeVersionReq));
				process.exit(1);
			}

			await outputJSON(path.resolve(projectPath, 'package.json'), pkgJson);
			bootSpinner.succeed(`Created ${chalk.bold.green(pkg)}`);
			await Messages.start(pkg);
		}
		catch (error)
		{
			bootSpinner.fail(`Failed to create ${chalk.bold.red(pkg)}`);
			logError(error);
			process.exit(1);
		}

		const templateConfig = templates[template as keyof typeof templates];
		const { dependencies: deps } = templateConfig;

		const cmd = await getInstallCmd();
		const installArgs = getInstallArgs(cmd, deps)

		if (opts.install)
		{
			const installSpinner = ora(Messages.installing(deps.sort())).start();
			try
			{

				await execa(cmd, installArgs);
				installSpinner.succeed('Installed dependencies');
				console.log(await Messages.start(pkg));
			}
			catch (error)
			{
				installSpinner.fail('Failed to install dependencies');
				logError(error);
				process.exit(1);
			}
		}
		else
		{
			console.log(`\n${chalk.yellow([cmd].concat(installArgs as any[]).join(' '))}\n`);
		}

	});
