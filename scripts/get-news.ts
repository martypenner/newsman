import { extractTweets } from './extract-tweets';
import { getScreenshots } from './get-screenshots';
import { sendEmail } from './send-email';
import { exec } from 'child_process';

// TODO: use inngest

(async function run() {
	const screenshot = await getScreenshots();
	const content = await extractTweets(screenshot);
	if (content != null && !content.startsWith(`I'm sorry`)) {
		await sendEmail(content);
	}
	console.log('Done!');
})();

function executeCommand(command: string) {
	return new Promise((res, rej) => {
		exec(command, (error, stdout, stderr) => {
			if (error) {
				console.error(`Error: ${error.message}`);
				rej(error);
				return;
			}
			if (stderr) {
				console.error(`Stderr: ${stderr}`);
				rej(error);
				return;
			}

			res(stdout);
		});
	});
}
