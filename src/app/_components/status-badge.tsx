'use client';

import { Badge } from "@/components/ui/badge";
import type { RetentionStatus } from "@/lib/types";

interface StatusBadgeProps {
    status: RetentionStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const getBadgeVariant = (status: RetentionStatus) => {
        switch(status) {
          case 'Solicitado':
            return 'success';
          case 'Pendiente Anular':
            return 'warning';
          case 'Anulado':
            return 'destructive';
          default:
            return 'outline';
        }
      };

    return <Badge variant={getBadgeVariant(status)}>{status}</Badge>;
}
