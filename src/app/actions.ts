'use server';

import { z } from 'zod';
import { extractRetentionDataFromPDF } from '@/ai/flows/extract-retention-data-from-pdf';
import type { RetentionData } from "@/lib/types";

const actionSchema = z.object({
  fileAsDataUrl: z.string().startsWith('data:application/pdf;base64,'),
});

export async function extractData(
  input: z.infer<typeof actionSchema>
): Promise<
  { success: true; data: RetentionData } | { success: false; error: string }
> {
  try {
    const validation = actionSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: 'Datos de entrada inválidos.' };
    }

    const { fileAsDataUrl } = validation.data;

    // Call Genkit AI flow
    const extractedData = await extractRetentionDataFromPDF({
      pdfDataUri: fileAsDataUrl,
    });
    
    return { success: true, data: extractedData };

  } catch (error) {
    console.error('Error en extractAndSaveRetention:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: `Ocurrió un error inesperado: ${error.message}`,
      };
    }
    return { success: false, error: 'Ocurrió un error inesperado.' };
  }
}
