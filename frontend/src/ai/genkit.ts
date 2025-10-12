import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Make AI features optional - only initialize if API key is available
const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY;

export const ai = apiKey ? genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
}) : null;
