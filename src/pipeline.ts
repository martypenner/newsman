import { extractTweets } from './extract-tweets';
import { getScreenshots } from './get-screenshots';
import { sendEmailSummary } from './send-email-summary';

async function getNews() {
	const screenshot = await getScreenshots();
	console.info(screenshot);

	console.info('Extracting tweets...');
	const content = await extractTweets(Buffer.from(screenshot));
	console.info(content);

	if (content != null && !content.startsWith(`I'm sorry`)) {
		console.info('Sending email summary...');
		await sendEmailSummary(content);
	}

	console.info('Done!');
}

await getNews();
