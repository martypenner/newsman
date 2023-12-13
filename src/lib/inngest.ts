import { EventSchemas, Inngest } from 'inngest';
import { extractTweets } from './extract-tweets';
import { getScreenshots } from './get-screenshots';
import { sendEmailSummary } from './send-email-summary';

type Events = {
	'app/browser.triggered': object;
};

export const inngest = new Inngest({
	id: 'newsman',
	schemas: new EventSchemas().fromRecord<Events>()
});

export const functions = [
	inngest.createFunction(
		{ id: 'get-news-scheduled' },
		{ cron: 'TZ=America/Toronto 0 9,21 * * *' },
		getNews
	),
	inngest.createFunction({ id: 'get-news-from-event' }, { event: 'app/browser.triggered' }, getNews)
];

async function getNews({ step, logger }) {
	const screenshot = await step.run('get-screenshots', async () => {
		const screenshot = await getScreenshots();
		return screenshot;
	});
	logger.info(screenshot);
	const content = await step.run('extract-tweets', async () => {
		logger.info('Extracting tweets...');
		return await extractTweets(Buffer.from(screenshot.data));
	});
	logger.info(content);

	if (content.data != null && !content.data.startsWith(`I'm sorry`)) {
		await step.run('send-email-summary', async () => {
			logger.info('Sending email summary...');
			await sendEmailSummary(content.data);
		});
	}

	logger.info('Done!');
}
