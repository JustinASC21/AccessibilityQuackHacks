"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SelectedLocation } from "@/components/selected-location-context";
import { createClient } from "@/lib/supabase/client";

const SCRIPT_ID = "google-maps-script";
const NYC_CENTER = { lat: 40.7128, lng: -74.006 };
const NEARBY_RADIUS_MILES = 5;
const RESTROOM_MARKER_COLOR = "#7dd3fc";

type RestroomRow = Record<string, unknown>;

type NycMapProps = {
  selectedLocation?: SelectedLocation | null;
  onLocationChange?: (location: SelectedLocation) => void;
};

export function NycMap({ selectedLocation, onLocationChange }: NycMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const restroomMarkersRef = useRef<google.maps.Marker[]>([]);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);

  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const getValueByKeys = useCallback((row: RestroomRow, keys: string[]) => {
    const normalizedKeys = keys.map((key) => key.trim().toLowerCase());

    for (const [rowKey, rowValue] of Object.entries(row)) {
      if (normalizedKeys.includes(rowKey.trim().toLowerCase())) {
        return rowValue;
      }
    }

    return null;
  }, []);

  const getNumericValue = useCallback((row: RestroomRow, keys: string[]) => {
    const value = getValueByKeys(row, keys);
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      const cleaned = value.trim().replace(/,/g, "");
      const parsed = Number(cleaned);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    return null;
  }, [getValueByKeys]);

  const getStringValue = useCallback((row: RestroomRow, keys: string[]) => {
    const value = getValueByKeys(row, keys);
    if (typeof value === "string" && value.trim()) {
      return value;
    }

    return null;
  }, [getValueByKeys]);

  const distanceInMiles = (a: SelectedLocation, b: SelectedLocation) => {
    const toRadians = (value: number) => (value * Math.PI) / 180;
    const earthRadiusMiles = 3958.8;
    const deltaLat = toRadians(b.lat - a.lat);
    const deltaLng = toRadians(b.lng - a.lng);
    const lat1 = toRadians(a.lat);
    const lat2 = toRadians(b.lat);

    const haversineValue =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

    const centralAngle = 2 * Math.atan2(Math.sqrt(haversineValue), Math.sqrt(1 - haversineValue));
    return earthRadiusMiles * centralAngle;
  };

  const clearRestroomMarkers = useCallback(() => {
    restroomMarkersRef.current.forEach((marker) => marker.setMap(null));
    restroomMarkersRef.current = [];
  }, []);

  const setMarkerAndCenter = useCallback((location: SelectedLocation, title: string, zoom: number) => {
    const map = mapRef.current;
    if (!map) return;

    map.setCenter({ lat: location.lat, lng: location.lng });
    map.setZoom(zoom);

    if (!userMarkerRef.current) {
      userMarkerRef.current = new window.google.maps.Marker({
        map,
        position: location,
        title,
      });
    } else {
      userMarkerRef.current.setPosition(location);
      userMarkerRef.current.setTitle(title);
    }
  }, []);

  const fetchNearbyRestrooms = useCallback(
    async (origin: SelectedLocation) => {
      const map = mapRef.current;
      if (!map) return;

      clearRestroomMarkers();

      const supabase = createClient();
      const { data, error } = await supabase.from("restrooms").select("*");

      if (error) {
        setStatus(`Could not load nearby restrooms: ${error.message}`);
        return;
      }

      const rows = (data ?? []) as RestroomRow[];
      const distances: number[] = [];

      const nearbyRestrooms = rows
        .map((row) => {
          const latitude = getNumericValue(row, ["Latitude", "latitude", "Latitute"]);
          const longitude = getNumericValue(row, ["Longitude", "longitude"]);

          if (latitude === null || longitude === null) {
            return null;
          }

          const position = { lat: latitude, lng: longitude };
          const distance = distanceInMiles(origin, position);
          distances.push(distance);
          if (distance > NEARBY_RADIUS_MILES) {
            return null;
          }

          const facilityName = getStringValue(row, ["Facility Name", "facility name", "facility_name", "name"]);
          const facilityStatus = getStringValue(row, ["Status"]);
          const facilityAccessibility = getStringValue(row, ["Accessibility"]);

          return {
            position,
            facilityName,
            facilityStatus,
            facilityAccessibility,
          };
        })
        .filter((restroom): restroom is NonNullable<typeof restroom> => restroom !== null);

      nearbyRestrooms.forEach((restroom) => {
        const marker = new window.google.maps.Marker({
          map,
          position: restroom.position,
          title: restroom.facilityName,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: RESTROOM_MARKER_COLOR,
            fillOpacity: 1,
            strokeColor: "#0f172a",
            strokeWeight: 1,
            scale: 15,
          },
        });

        if (restroom.facilityStatus || restroom.facilityAccessibility) {
          const details = [restroom.facilityStatus, restroom.facilityAccessibility]
            .filter(Boolean)
            .join(" • ");
          marker.setLabel({ text: "R", color: "#0f172a", fontWeight: "700" });
          marker.setTitle(`${restroom.facilityName}${details ? ` (${details})` : ""}`);
        }

        restroomMarkersRef.current.push(marker);
      });

      const nearestDistance = distances.length ? Math.min(...distances).toFixed(2) : null;

      setStatus(
        nearbyRestrooms.length
          ? `Found ${nearbyRestrooms.length} restrooms within ${NEARBY_RADIUS_MILES} miles.`
          : rows.length
            ? `Loaded ${rows.length} restrooms, but none within ${NEARBY_RADIUS_MILES} miles${nearestDistance ? ` (nearest: ${nearestDistance} miles)` : ""}.`
            : "Loaded 0 restrooms from Supabase.",
      );
    },
    [clearRestroomMarkers, getNumericValue, getStringValue],
  );

  const requestLocation = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!navigator.geolocation) {
      setStatus("Geolocation is not supported in this browser.");
      return;
    }

    setStatus("Requesting location access...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setMarkerAndCenter(userLocation, "Your Location", 18);
        onLocationChange?.({ ...userLocation, label: "Your Location" });
        setStatus("Showing your current location. Loading nearby restrooms...");
        setSearch("");
        void fetchNearbyRestrooms(userLocation);
      },
      () => {
        setStatus("Location permission denied. Showing NYC default.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  }, [fetchNearbyRestrooms, onLocationChange, setMarkerAndCenter]);

  useEffect(() => {
    if (!apiKey) {
      setStatus("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.");
      return;
    }

    const initializeMap = () => {
      if (!mapElementRef.current || !window.google?.maps || mapRef.current) {
        return;
      }

      mapRef.current = new window.google.maps.Map(mapElementRef.current, {
        center: NYC_CENTER,
        zoom: 11,
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeControl: false,
      });

      geocoderRef.current = new window.google.maps.Geocoder();
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      requestLocation();
    };

    if (window.google?.maps) {
      initializeMap();
      return;
    }

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", initializeMap);
      return () => {
        existingScript.removeEventListener("load", initializeMap);
      };
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", initializeMap);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", initializeMap);
    };
  }, [apiKey, requestLocation]);

  useEffect(() => {
    if (!selectedLocation || !mapRef.current) {
      return;
    }

    setMarkerAndCenter(selectedLocation, selectedLocation.label ?? "Selected Location", 14);
  }, [selectedLocation, setMarkerAndCenter]);

  const applySelectedLocation = (address: string) => {
    const geocoder = geocoderRef.current;
    const map = mapRef.current;

    if (!geocoder || !map || !address.trim()) {
      return;
    }

    geocoder.geocode({ address: address.trim() }, (results, geocodeStatus) => {
      if (
        geocodeStatus !== window.google.maps.GeocoderStatus.OK ||
        !results ||
        !results[0]?.geometry?.location
      ) {
        setStatus("Could not find that location.");
        return;
      }

      const location = results[0].geometry.location;
      const nextLocation = {
        lat: location.lat(),
        lng: location.lng(),
      };

      setMarkerAndCenter(nextLocation, "Selected Location", 14);
      onLocationChange?.({
        ...nextLocation,
        label: results[0].formatted_address,
      });

      setSearch(results[0].formatted_address);
      setStatus(`Showing: ${results[0].formatted_address}. Loading nearby restrooms...`);
      setSuggestions([]);
      void fetchNearbyRestrooms(nextLocation);
    });
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applySelectedLocation(search);
  };

  const updateSuggestions = (value: string) => {
    const autocompleteService = autocompleteServiceRef.current;
    if (!autocompleteService || !value.trim()) {
      setSuggestions([]);
      return;
    }

    autocompleteService.getPlacePredictions(
      {
        input: value,
        componentRestrictions: { country: "us" },
      },
      (predictions, predictionStatus) => {
        if (
          predictionStatus !== window.google.maps.places.PlacesServiceStatus.OK ||
          !predictions
        ) {
          setSuggestions([]);
          return;
        }

        setSuggestions(predictions.slice(0, 5));
      },
    );
  };

  return (
    <div className="relative h-screen w-full">
      <div ref={mapElementRef} className="h-full w-full" />

      <div className="pointer-events-none absolute left-0 right-0 top-14 z-10 p-4 md:p-6">
        <form
          onSubmit={handleSearch}
          className="pointer-events-auto mx-auto flex w-full max-w-2xl gap-2 rounded-md bg-background/95 p-2 shadow"
        >
          <Input
            value={search}
            onChange={(event) => {
              const value = event.target.value;
              setSearch(value);
              updateSuggestions(value);
            }}
            placeholder="Search a place"
            aria-label="Search a place"
          />
          <Button type="submit">Search</Button>
          <Button type="button" variant="outline" onClick={requestLocation}>
            Use My Location
          </Button>
        </form>

        {suggestions.length > 0 && (
          <div className="pointer-events-auto mx-auto mt-2 w-full max-w-2xl overflow-hidden rounded-md border bg-background shadow">
            {suggestions.map((prediction) => (
              <button
                key={prediction.place_id}
                type="button"
                onClick={() => applySelectedLocation(prediction.description)}
                className="block w-full border-b px-3 py-2 text-left text-sm hover:bg-accent last:border-b-0"
              >
                {prediction.description}
              </button>
            ))}
          </div>
        )}

        {status && (
          <div className="pointer-events-auto mx-auto mt-2 w-full max-w-2xl rounded-md bg-background/95 px-3 py-2 text-sm shadow">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}