"use client";

const LOCAL_STORAGE_KEY = "provider-emails";

/**
 * Guarda el mapa de RUCs y correos en el localStorage.
 * @param emails - Un objeto donde la clave es el RUC y el valor es el email.
 */
export const saveProviderEmails = (emails: Record<string, string>): void => {
  try {
    const jsonValue = JSON.stringify(emails);
    window.localStorage.setItem(LOCAL_STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error("Error saving provider emails to localStorage:", error);
  }
};

/**
 * Obtiene el mapa de RUCs y correos desde el localStorage.
 * @returns El objeto con RUCs y emails, o un objeto vacío si no hay datos.
 */
export const getProviderEmails = (): Record<string, string> => {
  try {
    const jsonValue = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    return jsonValue ? JSON.parse(jsonValue) : {};
  } catch (error) {
    console.error("Error getting provider emails from localStorage:", error);
    return {};
  }
};

/**
 * Busca un correo electrónico por el RUC del proveedor.
 * @param ruc - El RUC del proveedor a buscar.
 * @returns El correo electrónico si se encuentra, de lo contrario, una cadena vacía.
 */
export const getEmailByRuc = (ruc: string): string => {
    if (typeof window === "undefined") return "";
    const emails = getProviderEmails();
    return emails[ruc] || "";
};
