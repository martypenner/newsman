import { type Page, chromium } from 'playwright';
import Jimp from 'jimp';

const authFile = '.auth/twitter.json';
const tweetLoadingIndicator = '[role=progressbar] svg';

export async function getScreenshots() {
	const shouldConnect = process.env.WS_ENDPOINT != null;
	const browser = shouldConnect
		? await chromium.connect(process.env.WS_ENDPOINT)
		: await chromium.launch({ headless: process.env.NODE_ENV !== 'development' });
	const page = await browser.newPage({ storageState: authFile });

	const NUM_TIMES_TO_SCROLL = 5;
	const screenshots: Buffer[] = [];

	await page.goto('https://twitter.com/');

	const isLoggedIn = (await page.$$('[data-testid="loginButton"]')).length === 0;
	if (!isLoggedIn) {
		console.log('Not logged in.');
		await login(page);
	}

	await page.waitForSelector('[data-testid="tweet"]');

	await page
		.getByLabel(/Timeline: Your Home Timeline/gi)
		.locator(tweetLoadingIndicator)
		.filter({ has: page.getByTestId('tweetPhoto') })
		.waitFor({ state: 'hidden' }); // Wait a bit for new tweets to load
	// TODO: use [aria-labelledby="accessible-list-1"] for just tweets, no header, footer, sidebar, etc.
	// Doing it now causes a bunch of black bars to show up in the screenshot. Virtualization maybe?
	// Note that a pdf doesn't fare any better.
	screenshots.push(await page.screenshot());

	// Scroll through the timeline
	let previousHeight = 0;
	for (let i = 0; i < NUM_TIMES_TO_SCROLL; i++) {
		const currentHeight = await page.evaluate(() => {
			window.scrollTo(0, document.body.scrollHeight);
			return document.body.scrollHeight;
		});

		// TODO: don't scroll page height; scroll visible amount.

		previousHeight = currentHeight;
		await page
			.getByLabel(/Timeline: Your Home Timeline/gi)
			.locator(tweetLoadingIndicator)
			.filter({ has: page.getByTestId('tweetPhoto') })
			.waitFor({ state: 'hidden' }); // Wait a bit for new tweets to load

		screenshots.push(await page.screenshot());
	}

	// await page.pause();

	// TODO: show more on tweets using [data-testid="tweet"] span "show more"
	// TODO: filter out ads
	// TODO: filter out unneeded parts of tweets, like metadata
	// TODO: go to specific users' timelines and grab their latest stuff. Will require a db.

	await page.context().storageState({ path: authFile });
	await browser.close();

	const fullScreenshot = await stitchImages(screenshots);

	return fullScreenshot;
}

async function login(page: Page) {
	await page.getByTestId('loginButton').click();
	await page.pause();
}

async function stitchImages(imagesData: Buffer[]) {
	const images = await Promise.all(imagesData.map((path) => Jimp.read(path)));
	const totalHeight = images.reduce((sum, img) => sum + img.bitmap.height, 0);
	const maxWidth = Math.max(...images.map((img) => img.bitmap.width));

	const stitchedImg = new Jimp(maxWidth, totalHeight);

	let yOffset = 0;
	for (const image of images) {
		stitchedImg.blit(image, 0, yOffset);
		yOffset += image.bitmap.height;
	}

	// For debugging
	await stitchedImg.writeAsync('screenshots/debug.png');

	return await stitchedImg.getBufferAsync('image/png');
}
