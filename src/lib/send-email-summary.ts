import { Resend } from 'resend';
import { marked } from 'marked';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export async function sendEmailSummary(content: string) {
	console.log('Sending email...');

	try {
		const data = await resend.emails.send({
			from: process.env.VITE_EMAIL_FROM,
			to: process.env.VITE_EMAIL_TO,
			subject: 'News for the day',
			html: await marked(content)
		});

		console.log(data);
	} catch (error) {
		console.error(error);
	}
}
