const dependencyTree = require('dependency-tree');
const glob = require('glob');
const Runner = require('jscodeshift/src/Runner');
const path = require('path');
const fs = require('fs');

const dir = 'src/v4/core';
const paths = glob.sync(`${dir}/**/*.ts`);
/*const paths = [ `${dir}/lang.ts` ];*/
const v4Path = path.resolve(__dirname, '../');

/** @type {{ [coreImport: string]: string[]; }} */
const deps = {};

const opts = {
	parser: 'typescript',
	transform: path.resolve(__dirname, './module-transform.js'),
	path: paths,
	verbose: 1,
	babel: false,
	dry: false,
	extensions: 'js',
	runInBand: false,
	silent: false
};

async function run(opts) {
	try {
		await Runner.run(opts.transform, opts.path, opts);
	} catch (e) {
		console.log(e);
	}
}

paths.forEach((filename) => {
	const list = dependencyTree.toList({
		filename: filename,
		directory: dir
	}).map((dep) => dep.replace(`${v4Path}/`, ''));
	list.pop();
	deps[filename.replace(`src/v4/`, '')] = list;
});

deps['core/request.ts'].push('core/request/providers/node.ts', ...deps['core/request/providers/node.ts']);
fs.writeFileSync(`${v4Path}/core/dependencies.json`, JSON.stringify(deps, null, '\t'));

run(opts);
