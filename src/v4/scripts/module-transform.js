const match = /\/(shim|has)\/(.*)/;
module.exports = function (file, api) {
    const j = api.jscodeshift;
    return j(file.source)
		.find(j.Declaration)
		.replaceWith((p) => {
			const { source, type } = p.node;
			if (type === 'ImportDeclaration' || type === 'ExportAllDeclaration' || type === 'ExportNamedDeclaration' && source && source.value) {
				const matches = match.exec(source.value);
				if (matches) {
					const [ /* match */, pkg, rest ] = matches;
					source.value = `@dojo/framework/${pkg}/${rest}`;
					return { ...p.node, source: { ...source } };
				}
			}
			return p.node;
		})
		.toSource({ quote: 'single' });
};
