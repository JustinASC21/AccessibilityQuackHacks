"use client";

import { NycMap } from "@/components/nyc-map";
import { useSelectedLocation } from "@/components/selected-location-context";

export function HomeMapClient() {
  const { selectedLocation, setSelectedLocation } = useSelectedLocation();

  return <NycMap selectedLocation={selectedLocation} onLocationChange={setSelectedLocation} />;
}