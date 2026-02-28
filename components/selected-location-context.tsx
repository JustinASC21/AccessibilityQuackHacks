"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type SelectedLocation = {
  lat: number;
  lng: number;
  label?: string;
};

type SelectedLocationContextValue = {
  selectedLocation: SelectedLocation | null;
  setSelectedLocation: (location: SelectedLocation | null) => void;
};

const SelectedLocationContext = createContext<SelectedLocationContextValue | undefined>(undefined);

export function SelectedLocationProvider({ children }: { children: React.ReactNode }) {
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);

  const value = useMemo(
    () => ({
      selectedLocation,
      setSelectedLocation,
    }),
    [selectedLocation],
  );

  return <SelectedLocationContext.Provider value={value}>{children}</SelectedLocationContext.Provider>;
}

export function useSelectedLocation() {
  const context = useContext(SelectedLocationContext);

  if (!context) {
    throw new Error("useSelectedLocation must be used within a SelectedLocationProvider");
  }

  return context;
}