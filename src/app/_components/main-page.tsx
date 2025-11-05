"use client";

import { useEffect, useState } from "react";
import { PdfUploader } from "./pdf-uploader";
import { ExtractionResultCard } from "./extraction-result-card";
import { RetentionHistoryTable } from "./retention-history-table";
import { extractData } from "@/app/actions";
import { useUser, useFirestore, addDocumentNonBlocking, useAuth, initiateAnonymousSignIn } from "@/firebase";
import { collection } from "firebase/firestore";
import type { RetentionRecord } from "@/lib/types";

export function MainPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<RetentionRecord | null>(null);
  const [historyKey, setHistoryKey] = useState(Date.now());

  useEffect(() => {
    // Automatically sign in the user anonymously if not logged in and not loading.
    if (!user && !isUserLoading && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);


  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setExtractedData(null);
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    if (!file || !user || !firestore) return;

    setLoading(true);
    setError(null);
    setExtractedData(null);

    try {
      const fileAsDataUrl = await fileToDataUrl(file);
      const result = await extractData({
        fileAsDataUrl,
      });

      if (result.success) {
        const retentionRecord: Omit<RetentionRecord, 'id'> = {
          ...result.data,
          fileName: file.name,
          createdAt: new Date(), // Use JS Date object, Firestore will convert it.
          userId: user.uid,
          estado: "Solicitado", // Set default status
        };
        
        const retencionesCollection = collection(firestore, 'users', user.uid, 'retenciones');
        // The addDoc promise resolves with a DocumentReference
        const docRef = await addDocumentNonBlocking(retencionesCollection, retentionRecord);

        // Show the results card immediately with the data we have.
        // We can use the client-generated data for the UI, as it will be consistent
        // with what's being saved to Firestore.
        setExtractedData({ ...retentionRecord, id: docRef ? docRef.id : 'temp-id' });
        setFile(null); // Clear the file input on success
        setHistoryKey(Date.now()); // Force a re-fetch of the history
      } else {
        setError(result.error);
      }
    } catch (e: any) {
      setError(e.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 md:py-16">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
          Retención<span className="text-primary">Wise</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Extrae datos de tus documentos de retención PDF de forma rápida y segura con el poder de la IA.
        </p>
      </div>

      <div className="mb-12">
        <RetentionHistoryTable key={historyKey} />
      </div>

      <PdfUploader
        file={file}
        onFileChange={handleFileChange}
        onFileRemove={handleRemoveFile}
        onSubmit={handleSubmit}
        loading={loading || isUserLoading}
        error={error}
      />

      {extractedData && <ExtractionResultCard data={extractedData} />}

    </main>
  );
}
