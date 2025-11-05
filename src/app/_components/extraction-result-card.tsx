"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Mail, Check } from "lucide-react";
import { RetentionData } from "@/lib/types";
import { useState } from "react";

interface ExtractionResultCardProps {
  data: RetentionData;
}

export function ExtractionResultCard({ data }: ExtractionResultCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const formattedText = `
Resumen de Retención:
--------------------------------
Nro. Retención: ${data.numeroRetencion}
Autorización: ${data.autorizacion}
Razón Social: ${data.razonSocial}
RUC Cliente: ${data.rucCliente}
Nro. Factura: ${data.numeroFactura}
Fecha Emisión: ${data.fechaEmision}
--------------------------------
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedText).then(() => {
      setCopied(true);
      toast({
        title: "Copiado al portapapeles",
        description: "Los datos de la retención han sido copiados.",
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = () => {
    const subject = `Retención: ${data.numeroRetencion}`;
    const body = encodeURIComponent(formattedText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
      <CardHeader>
        <CardTitle>Datos Extraídos</CardTitle>
        <CardDescription>
          Se ha extraído la siguiente información del documento.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {Object.entries(data).map(([key, value]) => {
            // A simple way to format the key
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            return (
              <div key={key} className="p-3 bg-muted/50 rounded-lg">
                <p className="font-semibold text-muted-foreground">{formattedKey}</p>
                <p className="font-mono text-foreground break-words">{value}</p>
              </div>
            )
          })}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleShare}>
          <Mail className="mr-2" />
          Compartir por Email
        </Button>
        <Button onClick={handleCopy}>
          {copied ? <Check className="mr-2" /> : <Copy className="mr-2" />}
          {copied ? "Copiado" : "Copiar Todo"}
        </Button>
      </CardFooter>
    </Card>
  );
}
