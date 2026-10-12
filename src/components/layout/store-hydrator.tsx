"use client";

import * as React from "react";

import { connectDemoPersistence } from '@/lib/services/demo-persistence';
import { toast } from '@/components/ui/toast';
import { useHuntStore } from "@/store/hunt-store";

/**
 * Rehydrates persisted state after mount, then flips `hydrated`.
 * Screens that render persisted records wait for `hydrated` so the server
 * markup and the first client paint always match.
 */
export function StoreHydrator() {
  React.useEffect(() => {
    const unsubscribe = useHuntStore.persist.onFinishHydration(() => {
      useHuntStore.setState({ hydrated: true });
    });

    void Promise.resolve(useHuntStore.persist.rehydrate()).then(() => connectDemoPersistence()).catch(error => {
      toast({title:'Demo database persistence unavailable',description:error instanceof Error ? error.message : 'Check server storage.',tone:'error'});
    });

    // Safety net: if there is nothing persisted, still release the gate.
    const timer = setTimeout(() => {
      if (!useHuntStore.getState().hydrated) {
        useHuntStore.setState({ hydrated: true });
      }
    }, 400);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  return null;
}

export function useHydrated(): boolean {
  return useHuntStore((state) => state.hydrated);
}
