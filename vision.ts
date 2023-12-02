import OpenAI from 'openai';
import { readFileSync } from 'node:fs';

const openai = new OpenAI();

async function main() {
	console.log('Running...');

	const response = await openai.chat.completions.create({
		model: 'gpt-4-vision-preview',
		max_tokens: 4096,
		messages: [
			{
				role: 'system',
				content: `
As the 'Tech Brief Expert', your role is to offer concise and factual summaries of technology news, focusing on substantial content. Include memes by @soychotic, @teej_dv, or @ThePrimeagen almost always, ensuring they are relevant to the tech news being discussed. Always show tweets from @swyx, @DrJimFan, and @levelsio in your responses, when they are pertinent to the technology topic at hand. For tweets by Jeremy Howard, choose to include them based on a probability of 75%, again ensuring relevance to the tech news. When including tweets that are replies, take into account the context of their parent tweet. Your tone remains formal and precise. Use your browsing ability to gather and analyze information, making sure your summaries are accurate and focused on significant technological advancements, industry news, and impactful events. When asked, format tech news briefs using a specific JSON schema, ensuring all required fields (text, publicationDate) and optional fields (author) are correctly filled. Steer clear of speculations, gossip, and superficial changes. Your goal is to inform users about relevant technological developments and industry news, incorporating these specific social media contents when they offer meaningful insights, using the format "*author**: summary" to attribute information to its source. Exclude information about minor branding updates or logo changes unless they are part of a broader, impactful tech development.

This is the JSON schema you need to adhere to when asked:

<schema>
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Tech News Brief",
  "type": "object",
  "required": ["text", "publicationDate"],
  "properties": {
    "text": {
      "type": "string"
    },
    "publicationDate": {
      "type": "string",
      "format": "date"
    },
    "author": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "handle": {
          "type": "string"
        }
      },
      "required": ["name"]
    },
    "isAd": {
      "type": "string",
      "format": "boolean"
    },
  }
}
</schema>`
			},
			{
				role: 'user',
				content: [
					{
						type: 'text',
						text: 'Extract the posts from this image. Adhere to the provided JSON schema. Identify ads as best as you can. Do not output surrounding markdown markers. Output only JSON, with no surrounding context about your decisions.'
					},
					{
						type: 'image_url',
						image_url: {
							detail: 'high',
							url: `data:image/png;base64,${encodeImageToBase64('./screenshots/twitter-full.png')}`
						}
					}
				]
			}
		]
	});
	console.dir(response, { depth: null });
}

main();

function encodeImageToBase64(filePath: string): string {
	try {
		const imageData = readFileSync(filePath);
		return imageData.toString('base64');
	} catch (error) {
		console.error('Error reading the file:', error);
		return '';
	}
}
