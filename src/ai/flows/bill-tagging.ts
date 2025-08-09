'use server';

/**
 * @fileOverview Automatically categorizes bills using AI based on the description.
 *
 * - autoBillTagging - A function that categorizes a bill description.
 * - AutoBillTaggingInput - The input type for the autoBillTagging function.
 * - AutoBillTaggingOutput - The return type for the autoBillTagging function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoBillTaggingInputSchema = z.object({
  description: z.string().describe('The description of the bill.'),
});
export type AutoBillTaggingInput = z.infer<typeof AutoBillTaggingInputSchema>;

const AutoBillTaggingOutputSchema = z.object({
  category: z.string().describe('The category of the bill.'),
});
export type AutoBillTaggingOutput = z.infer<typeof AutoBillTaggingOutputSchema>;

export async function autoBillTagging(input: AutoBillTaggingInput): Promise<AutoBillTaggingOutput> {
  return autoBillTaggingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoBillTaggingPrompt',
  input: {schema: AutoBillTaggingInputSchema},
  output: {schema: AutoBillTaggingOutputSchema},
  prompt: `You are a personal finance expert. Given the description of a bill, determine the most appropriate category for it.

Description: {{{description}}}

Respond with only the category name. Possible categories include: Groceries, Internet, Rent, Utilities, Food, Entertainment, Transportation, Shopping, Travel, Education, Healthcare, Insurance, Other.`,
});

const autoBillTaggingFlow = ai.defineFlow(
  {
    name: 'autoBillTaggingFlow',
    inputSchema: AutoBillTaggingInputSchema,
    outputSchema: AutoBillTaggingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
