'use server';

/**
 * @fileOverview Extracts data from a PDF document, understanding its context to improve accuracy.
 *
 * - `extractData`: A function that extracts data from the PDF content.
 * - `ExtractionInput`: The input type for the `extractData` function, including the PDF content.
 * - `ExtractionOutput`: The return type for the `extractData` function, containing extracted data fields.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractionInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      'The PDF document content as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // prettier-ignore
    ),
});
export type ExtractionInput = z.infer<typeof ExtractionInputSchema>;

const ExtractionOutputSchema = z.object({
  numeroRetencion: z.string().describe('The retention number.'),
  autorizacion: z.string().describe('The authorization number.'),
  razonSocial: z.string().describe('The company name of the client.'),
  rucCliente: z.string().describe('The RUC (tax ID) of the client.'),
  numeroFactura: z.string().describe('El número de factura que aplica.'),
});
export type ExtractionOutput = z.infer<typeof ExtractionOutputSchema>;

export async function extractData(input: ExtractionInput): Promise<ExtractionOutput> {
  return extractionFlow(input);
}

const extractionPrompt = ai.definePrompt({
  name: 'extractionPrompt',
  input: {schema: ExtractionInputSchema},
  output: {schema: ExtractionOutputSchema},
  prompt: `You are an expert data extractor. From the provided 'retencion' document, extract only the following fields: numero de retencion, autorizacion, razon social of the client, ruc of the client, and the applicable numero de factura.
Document: {{media url=pdfDataUri}}`,
});

const extractionFlow = ai.defineFlow(
  {
    name: 'extractionFlow',
    inputSchema: ExtractionInputSchema,
    outputSchema: ExtractionOutputSchema,
  },
  async input => {
    const {output} = await extractionPrompt(input);
    return output!;
  }
);
