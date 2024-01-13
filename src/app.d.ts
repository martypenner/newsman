// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

declare module '$env/static/private' {
	export const OPENAI_API_KEY: string;
	export const RESEND_API_KEY: string;
	export const EMAIL_FROM: string;
	export const EMAIL_TO: string;
	export const WS_ENDPOINT: string;
	export const BROWSER_PORT: number;
}

export {};
