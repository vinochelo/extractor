'use server';

import { extractData, type ExtractionInput, type ExtractionOutput } from '@/ai/flows/contextualized-data-extraction';

export async function extractDataAction(
  input: ExtractionInput
): Promise<{ data: ExtractionOutput | null; error: string | null }> {
  try {
    const data = await extractData(input);
    return { data, error: null };
  } catch (e) {
    console.error('Error extracting data from PDF:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { data: null, error: `Failed to extract data. ${errorMessage}` };
  }
}
