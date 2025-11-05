'use server';

/**
 * @fileOverview Extracts data from a PDF of an Ecuadorian 'retención' document.
 *
 * - extractRetentionDataFromPDF - A function that handles the data extraction process.
 * - ExtractRetentionDataFromPDFInput - The input type for the extractRetentionDataFromPDF function.
 * - ExtractRetentionDataFromPDFOutput - The return type for the extractRetentionDataFromPDF function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractRetentionDataFromPDFInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF document of an Ecuadorian 'retención', as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractRetentionDataFromPDFInput = z.infer<typeof ExtractRetentionDataFromPDFInputSchema>;

const ExtractRetentionDataFromPDFOutputSchema = z.object({
  numeroRetencion: z.string().describe('The retention number.'),
  autorizacion: z.string().describe('The authorization number.'),
  razonSocial: z.string().describe('The business name.'),
  rucCliente: z.string().describe('The client RUC number.'),
  numeroFactura: z.string().describe('The invoice number.'),
  fechaEmision: z.string().describe('The issue date.'),
});
export type ExtractRetentionDataFromPDFOutput = z.infer<typeof ExtractRetentionDataFromPDFOutputSchema>;

export async function extractRetentionDataFromPDF(
  input: ExtractRetentionDataFromPDFInput
): Promise<ExtractRetentionDataFromPDFOutput> {
  return extractRetentionDataFromPDFFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractRetentionDataFromPDFPrompt',
  input: {schema: ExtractRetentionDataFromPDFInputSchema},
  output: {schema: ExtractRetentionDataFromPDFOutputSchema},
  prompt: `You are an expert in extracting data from Ecuadorian 'retención' documents.

  Extract the following fields from the document provided as a PDF data URI:
  - numeroRetencion
  - autorizacion
  - razonSocial
  - rucCliente
  - numeroFactura
  - fechaEmision

  Return the extracted data in JSON format.

  PDF Document: {{media url=pdfDataUri}}`,
});

const extractRetentionDataFromPDFFlow = ai.defineFlow(
  {
    name: 'extractRetentionDataFromPDFFlow',
    inputSchema: ExtractRetentionDataFromPDFInputSchema,
    outputSchema: ExtractRetentionDataFromPDFOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
