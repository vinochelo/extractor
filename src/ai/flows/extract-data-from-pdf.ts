'use server';

/**
 * @fileOverview Extracts data from a PDF document of a 'retencion'.
 *
 * - extractDataFromPdf - A function that handles the data extraction process.
 * - ExtractDataFromPdfInput - The input type for the extractDataFromPdf function.
 * - ExtractDataFromPdfOutput - The return type for the extractDataFromPdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractDataFromPdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF document of a 'retencion', as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractDataFromPdfInput = z.infer<typeof ExtractDataFromPdfInputSchema>;

const ExtractDataFromPdfOutputSchema = z.object({
  numeroRetencion: z.string().describe('The retencion number.'),
  autorizacion: z.string().describe('The authorization number.'),
  razonSocial: z.string().describe('The business name of the client.'),
  rucCliente: z.string().describe('The RUC of the client.'),
  numeroFactura: z.string().describe('El número de factura que aplica.'),
});
export type ExtractDataFromPdfOutput = z.infer<typeof ExtractDataFromPdfOutputSchema>;

export async function extractDataFromPdf(input: ExtractDataFromPdfInput): Promise<ExtractDataFromPdfOutput> {
  return extractDataFromPdfFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractDataFromPdfPrompt',
  input: {schema: ExtractDataFromPdfInputSchema},
  output: {schema: ExtractDataFromPdfOutputSchema},
  prompt: `You are an expert data extractor specializing in retencion documents.

You will use this information to extract the following fields from the document:
- numero de retencion
- autorizacion
- razon social
- ruc del cliente
- numero de factura que aplica

Use the following document as the primary source of information.

Document: {{media url=pdfDataUri}}`,
});

const extractDataFromPdfFlow = ai.defineFlow(
  {
    name: 'extractDataFromPdfFlow',
    inputSchema: ExtractDataFromPdfInputSchema,
    outputSchema: ExtractDataFromPdfOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
