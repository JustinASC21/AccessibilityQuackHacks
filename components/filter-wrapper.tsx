"use client";

import Filter from "@/components/filter";
import { useSelectedLocation } from "@/components/selected-location-context";

export default function FilterWrapper() {
  const { selectedFilters, setSelectedFilters } = useSelectedLocation();

  return (
    <Filter
      options={["Bathrooms", "Subway Stations", "Crosswalks"]}
      value={selectedFilters}
      onChange={setSelectedFilters}
    />
  );
}