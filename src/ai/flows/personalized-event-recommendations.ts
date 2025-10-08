'use server';

/**
 * @fileOverview A personalized event recommendation AI agent.
 *
 * - getPersonalizedEventRecommendations - A function that returns personalized event recommendations.
 * - PersonalizedEventRecommendationsInput - The input type for the getPersonalizedEventRecommendations function.
 * - PersonalizedEventRecommendationsOutput - The return type for the getPersonalizedEventRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedEventRecommendationsInputSchema = z.object({
  userRsvpEvents: z
    .array(z.string())
    .describe('List of event IDs the user has RSVPed to.'),
  userFavoriteEvents: z
    .array(z.string())
    .describe('List of event IDs the user has favorited.'),
});
export type PersonalizedEventRecommendationsInput =
  z.infer<typeof PersonalizedEventRecommendationsInputSchema>;

const PersonalizedEventRecommendationsOutputSchema = z.object({
  recommendedEvents: z
    .array(z.string())
    .describe('List of event IDs recommended for the user.'),
});
export type PersonalizedEventRecommendationsOutput =
  z.infer<typeof PersonalizedEventRecommendationsOutputSchema>;

export async function getPersonalizedEventRecommendations(
  input: PersonalizedEventRecommendationsInput
): Promise<PersonalizedEventRecommendationsOutput> {
  return personalizedEventRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedEventRecommendationsPrompt',
  input: {schema: PersonalizedEventRecommendationsInputSchema},
  output: {schema: PersonalizedEventRecommendationsOutputSchema},
  prompt: `You are an event recommendation system. Based on the user's past RSVPs and favorited events, recommend other events that they might be interested in.

User RSVPed events: {{userRsvpEvents}}
User favorited events: {{userFavoriteEvents}}

Recommend events similar to these events the user has engaged with.`,
});

const personalizedEventRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedEventRecommendationsFlow',
    inputSchema: PersonalizedEventRecommendationsInputSchema,
    outputSchema: PersonalizedEventRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
