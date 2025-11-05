'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Archive, FileWarning } from "lucide-react";
import { useFirestore, useUser, updateDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import type { RetentionRecord, RetentionStatus } from "@/lib/types";

interface StatusMenuProps {
  retention: RetentionRecord;
}

export function StatusMenu({ retention }: StatusMenuProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const handleStatusChange = (newStatus: RetentionStatus) => {
    if (!firestore || !user?.uid) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo conectar con la base de datos.",
      });
      return;
    }

    const retentionRef = doc(firestore, `users/${user.uid}/retenciones`, retention.id);
    
    updateDocumentNonBlocking(retentionRef, { estado: newStatus });

    toast({
      title: "Estado Actualizado",
      description: `La retención ahora está en estado: ${newStatus}.`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Cambiar Estado</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {retention.estado === "Solicitado" && (
          <DropdownMenuItem onSelect={() => handleStatusChange("Pendiente Anular")}>
            <FileWarning className="mr-2 h-4 w-4" />
            <span>Marcar Pendiente Anular</span>
          </DropdownMenuItem>
        )}
        {retention.estado === "Pendiente Anular" && (
          <DropdownMenuItem onSelect={() => handleStatusChange("Anulado")}>
            <Archive className="mr-2 h-4 w-4" />
            <span>Marcar como Anulado</span>
          </DropdownMenuItem>
        )}
        {retention.estado === 'Anulado' && (
             <DropdownMenuItem disabled>
                <span>No hay acciones</span>
            </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
