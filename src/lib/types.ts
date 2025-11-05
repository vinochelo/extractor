import type { Timestamp } from "firebase/firestore";

export type RetentionData = {
  numeroRetencion: string;
  autorizacion: string;
  razonSocial: string;
  rucCliente: string;
  numeroFactura: string;
  fechaEmision: string;
};

export type RetentionRecord = RetentionData & {
  id: string;
  fileName: string;
  createdAt: Timestamp | Date;
  userId: string;
};
