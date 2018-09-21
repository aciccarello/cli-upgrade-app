import { Command, Helper, OptionsHelper } from '@dojo/cli/interfaces';
import chalk from 'chalk';
import * as inquirer from 'inquirer';
const Runner = require('jscodeshift/src/Runner');
const path = require('path');
const glob = require('glob');

const packages = [
	'@dojo/core',
	'@dojo/has',
	'@dojo/i18n',
	'@dojo/widget-core',
	'@dojo/routing',
	'@dojo/stores',
	'@dojo/shim',
	'@dojo/test-extras'
];

async function run(transform: string, opts: any) {
	try {
		await command.__runner.run(transform, opts.path, opts);
	} catch (e) {
		throw Error('Failed to upgrade');
	}
	const packageString = packages.join(' ');
	console.log('');
	console.log(
		chalk.bold.green(
			'Upgrade complete, you can now add the new dojo/framework dependency and safely remove deprecated dependencies with the following:'
		)
	);
	console.log('install the dojo framework package:');
	console.log(`    ${chalk.yellow('npm install @dojo/framework')}`);
	console.log('remove legacy packages:');
	console.log(`    ${chalk.yellow('npm uninstall -S -D ' + packageString)}`);
}

const command: Command & { __runner: any } = {
	__runner: Runner,
	group: 'upgrade',
	name: 'app',
	description: 'upgrade your application to a newer Dojo version',
	register(options: OptionsHelper) {
		options('pattern', {
			describe: 'glob pattern of source files to transform',
			alias: 'p',
			type: 'string',
			default: '{src,tests}/**/*.{ts,tsx}'
		});
		options('dry', {
			describe: 'perform a dry run, no changes are made to files',
			alias: 'd',
			type: 'boolean',
			default: false
		});
	},
	run: async (helper: Helper, args: { pattern: string; dry: boolean }) => {
		const { pattern, dry } = args;
		const paths = glob.sync(pattern);
		const hasJSX = paths.some((p: string) => p.match(/\.tsx$/g));
		const transformV3 = path.resolve(__dirname, 'v3', 'transforms', 'module-transform-to-framework.js');
		const transformV4 = path.resolve(__dirname, 'v4', 'transforms', 'module-transform-legacy-core.js');
		const opts = {
			parser: hasJSX ? 'typescript-jsx' : 'typescript',
			path: paths,
			verbose: 0,
			babel: false,
			dry,
			extensions: 'js',
			runInBand: false,
			silent: false
		};
		if (!dry) {
			const answer = await inquirer.prompt({
				type: 'confirm',
				name: 'run',
				message:
					'This command will irreversibly modify files. Are you sure you want to run the upgrade? Use the --dry option first if in doubt',
				default: false
			});
			if (!(answer as any).run) {
				throw Error('Aborting upgrade');
			}
			await run(transformV3, opts);
			return await run(transformV4, opts);
		}
		console.log('Performing V3 transform');
		await run(transformV3, opts);
		console.log('Performing V4 transform');
		return await run(transformV4, opts);
	}
};

export default command;
