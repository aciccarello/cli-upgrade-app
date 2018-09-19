const dependencies = require('../v4/core/dependencies.json');
const fs = require('fs-extra');
const match = /^@dojo\/framework\/(core\/.*)/;
const excludes = ['core/Destroyable', 'core/Evented', 'core/QueuingEvented', 'core/util'];

export = function(file: any, api: any) {
	let quote: string | undefined;
	const j = api.jscodeshift;
	return j(file.source)
		.find(j.ImportDeclaration)
		.replaceWith((p: any) => {
			const { source } = p.node;
			const matches = match.exec(source.value);
			if (matches && excludes.indexOf(matches[1]) === -1) {
				const file = `${matches[1]}.ts`;
				const filesToCopy = [file, ...dependencies[file]];
				filesToCopy.forEach((file) => {
					fs.copySync(`${__dirname}/../v4/${file}`, `${process.cwd()}/src/${file}`);
				});
				if (!quote) {
					quote = source.extra.raw.substr(0, 1) === '"' ? 'double' : 'single';
				}
				source.value = `./${matches[1]}`;
				return { ...p.node, source: { ...source } };
			}
			return p.node;
		})
		.toSource({ quote: quote || 'single' });
};
