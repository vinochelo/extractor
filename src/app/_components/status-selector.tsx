'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFirestore, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { RetentionRecord, RetentionStatus } from '@/lib/types';
import { StatusBadge } from './status-badge';
import { Archive, FileWarning } from 'lucide-react';

interface StatusSelectorProps {
  retention: RetentionRecord;
}

export function StatusSelector({ retention }: StatusSelectorProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const handleStatusChange = (newStatus: RetentionStatus) => {
    if (!firestore || !user?.uid) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo conectar con la base de datos.',
      });
      return;
    }

    const retentionRef = doc(
      firestore,
      `users/${user.uid}/retenciones`,
      retention.id
    );

    updateDocumentNonBlocking(retentionRef, { estado: newStatus });

    toast({
      title: 'Estado Actualizado',
      description: `La retención ahora está en estado: ${newStatus}.`,
    });
  };

  const availableActions: {
    label: string;
    action: () => void;
    icon: React.ReactNode;
  }[] = [];

  if (retention.estado === 'Solicitado') {
    availableActions.push({
      label: 'Marcar Pendiente Anular',
      action: () => handleStatusChange('Pendiente Anular'),
      icon: <FileWarning className="mr-2 h-4 w-4" />,
    });
  }

  if (retention.estado === 'Pendiente Anular') {
    availableActions.push({
      label: 'Marcar como Anulado',
      action: () => handleStatusChange('Anulado'),
      icon: <Archive className="mr-2 h-4 w-4" />,
    });
  }

  if (availableActions.length === 0) {
    return <StatusBadge status={retention.estado} />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button>
          <StatusBadge status={retention.estado} className="cursor-pointer hover:opacity-80 transition-opacity" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {availableActions.map(action => (
          <DropdownMenuItem key={action.label} onSelect={action.action}>
            {action.icon}
            <span>{action.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
