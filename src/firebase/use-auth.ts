"use client";

import { useContext } from "react";
import { FirebaseContext, type FirebaseContextType } from "./firebase-provider";

export const useAuth = (): FirebaseContextType => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a FirebaseProvider");
  }
  return context;
};
