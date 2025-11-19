"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Import } from "lucide-react";
import Papa from "papaparse";
import { saveProviderEmails } from "@/lib/provider-emails";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function EmailImporter() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv") {
        toast({
            variant: "destructive",
            title: "Archivo no válido",
            description: "Por favor, selecciona un archivo con formato .csv",
        });
        return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const requiredHeaders = ["ruc", "email"];
        const headers = results.meta.fields || [];
        const hasRequiredHeaders = requiredHeaders.every(h => headers.includes(h));

        if (!hasRequiredHeaders) {
            toast({
                variant: "destructive",
                title: "Cabeceras incorrectas",
                description: `El archivo CSV debe contener las columnas: ${requiredHeaders.join(", ")}.`,
            });
            return;
        }

        const emailMap: Record<string, string> = {};
        let validRows = 0;
        results.data.forEach((row: any) => {
            if (row.ruc && row.email) {
                emailMap[row.ruc.trim()] = row.email.trim();
                validRows++;
            }
        });
        
        saveProviderEmails(emailMap);
        toast({
            title: "Importación exitosa",
            description: `Se han cargado ${validRows} correos de proveedores en el navegador.`,
        });
      },
      error: (error: any) => {
        toast({
            variant: "destructive",
            title: "Error al leer el archivo",
            description: error.message,
        });
      }
    });

    // Reset file input to allow re-uploading the same file
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
        <CardHeader>
            <CardTitle>Importar Correos de Proveedores</CardTitle>
            <CardDescription>
                Sube un archivo .csv con las columnas 'ruc' y 'email' para autocompletar el destinatario en las solicitudes al SRI. Los datos se guardan localmente en tu navegador.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".csv"
            />
            <Button onClick={handleImportClick}>
                <Import className="mr-2 h-4 w-4" />
                Importar archivo .csv
            </Button>
        </CardContent>
    </Card>
  );
}
