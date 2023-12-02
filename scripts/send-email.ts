import { Resend } from 'resend';
import { marked } from 'marked';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(content: string) {
	try {
		const data = await resend.emails.send({
			from: process.env.EMAIL_FROM,
			to: process.env.EMAIL_TO,
			subject: 'News for the day',
			html: await marked(content)
		});

		console.log(data);
	} catch (error) {
		console.error(error);
	}
}
