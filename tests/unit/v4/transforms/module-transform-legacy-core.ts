const { describe, it } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');

import * as os from 'os';

let jscodeshift = require('jscodeshift');
import moduleTransform = require('../../../../src/v4/transforms/module-transform-legacy-core');

jscodeshift = jscodeshift.withParser('typescript');

const input = {
	source: `
import request from '@dojo/framework/core/request';
import { EventObject } from '@dojo/framework/core/Evented';

export { Observable } from '@dojo/framework/core/Observable';
`
};

describe('module-transform-legacy-core', () => {
	it('should transform legacy package imports to local copies', () => {
		const output = moduleTransform(input, { jscodeshift, stats: () => {} }, { dry: false });
		assert.equal(
			output,
			`
import request from './core/request';
import { EventObject } from '@dojo/framework/core/Evented';

export { Observable } from './core/Observable';
`
				.split(/\r?\n/g)
				.join(os.EOL)
		);
	});
});
