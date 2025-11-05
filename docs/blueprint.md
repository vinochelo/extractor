# **App Name**: RetenciónWise

## Core Features:

- PDF Upload: Allows users to upload PDF files via drag-and-drop or file selection.
- AI-Powered Data Extraction: Extracts data from uploaded PDF documents using an AI model (Genkit) to identify fields like 'numeroRetencion', 'autorizacion', 'razonSocial', 'rucCliente', 'numeroFactura', and 'fechaEmision'.
- Secure Data Persistence with Firestore: Securely stores extracted data, including file name ('fileName') and timestamp ('createdAt'), in a user-specific subcollection in Firestore using firebase-admin SDK.
- Data Display: Displays extracted data in a card format with options to copy all data or share via email.
- Retention History Table: Presents a real-time table of processed retenciones, displaying key columns like 'Nro. Retención', 'Razón Social', 'Autorización', 'Nro. Factura', 'Fecha Creación', and 'Fecha Emisión'.
- SRI Verification Tool: Implements a 'Verificar en SRI' button that copies the 'autorización' number to the clipboard, displays a toast notification, and opens the SRI validation page (https://srienlinea.sri.gob.ec/comprobantes-electronicos-internet/publico/validezComprobantes.jsf) in a new tab, as a tool that aids users in cross-checking information.

## Style Guidelines:

- Primary color: Soft blue (#A0CFEC), representing trust and security, relevant to financial documents.
- Background color: Light gray (#F0F4F8), offering a clean and neutral backdrop.
- Accent color: Muted teal (#78B2B1), providing subtle contrast and a professional feel.
- Body and headline font: 'Inter', a sans-serif, chosen for its modern and neutral look.
- Code font: 'Source Code Pro' for displaying code snippets.
- Utilize clean and professional icons from shadcn/ui for actions and file types.
- Subtle loading animations and transitions to indicate processing and data updates.