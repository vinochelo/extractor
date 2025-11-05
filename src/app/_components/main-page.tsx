"use client";

import { useState } from "react";
import { PdfUploader } from "./pdf-uploader";
import { ExtractionResultCard } from "./extraction-result-card";
import { RetentionHistoryTable } from "./retention-history-table";
import { extractAndSaveRetention } from "@/app/actions";
import { useUser } from "@/firebase";
import { type RetentionData } from "@/lib/types";

export function MainPage() {
  const { user, isUserLoading } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<RetentionData | null>(null);

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
    if (!file || !user) return;

    setLoading(true);
    setError(null);
    setExtractedData(null);

    try {
      const fileAsDataUrl = await fileToDataUrl(file);
      const result = await extractAndSaveRetention({
        fileAsDataUrl,
        fileName: file.name,
        userId: user.uid,
      });

      if (result.success) {
        setExtractedData(result.data);
        setFile(null);
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

      <PdfUploader
        file={file}
        onFileChange={handleFileChange}
        onFileRemove={handleRemoveFile}
        onSubmit={handleSubmit}
        loading={loading || isUserLoading}
        error={error}
      />

      {extractedData && <ExtractionResultCard data={extractedData} />}
      
      <div className="mt-12">
        <RetentionHistoryTable />
      </div>
    </main>
  );
}
