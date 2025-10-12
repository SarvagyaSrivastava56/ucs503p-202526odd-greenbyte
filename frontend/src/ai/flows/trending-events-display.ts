'use server';

/**
 * @fileOverview Fetches and ranks trending events for display.
 *
 * - getTrendingEvents - A function that returns a list of trending events.
 * - TrendingEventsOutput - The return type for the getTrendingEvents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TrendingEventsOutputSchema = z.array(
  z.object({
    eventId: z.string().describe('The ID of the event.'),
    eventName: z.string().describe('The name of the event.'),
    rsvpCount: z.number().describe('The number of RSVPs for the event.'),
  })
);
export type TrendingEventsOutput = z.infer<typeof TrendingEventsOutputSchema>;

export async function getTrendingEvents(): Promise<TrendingEventsOutput> {
  // Return empty array if AI is not configured
  if (!ai) {
    return [];
  }
  return trendingEventsFlow?.() || [];
}

const trendingEventsPrompt = ai?.definePrompt({
  name: 'trendingEventsPrompt',
  output: {schema: TrendingEventsOutputSchema},
  prompt: `You are an AI assistant that recommends a list of trending events.

  Return a JSON array of trending events, ranked by popularity (number of RSVPs).
  Each object in the array should contain the eventId, eventName, and rsvpCount.
  Do not include any other information other than the eventId, eventName, and rsvpCount.
  Limit the number of trending events to 5.`
});

const trendingEventsFlow = ai ? ai.defineFlow({
  name: 'trendingEventsFlow',
  outputSchema: TrendingEventsOutputSchema,
},
async () => {
  const {output} = await trendingEventsPrompt!();
  return output!;
}) : null;
