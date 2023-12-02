import dotenv from 'dotenv';
import { getScreenshots } from './get-screenshots';
import { extractTweets } from './extract-tweets';
import { sendEmail } from './send-email';

dotenv.config();

// TODO: use inngest
getScreenshots();
extractTweets();
sendEmail('abc');
