// For launching a local instance that a remote runner can connect to.
// Useful for having prod launch using my local browser so I can
// log in to things.

import { chromium } from 'playwright';

(async () => {
	const browserServer = await chromium.launchServer();
	const wsEndpoint = browserServer.wsEndpoint();
	console.log(wsEndpoint);
})();
