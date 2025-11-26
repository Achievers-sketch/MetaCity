'use server';

/**
 * @fileOverview An AI agent that generates in-game news headlines based on real-world events and game state.
 *
 * - generateInGameNewsHeadline - Generates a news headline.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { InGameNewsHeadlineInputSchema, InGameNewsHeadlineOutputSchema, type InGameNewsHeadlineInput, type InGameNewsHeadlineOutput } from '@/lib/types';


const getRealWorldNewsTool = ai.defineTool(
    {
      name: 'getRealWorldNews',
      description: 'Retrieves the top 3 current real-world news headlines.',
      inputSchema: z.object({}),
      outputSchema: z.array(z.object({
          title: z.string(),
          url: z.string(),
      })),
    },
    async () => {
        // In a real application, this would fetch from a news API.
        // For this demo, we'll return a set of diverse, static headlines.
        return [
            { title: "Global Stock Markets Rally on Tech Sector Growth", url: "https://example.com/news1" },
            { title: "Breakthrough in Renewable Energy Storage Announced", url: "https://example.com/news2" },
            { title: "International Arts Festival Draws Record Crowds", url: "https://example.com/news3" },
        ];
    }
);


const prompt = ai.definePrompt({
    name: 'generateInGameNewsPrompt',
    input: { schema: InGameNewsHeadlineInputSchema },
    output: { schema: InGameNewsHeadlineOutputSchema },
    tools: [getRealWorldNewsTool],
    prompt: `You are a news editor for a newspaper in a city-builder game.
    Your task is to create a compelling, short news headline (under 12 words).
    This headline should be inspired by a current real-world news event, but adapted to fit the context of the game.
    
    Use the provided tool to get the latest real-world news.
    Select one headline and creatively reinterpret it for the game world.

    Game State Context:
    - Gold: {{gold}}
    - Citizens: {{citizens}}
    - Happiness: {{happiness}}

    Example transformations:
    - Real World: "Global Shipping Lanes Face Delays" -> Game: "Local trade routes bustling, commercial districts report record profits!"
    - Real World: "New Study on Urban Gardening" -> Game: "Citizens embrace green rooftops, boosting city-wide happiness."
    - Real World: "Tech Company Unveils New Microchip" -> Game: "Industrial sector innovates, increasing factory output."
    
    Generate one headline.
    `,
});

const generateInGameNewsHeadlineFlow = ai.defineFlow(
  {
    name: 'generateInGameNewsHeadlineFlow',
    inputSchema: InGameNewsHeadlineInputSchema,
    outputSchema: InGameNewsHeadlineOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);


export async function generateInGameNewsHeadline(input: InGameNewsHeadlineInput): Promise<InGameNewsHeadlineOutput> {
    return generateInGameNewsHeadlineFlow(input);
}
