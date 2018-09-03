export = function(file: any, api: any) {
	let quote: string | undefined;
	const j = api.jscodeshift;
	return j(file.source)
		.find(j.ImportDeclaration)
		.replaceWith((p: any) => {
			return p.node;
		})
		.toSource({ quote: quote || 'single' });
};
