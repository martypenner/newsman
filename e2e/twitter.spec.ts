import { test, type Page } from '@playwright/test';

const authFile = '.auth/twitter.json';

test.beforeEach(async ({ page }) => {
	await page.goto('https://twitter.com');
});

test.describe('Twitter', () => {
	test('should log in', async ({ page }) => {
		const NUM_TIMES_TO_SCROLL = 5;

		await page.goto('https://twitter.com/');

		const isLoggedIn = (await page.$$('[data-testid="loginButton"]')).length === 0;
		if (!isLoggedIn) {
			console.log('Not logged in.');
			await login(page);
		}

		await page.waitForSelector('[data-testid="tweet"]');

		let tweetContents = [];

		// Scroll through the timeline
		let previousHeight = 0;
		for (let i = 0; i < NUM_TIMES_TO_SCROLL; i++) {
			const currentHeight = await page.evaluate(() => {
				window.scrollTo(0, document.body.scrollHeight);
				return document.body.scrollHeight;
			});

			if (currentHeight === previousHeight) {
				break; // Stop scrolling if the scroll height didn't change
			}

			previousHeight = currentHeight;
			await page.waitForTimeout(2_000); // Wait a bit for new tweets to load

			const tweets = page.getByTestId('tweet');
			// TODO: rank and prioritize these somehow
			const usernames = (
				await tweets.getByTestId('User-Name').locator('span').getByText(/^@/gi).all()
			)
				.filter((el) => el.isVisible())
				.map((el) => el.textContent());
			tweetContents = tweetContents.concat(
				(await Promise.all((await tweets.all()).map((tweet) => tweet.textContent()))).filter(
					(tweet) => tweet != null
				)
			);
		}
		tweetContents = new Set(tweetContents);

		await page.screenshot({ fullPage: true });

		// await page.pause();

		console.log(tweetContents.size);
		console.log(Array.from(tweetContents));

		// TODO: show more on tweets
		// TODO: filter out ads
		// TODO: filter out unneeded parts of tweets, like metadata
		// TODO: go to specific users' timelines and grab their latest stuff. Will require a db.

		await page.context().storageState({ path: authFile });
	});
});

async function login(page: Page) {
	await page.getByTestId('loginButton').click();
	await page.pause();
	await page.getByRole('button', { name: 'Next' }).click();
	await page.pause();
	await page.getByTestId('LoginForm_Login_Button').click();
}
