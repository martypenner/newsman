import { handler } from './build/handler.js';
import polka from 'polka';

const PORT = 3000;
const HOST = '0.0.0.0';
const TIMEOUT = 1_000 * 60 * 15; // 15 minutes

let timeout;

const app = polka();

// let SvelteKit handle everything, including serving prerendered pages and static assets
app.use(timer, handler);

app.listen(PORT, HOST, () => {
	console.log(`> Running on port ${PORT}`);
	timeout = setTimeout(exit, TIMEOUT);
});

process.on('SIGINT', exit);
process.on('SIGTERM', exit);

function timer(req, __, next) {
	console.log('Request:', req.url);
	clearTimeout(timeout);
	timeout = setTimeout(exit, TIMEOUT);
	next();
}

function exit() {
	console.log('Exiting...');
	clearTimeout(timeout);
	app.server.closeAllConnections();
	app.server.close();
}
