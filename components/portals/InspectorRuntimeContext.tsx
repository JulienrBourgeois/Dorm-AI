"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Ctx = {
  executionActive: boolean;
  setExecutionActive: (v: boolean) => void;
};

const Ctx = createContext<Ctx | null>(null);

export function InspectorRuntimeProvider({ children }: { children: ReactNode }) {
  const [executionActive, setExecutionActiveState] = useState(false);
  const setExecutionActive = useCallback((v: boolean) => {
    setExecutionActiveState(v);
  }, []);
  const value = useMemo(
    () => ({ executionActive, setExecutionActive }),
    [executionActive, setExecutionActive],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useInspectorExecutionActive(): boolean {
  return useContext(Ctx)?.executionActive ?? false;
}

export function useSetInspectorExecutionActive() {
  return useContext(Ctx)?.setExecutionActive;
}
