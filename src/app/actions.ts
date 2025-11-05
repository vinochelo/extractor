'use server';

import { z } from 'zod';
import { extractRetentionDataFromPDF } from '@/ai/flows/extract-retention-data-from-pdf';
import { firestoreAdmin } from '@/firebase/admin';
import type { RetentionRecord } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';
import { addDocumentNonBlocking } from '@/firebase';

const actionSchema = z.object({
  fileAsDataUrl: z.string().startsWith('data:application/pdf;base64,'),
  fileName: z.string(),
  userId: z.string().min(1),
});

export async function extractAndSaveRetention(
  input: z.infer<typeof actionSchema>
): Promise<
  { success: true; data: RetentionRecord } | { success: false; error: string }
> {
  try {
    const validation = actionSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: 'Invalid input.' };
    }

    const { fileAsDataUrl, fileName, userId } = validation.data;

    // 1. Call Genkit AI flow
    const extractedData = await extractRetentionDataFromPDF({
      pdfDataUri: fileAsDataUrl,
    });

    // 2. Prepare data for Firestore
    const retentionRecord = {
      ...extractedData,
      fileName,
      createdAt: FieldValue.serverTimestamp(), // Use server timestamp for consistency
      userId,
    };

    // 3. Save to Firestore using admin SDK
    const retencionesCollection = firestoreAdmin
      .collection('users')
      .doc(userId)
      .collection('retenciones');
    const docRef = await retencionesCollection.add(retentionRecord);

    // To ensure the client gets the server-generated timestamp, we get the doc after creation.
    const docSnapshot = await docRef.get();
    const finalData = {
      id: docRef.id,
      ...docSnapshot.data(),
    } as RetentionRecord;

    // 4. Return the new record with its ID
    return { success: true, data: finalData };
  } catch (error) {
    console.error('Error in extractAndSaveRetention:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: `An unexpected error occurred: ${error.message}`,
      };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
