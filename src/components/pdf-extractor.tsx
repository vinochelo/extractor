"use client";

import { useState, useRef, useCallback, useTransition } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { UploadCloud, FileText, XCircle, Loader2, ClipboardCopy, Mail, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { extractDataAction } from '@/app/actions';
import type { ExtractionOutput } from '@/ai/flows/contextualized-data-extraction';
import { cn } from '@/lib/utils';

const DataField = ({ label, value }: { label: string; value: string | undefined }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast({
      description: `"${label}" copiado al portapapeles.`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center justify-between gap-2">
        <p className="text-lg font-semibold break-words">{value || '...'}</p>
        <Button variant="ghost" size="icon" onClick={onCopy} disabled={!value} aria-label={`Copiar ${label}`}>
          {copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};


export default function PdfExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ExtractionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (selectedFile: File | null) => {
    setData(null);
    setError(null);
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      setFile(null);
      if (selectedFile) { // only show error if a file was selected and it was invalid
        setError('Por favor, selecciona un archivo PDF válido.');
      }
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files?.[0] || null);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files?.[0] || null);
  };
  
  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatNumeroFactura = (numero?: string) => {
    if (!numero) return undefined;
    
    // Remove any existing hyphens to handle re-extraction
    const digits = numero.replace(/-/g, '');

    if (digits.length > 6) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    if (digits.length > 3) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    }
    return digits;
  }

  const handleExtractData = () => {
    if (!file) return;

    setError(null);
    setData(null);

    startTransition(async () => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const pdfDataUri = reader.result as string;
        const result = await extractDataAction({ pdfDataUri });
        if (result.error) {
          setError(result.error);
        } else {
          setData(result.data);
        }
      };
      reader.onerror = () => {
        setError('No se pudo leer el archivo.');
      };
    });
  };
  
  const formatDataForClipboard = (extractedData: ExtractionOutput): string => {
    const formattedNumeroFactura = formatNumeroFactura(extractedData.numeroFactura) || extractedData.numeroFactura;
    return `Favor su ayuda aceptando la anulación en el SRI de la siguiente retención:

Número de Retención: ${extractedData.numeroRetencion}
Autorización: ${extractedData.autorizacion}
Razón Social: ${extractedData.razonSocial}
RUC Cliente: ${extractedData.rucCliente}
Número de Factura que aplica: ${formattedNumeroFactura}`;
  };

  const handleCopyAll = () => {
    if (!data) return;
    const formattedData = formatDataForClipboard(data);
    navigator.clipboard.writeText(formattedData);
    toast({
      title: "Copiado al Portapapeles",
      description: "Todos los datos extraídos han sido copiados.",
    });
  };

  const handleEmail = () => {
    if (!data) return;
    const formattedData = formatDataForClipboard(data);
    const subject = "Solicitud anulación retención";
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(formattedData)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Extractor de Datos de PDF</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Sube un PDF de 'retención' para extraer automáticamente información clave.
        </p>
      </header>

      <Card>
        <CardContent className="p-6">
          <div
            className={cn(
              "flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
              isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
            )}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="w-12 h-12 text-muted-foreground" />
            <p className="mt-4 text-center text-muted-foreground">
              <span className="font-semibold text-primary">Haz clic para subir</span> o arrastra y suelta un PDF
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={onFileChange}
            />
          </div>

          {file && (
            <div className="mt-4 flex items-center justify-between bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                <span className="font-medium">{file.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                <XCircle className="w-5 h-5" />
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center p-6 border-t">
          <Button onClick={handleExtractData} disabled={!file || isPending} size="lg">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extrayendo...
              </>
            ) : (
              'Extraer Datos'
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Falló la Extracción</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {(isPending || data) && (
        <Card className={cn("transition-opacity duration-500", isPending && !data ? "opacity-50" : "opacity-100")}>
          <CardHeader>
            <CardTitle>Información Extraída</CardTitle>
            <CardDescription>Revisa los datos extraídos de tu documento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <DataField label="Número de Retención" value={data?.numeroRetencion} />
              <DataField label="Autorización" value={data?.autorizacion} />
              <DataField label="Razón Social" value={data?.razonSocial} />
              <DataField label="RUC Cliente" value={data?.rucCliente} />
              <DataField label="Número de Factura que aplica" value={formatNumeroFactura(data?.numeroFactura)} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2 justify-end border-t p-6">
            <Button variant="outline" onClick={handleCopyAll} disabled={!data || isPending}>
              <ClipboardCopy className="mr-2 h-4 w-4" /> Copiar Todo
            </Button>
            <Button variant="default" className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleEmail} disabled={!data || isPending}>
              <Mail className="mr-2 h-4 w-4" /> Compartir por Email
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
