'use server';

/**
 * @fileOverview AI-powered tutorial overlay that provides step-by-step guidance and suggests actions based on game progress and resource levels.
 *
 * - provideAIGameTutorial - A function that generates tutorial steps based on the game state.
 * - AIGameTutorialInput - The input type for the provideAIGameTutorial function.
 * - AIGameTutorialOutput - The return type for the provideAIGameTutorial function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIGameTutorialInputSchema = z.object({
  gold: z.number().describe('The current amount of gold tokens the player has.'),
  citizens: z.number().describe('The current number of citizens in the city.'),
  happiness: z.number().describe('The current happiness level of the city.'),
  buildingsBuilt: z.number().describe('The number of buildings the player has built.'),
  objectivesCompleted: z.array(z.string()).describe('A list of completed objectives.'),
});
export type AIGameTutorialInput = z.infer<typeof AIGameTutorialInputSchema>;

const AIGameTutorialOutputSchema = z.object({
  step: z.string().describe('The next tutorial step for the player to follow.'),
  reasoning: z.string().describe('The AI reasoning behind the suggested step.'),
});
export type AIGameTutorialOutput = z.infer<typeof AIGameTutorialOutputSchema>;

export async function provideAIGameTutorial(input: AIGameTutorialInput): Promise<AIGameTutorialOutput> {
  return provideAIGameTutorialFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiGameTutorialPrompt',
  input: {schema: AIGameTutorialInputSchema},
  output: {schema: AIGameTutorialOutputSchema},
  prompt: `You are an AI assistant designed to guide new players in a city-builder game.

  Based on the player's current game state, provide a single, concise tutorial step that will help them progress.
  Explain your reasoning for the suggestion.

  Here's the player's current game state:
  - Gold: {{gold}}
  - Citizens: {{citizens}}
  - Happiness: {{happiness}}
  - Buildings Built: {{buildingsBuilt}}
  - Objectives Completed: {{#each objectivesCompleted}}- {{this}}\n{{/each}}

  Consider these factors when providing a step:
  - Encourage building a variety of building types (Residential, Commercial, Industrial, Parks).
  - Advise resource management to maintain a balance of gold, citizens, and happiness.
  - Suggest upgrading buildings to increase production.
  - Recommend minting land and buildings as NFTs.
  - Guide the player towards completing the main objectives of the game.

  Output the next tutorial step and your reasoning in the following format:
  {
    "step": "[Next tutorial step]",
    "reasoning": "[Reasoning for the step]"
  }
  `,
});

const provideAIGameTutorialFlow = ai.defineFlow(
  {
    name: 'provideAIGameTutorialFlow',
    inputSchema: AIGameTutorialInputSchema,
    outputSchema: AIGameTutorialOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
