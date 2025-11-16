'use server';

/**
 * @fileOverview A building description generation AI agent.
 *
 * - generateBuildingDescription - A function that handles the building description process.
 * - GenerateBuildingDescriptionInput - The input type for the generateBuildingDescription function.
 * - GenerateBuildingDescriptionOutput - The return type for the generateBuildingDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBuildingDescriptionInputSchema = z.object({
  buildingType: z.string().describe('The type of the building (e.g., Residential, Commercial, Industrial, Park).'),
  level: z.number().min(1).max(3).describe('The level of the building (1, 2, or 3).'),
  productionRate: z.number().describe('The production rate of the building.'),
  adjacencyBonus: z.number().optional().describe('The adjacency bonus the building receives, if any.'),
  description: z.string().optional().describe('A basic description of the building provided by the game.'),
});
export type GenerateBuildingDescriptionInput = z.infer<typeof GenerateBuildingDescriptionInputSchema>;

const GenerateBuildingDescriptionOutputSchema = z.object({
  description: z.string().describe('A detailed textual description of the building based on its stats and attributes.'),
});
export type GenerateBuildingDescriptionOutput = z.infer<typeof GenerateBuildingDescriptionOutputSchema>;

export async function generateBuildingDescription(input: GenerateBuildingDescriptionInput): Promise<GenerateBuildingDescriptionOutput> {
  return generateBuildingDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBuildingDescriptionPrompt',
  input: {schema: GenerateBuildingDescriptionInputSchema},
  output: {schema: GenerateBuildingDescriptionOutputSchema},
  prompt: `You are an expert city planner, skilled at describing buildings in detail.

  Based on the provided information, generate a vivid and engaging description of the building.
  Include details about its function, level, production rate, and any adjacency bonuses it receives.

  Building Type: {{{buildingType}}}
  Level: {{{level}}}
  Production Rate: {{{productionRate}}}
  Adjacency Bonus: {{#if adjacencyBonus}}+{{{adjacencyBonus}}}%{{else}}None{{/if}}

  {{#if description}}
  Description: {{{description}}}
  {{/if}}

  Detailed Building Description:`,
});

const generateBuildingDescriptionFlow = ai.defineFlow(
  {
    name: 'generateBuildingDescriptionFlow',
    inputSchema: GenerateBuildingDescriptionInputSchema,
    outputSchema: GenerateBuildingDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
