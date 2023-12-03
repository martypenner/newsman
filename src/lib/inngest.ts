import { EventSchemas, Inngest } from 'inngest';
import { extractTweets } from './extract-tweets';
import { getScreenshots } from './get-screenshots';
import { sendEmailSummary } from './send-email-summary';

type Events = {
	// no-op
};

export const inngest = new Inngest({
	id: 'newsman',
	schemas: new EventSchemas().fromRecord<Events>()
});

export const functions = [
	inngest.createFunction(
		{ id: 'get-news' },
		{ cron: 'TZ=America/Toronto 0 16 * * *' },
		async ({ step }) => {
			const screenshot = await step.run('get-screenshots', async () => await getScreenshots());
			console.log(screenshot);
			// const content = await step.run('extract-tweets', async () => await extractTweets(screenshot));
			//
			// if (content != null && !content.startsWith(`I'm sorry`)) {
			// 	await step.run('send-email-summary', async () => await sendEmailSummary(content));
			// }

			console.log('Done!');
		}
	)
];
