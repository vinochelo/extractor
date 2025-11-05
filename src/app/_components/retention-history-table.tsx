"use client";

import { useAuth } from "@/firebase/use-auth";
import { useRetenciones } from "@/firebase/use-retenciones";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Copy, ExternalLink, FileWarning } from "lucide-react";
import { format } from "date-fns";
import type { RetentionRecord } from "@/lib/types";

export function RetentionHistoryTable() {
  const { user } = useAuth();
  const { retenciones, loading, error } = useRetenciones(user?.uid || null);
  const { toast } = useToast();

  const handleVerifySRI = (autorizacion: string) => {
    navigator.clipboard.writeText(autorizacion).then(() => {
      toast({
        title: "Autorización Copiada",
        description: "El número de autorización se ha copiado al portapapeles.",
      });
      window.open(
        "https://srienlinea.sri.gob.ec/comprobantes-electronicos-internet/publico/validezComprobantes.jsf",
        "_blank"
      );
    });
  };

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    if (date.toDate) { // Firebase Timestamp
      return format(date.toDate(), "dd/MM/yyyy HH:mm");
    }
    try {
        // For strings or numbers
        return format(new Date(date), "dd/MM/yyyy");
    } catch {
        return "Fecha inválida";
    }
  };

  const renderSkeleton = () => (
    Array.from({ length: 3 }).map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
        <TableCell><Skeleton className="h-9 w-24" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <Card className="w-full max-w-7xl mx-auto mt-12">
      <CardHeader>
        <CardTitle>Historial de Retenciones</CardTitle>
        <CardDescription>
          Aquí puedes ver todas las retenciones que has procesado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
            <Alert variant="destructive">
                <FileWarning className="h-4 w-4" />
                <AlertTitle>Error al Cargar Historial</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
            </Alert>
        )}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nro. Retención</TableHead>
                <TableHead>Razón Social</TableHead>
                <TableHead>Autorización</TableHead>
                <TableHead>Nro. Factura</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead>Fecha Emisión</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? renderSkeleton() : 
                retenciones.length > 0 ? (
                  retenciones.map((item: RetentionRecord) => (
                    <TableRow key={item.id}>
                      <TableCell><Badge variant="secondary">{item.numeroRetencion}</Badge></TableCell>
                      <TableCell className="font-medium">{item.razonSocial}</TableCell>
                      <TableCell className="font-mono text-xs">{item.autorizacion}</TableCell>
                      <TableCell>{item.numeroFactura}</TableCell>
                      <TableCell>{formatDate(item.createdAt)}</TableCell>
                      <TableCell>{item.fechaEmision}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerifySRI(item.autorizacion)}
                        >
                          Verificar en SRI
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                        No hay retenciones procesadas todavía.
                    </TableCell>
                  </TableRow>
                )
              }
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
