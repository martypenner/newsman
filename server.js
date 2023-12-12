import { handler } from './build/handler.js';
import polka from 'polka';

const PORT = process.env.PORT ?? 3000;
const TIMEOUT = 1_000 * 60 * 15; // 15 minutes

let timeout;

const app = polka();

// let SvelteKit handle everything, including serving prerendered pages and static assets
app.use(timer, handler);

app.listen(PORT, () => {
	console.log(`> Running on port ${PORT}`);
	timeout = setTimeout(exit, TIMEOUT);
});

process.on('SIGINT', exit);
process.on('SIGTERM', exit);

function timer(_, __, next) {
	console.log('request');
	clearTimeout(timeout);
	timeout = setTimeout(exit, TIMEOUT);
	next();
}

function exit() {
	console.log('exiting...');
	clearTimeout(timeout);
	app.server.closeAllConnections();
	app.server.close();
}
