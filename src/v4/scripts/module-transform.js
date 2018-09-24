const match = /\/(shim|has)\/(.*)/;

function matchImportsExports(node) {
	const { source, type } = node;
	if (type === 'ImportDeclaration' || type === 'ExportAllDeclaration' || type === 'ExportNamedDeclaration' && source && source.value) {
		return true;
	}
	return false;
}

module.exports = function (file, api) {
    const j = api.jscodeshift;
    return j(file.source)
		.find(j.Declaration, matchImportsExports)
		.replaceWith((p) => {
			const { source, type } = p.node;
			const matches = match.exec(source.value);
			if (matches) {
				const [ /* match */, pkg, rest ] = matches;
				source.value = `@dojo/framework/${pkg}/${rest}`;
				return { ...p.node, source: { ...source } };
			}
			return p.node;
		})
		.toSource({ quote: 'single' });
};
