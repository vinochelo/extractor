import type { Timestamp } from "firebase/firestore";

export type RetentionData = {
  numeroRetencion: string;
  numeroAutorizacion: string;
  razonSocialProveedor: string;
  rucProveedor: string;
  numeroFactura: string;
  fechaEmision: string;
};

export type RetentionRecord = RetentionData & {
  id: string;
  fileName: string;
  createdAt: Timestamp | Date;
  userId: string;
};
