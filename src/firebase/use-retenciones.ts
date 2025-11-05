"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "./config";
import type { RetentionRecord } from "@/lib/types";

export function useRetenciones(userId: string | null) {
  const [retenciones, setRetenciones] = useState<RetentionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const retencionesPath = `users/${userId}/retenciones`;
    const q = query(
      collection(db, retencionesPath),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const data: RetentionRecord[] = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as RetentionRecord);
        });
        setRetenciones(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching retenciones:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { retenciones, loading, error };
}
