"use client";

import { useMemo } from "react";
import { useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useFirestore } from "@/firebase/provider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { ExternalLink, FileWarning, Archive } from "lucide-react";
import { format } from "date-fns";
import type { RetentionRecord } from "@/lib/types";

export function RetentionHistoryTable() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const retencionesQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
      collection(firestore, `users/${user.uid}/retenciones`),
      orderBy("createdAt", "desc")
    );
  }, [firestore, user?.uid]);

  const { data: retenciones, isLoading: loading, error } = useCollection<RetentionRecord>(retencionesQuery);

  const { activeRetenciones, anulatedRetenciones } = useMemo(() => {
    const active = retenciones?.filter(r => r.estado !== 'Anulado') || [];
    const anulated = retenciones?.filter(r => r.estado === 'Anulado') || [];
    return { activeRetenciones: active, anulatedRetenciones: anulated };
  }, [retenciones]);


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
        // For strings or numbers from client side generation
        return format(new Date(date), "dd/MM/yyyy HH:mm");
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
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
        <TableCell><Skeleton className="h-9 w-24" /></TableCell>
      </TableRow>
    ))
  );
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Solicitado':
        return <Badge variant="default">Solicitado</Badge>;
      case 'Pendiente Anular':
        return <Badge variant="secondary">Pendiente Anular</Badge>;
      case 'Anulado':
        return <Badge variant="destructive">Anulado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderTableRows = (items: RetentionRecord[]) => {
    if (items.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="h-24 text-center">
            No hay retenciones en esta categoría.
          </TableCell>
        </TableRow>
      );
    }
    return items.map((item: RetentionRecord) => (
      <TableRow key={item.id}>
        <TableCell><Badge variant="secondary">{item.numeroRetencion}</Badge></TableCell>
        <TableCell className="font-medium">{item.razonSocialProveedor}</TableCell>
        <TableCell className="font-mono text-xs">{item.numeroAutorizacion}</TableCell>
        <TableCell>{item.numeroFactura}</TableCell>
        <TableCell>{getStatusBadge(item.estado)}</TableCell>
        <TableCell>{formatDate(item.createdAt)}</TableCell>
        <TableCell>{item.fechaEmision}</TableCell>
        <TableCell>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleVerifySRI(item.numeroAutorizacion)}
          >
            Verificar en SRI
            <ExternalLink className="ml-2 h-3 w-3" />
          </Button>
        </TableCell>
      </TableRow>
    ));
  }


  return (
    <Card className="w-full max-w-7xl mx-auto">
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
        <div className="border rounded-lg mb-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nro. Retención</TableHead>
                <TableHead>Razón Social Proveedor</TableHead>
                <TableHead>Autorización</TableHead>
                <TableHead>Nro. Factura</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead>Fecha Emisión</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? renderSkeleton() : renderTableRows(activeRetenciones) }
            </TableBody>
          </Table>
        </div>

        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="anuladas">
                <AccordionTrigger>
                    <div className="flex items-center gap-2">
                        <Archive className="h-4 w-4" />
                        Mostrar Retenciones Anuladas ({anulatedRetenciones.length})
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nro. Retención</TableHead>
                                    <TableHead>Razón Social Proveedor</TableHead>
                                    <TableHead>Autorización</TableHead>
                                    <TableHead>Nro. Factura</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Fecha Creación</TableHead>
                                    <TableHead>Fecha Emisión</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? null : renderTableRows(anulatedRetenciones)}
                            </TableBody>
                        </Table>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>

      </CardContent>
    </Card>
  );
}
