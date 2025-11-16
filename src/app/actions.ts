'use server';

import { generateBuildingDescription, GenerateBuildingDescriptionInput } from '@/ai/flows/generate-building-descriptions';

export async function generateBuildingDescriptionAction(
  input: GenerateBuildingDescriptionInput
): Promise<{ description: string } | { error: string }> {
  try {
    const result = await generateBuildingDescription(input);
    return { description: result.description };
  } catch (error) {
    console.error('Error generating building description:', error);
    return { error: 'Failed to generate description. Please try again.' };
  }
}
