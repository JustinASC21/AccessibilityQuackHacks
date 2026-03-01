"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SelectedLocation } from "@/components/selected-location-context";
import { useSelectedLocation } from "@/components/selected-location-context";
import { createClient } from "@/lib/supabase/client";
import { LocationDetailPanel } from "@/components/location-detail-panel";
import FilterWrapper from "./filter-wrapper";

const SCRIPT_ID = "google-maps-script";
const NYC_CENTER = { lat: 40.7128, lng: -74.006 };
const DEFAULT_NEARBY_RADIUS_MILES = 5;



const PEDESTRIAN_SIGNALS_STORAGE_KEY = "pedestrian-signals-rows-v1";
const MAP_STYLES: google.maps.MapTypeStyle[] = [
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#75cff0" }]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#d0e0d0" }] 
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#ff9e67" }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "road.local",
    "elementType": "geometry",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "transit",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "administrative",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#444444" }]
  },
  {
    "featureType": "poi",
    "stylers": [{ "visibility": "off" }]
  }
];

type RestroomRow = Record<string, unknown>;
type PedestrianSignalRow = Record<string, unknown>;

type NearbyRestroom = {
  position: { lat: number; lng: number };
  facilityName: string;
  facilityStatus: string | null;
  facilityAccessibility: string | null;
};

type NearbyPedestrianSignal = {
  boroName: string | null;
  locationText: string;
  position: { lat: number; lng: number };
  distance: number;
};

type NycMapProps = {
  selectedLocation?: SelectedLocation | null;
  onLocationChange?: (location: SelectedLocation) => void;
};

type OpenPanel = {
  name: string;
  address: string;
  distance: number;
} | null;

export function NycMap({ selectedLocation, onLocationChange }: NycMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const restroomMarkersRef = useRef<google.maps.Marker[]>([]);
  const selectedRestroomMarkerRef = useRef<google.maps.Marker | null>(null);
  const pedestrianSignalMarkersRef = useRef<google.maps.Marker[]>([]);
  const selectedCrosswalkMarkerRef = useRef<google.maps.Marker | null>(null);
  const pedestrianSignalsCacheRef = useRef<PedestrianSignalRow[] | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);

  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [nearbyRestrooms, setNearbyRestrooms] = useState<NearbyRestroom[]>([]);
  const [nearbyPedestrianSignals, setNearbyPedestrianSignals] = useState<NearbyPedestrianSignal[]>([]);
  const [isRestroomListOpen, setIsRestroomListOpen] = useState(false);
  const [radiusMiles, setRadiusMiles] = useState(DEFAULT_NEARBY_RADIUS_MILES);

  // ── Panel state ──────────────────────────────────────────────────────────────
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);

  // ── Filters ─────────────────────────────────────────────────────────────────
  const { selectedFilters } = useSelectedLocation();
  const showBathrooms = selectedFilters.includes("Bathrooms");
  const showCrosswalks = selectedFilters.includes("Crosswalks");

  const getValueByKeys = useCallback((row: RestroomRow, keys: string[]) => {
    const normalizedKeys = keys.map((key) => key.trim().toLowerCase());
    for (const [rowKey, rowValue] of Object.entries(row)) {
      if (normalizedKeys.includes(rowKey.trim().toLowerCase())) return rowValue;
    }
    return null;
  }, []);

  const getNumericValue = useCallback(
    (row: RestroomRow, keys: string[]) => {
      const value = getValueByKeys(row, keys);
      if (typeof value === "number" && Number.isFinite(value)) return value;
      if (typeof value === "string") {
        const parsed = Number(value.trim().replace(/,/g, ""));
        if (Number.isFinite(parsed)) return parsed;
      }
      return null;
    },
    [getValueByKeys],
  );

  const getStringValue = useCallback(
    (row: RestroomRow, keys: string[]) => {
      const value = getValueByKeys(row, keys);
      if (typeof value === "string" && value.trim()) return value;
      return null;
    },
    [getValueByKeys],
  );

  const distanceInMiles = useCallback((a: SelectedLocation, b: SelectedLocation) => {
    const toRadians = (v: number) => (v * Math.PI) / 180;
    const R = 3958.8;
    const dLat = toRadians(b.lat - a.lat);
    const dLng = toRadians(b.lng - a.lng);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }, []);

  const clearRestroomMarkers = useCallback(() => {
    restroomMarkersRef.current.forEach((m) => m.setMap(null));
    restroomMarkersRef.current = [];
    selectedRestroomMarkerRef.current = null;
  }, []);

  const clearPedestrianSignalMarkers = useCallback(() => {
    pedestrianSignalMarkersRef.current.forEach((marker) => marker.setMap(null));
    pedestrianSignalMarkersRef.current = [];
    selectedCrosswalkMarkerRef.current = null;
  }, []);

  const persistPedestrianSignalsRows = useCallback((rows: PedestrianSignalRow[]) => {
    try {
      window.localStorage.setItem(PEDESTRIAN_SIGNALS_STORAGE_KEY, JSON.stringify(rows));
    } catch {
      // Ignore localStorage write failures
    }
  }, []);

  const setMarkerAndCenter = useCallback(
    (location: SelectedLocation, title: string, zoom: number) => {
      const map = mapRef.current;
      if (!map) return;
      map.setCenter({ lat: location.lat, lng: location.lng });
      map.setZoom(zoom);
      if (!userMarkerRef.current) {
        userMarkerRef.current = new window.google.maps.Marker({ map, position: location, title });
      } else {
        userMarkerRef.current.setPosition(location);
        userMarkerRef.current.setTitle(title);
      }
    },
    [],
  );

  const centerLocationOnLeftSide = useCallback((location: SelectedLocation) => {
    const map = mapRef.current;
    if (!map) return;

    const projection = map.getProjection();
    const center = map.getCenter();
    const mapDiv = map.getDiv();
    const zoom = map.getZoom();

    if (!projection || !center || typeof zoom !== "number") {
      map.panTo(location);
      return;
    }

    const locationPoint = projection.fromLatLngToPoint(
      new window.google.maps.LatLng(location.lat, location.lng),
    );
    const centerPoint = projection.fromLatLngToPoint(center);

    if (!locationPoint || !centerPoint) {
      map.panTo(location);
      return;
    }

    const desiredX = mapDiv.clientWidth * 0.28;
    const currentCenterX = mapDiv.clientWidth / 2;
    const deltaWorldX = (desiredX - currentCenterX) / 2 ** zoom;

    const nextCenterPoint = new window.google.maps.Point(
      locationPoint.x - deltaWorldX,
      locationPoint.y,
    );
    const nextCenter = projection.fromPointToLatLng(nextCenterPoint);
    if (!nextCenter) {
      map.panTo(location);
      return;
    }

    map.panTo(nextCenter);
  }, []);

  const fetchNearbyRestrooms = useCallback(
    async (origin: SelectedLocation) => {
      const map = mapRef.current;
      if (!map) return;

      clearRestroomMarkers();

      const supabase = createClient();
      const { data, error } = await supabase.from("restrooms").select("*");

      if (error) {
        setNearbyRestrooms([]);
        setIsRestroomListOpen(false);
        setStatus(`Could not load nearby restrooms: ${error.message}`);
        return;
      }

      const rows = (data ?? []) as RestroomRow[];
      const distances: number[] = [];

      const nearbyRestrooms = rows
        .map((row) => {
          const latitude = getNumericValue(row, ["Latitude", "latitude", "Latitute"]);
          const longitude = getNumericValue(row, ["Longitude", "longitude"]);
          if (latitude === null || longitude === null) return null;

          const position = { lat: latitude, lng: longitude };
          const distance = distanceInMiles(origin, position);
          distances.push(distance);
          if (distance > radiusMiles) return null;

          const facilityName = getStringValue(row, [
            "Facility Name",
            "facility name",
            "facility_name",
            "name",
          ]);
          const facilityStatus = getStringValue(row, ["Status"]);
          const facilityAccessibility = getStringValue(row, ["Accessibility"]);

          return {
            position,
            facilityName: facilityName ?? "Restroom",
            facilityStatus,
            facilityAccessibility,
            distance
          };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null);

      setNearbyRestrooms(nearbyRestrooms);
      setIsRestroomListOpen(false);

      const RESTROOM_ICON_DEFAULT: google.maps.Icon = {
        url: "/images/toilet.png",
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(14, 14),
      };
      const RESTROOM_ICON_SELECTED: google.maps.Icon = {
        url: "/images/toiletSelect.png",
        scaledSize: new google.maps.Size(48, 48), // bigger = highlighted
        anchor: new google.maps.Point(18, 18),
      };
      nearbyRestrooms.forEach((restroom) => {
        const marker = new window.google.maps.Marker({
          map,
          position: restroom.position,
          title: restroom.facilityName ?? undefined,
          icon: RESTROOM_ICON_DEFAULT
        });
        
        const details = [restroom.facilityStatus, restroom.facilityAccessibility]
        .filter(Boolean)
        .join(" • ");
        
        if (restroom.facilityStatus || restroom.facilityAccessibility) {
          marker.setLabel({ text: "R", color: "#0f172a", fontWeight: "700" });
          marker.setTitle(`${restroom.facilityName}${details ? ` (${details})` : ""}`);
        }
        
        // ── Open panel when a blue circle is clicked ─────────────────────────
        marker.addListener("click", () => {
          centerLocationOnLeftSide(restroom.position);

          if (selectedCrosswalkMarkerRef.current) {
            selectedCrosswalkMarkerRef.current.setIcon({
              url: "/images/crosswalk67.png",
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(14, 14),
            });
            selectedCrosswalkMarkerRef.current.setZIndex(1);
            selectedCrosswalkMarkerRef.current.setAnimation(null);
            selectedCrosswalkMarkerRef.current = null;
          }

          setOpenPanel({
            name: restroom.facilityName ?? "Public Restroom",
            address: details || "New York, NY",
            distance: restroom.distance
          });

           // reset previous selected marker
          if (selectedRestroomMarkerRef.current) {
            selectedRestroomMarkerRef.current.setIcon(RESTROOM_ICON_DEFAULT);
            selectedRestroomMarkerRef.current.setZIndex(1);
            selectedRestroomMarkerRef.current.setAnimation(null);
          }

          // set current marker as selected
          marker.setIcon(RESTROOM_ICON_SELECTED);
          marker.setZIndex(999);
          marker.setAnimation(window.google.maps.Animation.BOUNCE);

          // stop bounce after short pulse
          window.setTimeout(() => marker.setAnimation(null), 700);

          selectedRestroomMarkerRef.current = marker;
        });

        restroomMarkersRef.current.push(marker);
      });

      const nearestDistance = distances.length ? Math.min(...distances).toFixed(2) : null;
      setStatus(
        nearbyRestrooms.length
          ? `Found ${nearbyRestrooms.length} restrooms within ${radiusMiles} miles. Click to show/hide.`
          : rows.length
            ? `Loaded ${rows.length} restrooms, but none within ${radiusMiles} miles${nearestDistance ? ` (nearest: ${nearestDistance} miles)` : ""}.`
            : "Loaded 0 restrooms from Supabase.",
      );
    },
    [centerLocationOnLeftSide, clearRestroomMarkers, getNumericValue, getStringValue, radiusMiles],
  );

  useEffect(() => {
    try {
      const cachedRows = window.localStorage.getItem(PEDESTRIAN_SIGNALS_STORAGE_KEY);
      if (cachedRows) {
        const parsed = JSON.parse(cachedRows);
        if (Array.isArray(parsed)) {
          pedestrianSignalsCacheRef.current = parsed as PedestrianSignalRow[];
        }
      }
    } catch {
      pedestrianSignalsCacheRef.current = null;
    }
  }, []);

  const fetchNearbyPedestrianSignals = useCallback(
    async (origin: SelectedLocation) => {
      const map = mapRef.current;
      if (!map) return;

      clearPedestrianSignalMarkers();

      let rows = pedestrianSignalsCacheRef.current;

      if (!rows) {
        try {
          const cachedRows = window.localStorage.getItem(PEDESTRIAN_SIGNALS_STORAGE_KEY);
          if (cachedRows) {
            const parsed = JSON.parse(cachedRows);
            if (Array.isArray(parsed)) {
              rows = parsed as PedestrianSignalRow[];
              pedestrianSignalsCacheRef.current = rows;
            }
          }
        } catch {
          rows = null;
        }
      }

      if (!rows) {
        const supabase = createClient();
        const { data, error } = await supabase.from("pedestrian_signals").select("*");
        
        console.log(data);
        if (error) {
          setNearbyPedestrianSignals([]);
          setStatus(`Could not load pedestrian signals: ${error.message}`);
          return;
        }

        rows = (data ?? []) as PedestrianSignalRow[];
        pedestrianSignalsCacheRef.current = rows;
        persistPedestrianSignalsRows(rows);
      }

      const nearbySignals: NearbyPedestrianSignal[] = [];

      for (const row of rows) {
        const boroName = getStringValue(row, ["Borough", "borough", "BoroName", "boro_name", "boro"]);
        const locationText = getStringValue(row, ["Location", "location"]);
        if (!locationText) {
          continue;
        }

        const latFromRow = getNumericValue(row, ["Latitude", "latitude", "Latitute", "lat"]);
        const lngFromRow = getNumericValue(row, ["Longitude", "longitude", "lng", "lon"]);

        if (latFromRow === null || lngFromRow === null) {
          continue;
        }

        const position = { lat: latFromRow, lng: lngFromRow };

        const distance = distanceInMiles(origin, position);
        if (distance > radiusMiles) {
          continue;
        }

        nearbySignals.push({ boroName, locationText, position, distance});
      }

      setNearbyPedestrianSignals(nearbySignals);

      const CROSSWALK_ICON_DEFAULT: google.maps.Icon = {
        url: "/images/crosswalk67.png",
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(14, 14),
      };
      const CROSSWALK_ICON_SELECTED: google.maps.Icon = {
        url: "/images/crosswalk67Select.png",
        scaledSize: new google.maps.Size(48, 48), // bigger = highlighted
        anchor: new google.maps.Point(18, 18),
      };

      nearbySignals.forEach((signal) => {
        const marker = new window.google.maps.Marker({
          map,
          position: signal.position,
          title: signal.boroName
            ? `${signal.locationText} (${signal.boroName})`
            : signal.locationText,
          icon: CROSSWALK_ICON_DEFAULT
        });

        marker.addListener("click", () => {
          centerLocationOnLeftSide(signal.position);

          if (selectedRestroomMarkerRef.current) {
            selectedRestroomMarkerRef.current.setIcon({
              url: "/images/toilet.png",
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(14, 14),
            });
            selectedRestroomMarkerRef.current.setZIndex(1);
            selectedRestroomMarkerRef.current.setAnimation(null);
            selectedRestroomMarkerRef.current = null;
          }

          setOpenPanel({
            name: signal.locationText,
            address: "Accessible Pedestrian Signal",
            distance: signal.distance
          });
          // reset previous selected marker
          if (selectedCrosswalkMarkerRef.current) {
            selectedCrosswalkMarkerRef.current.setIcon(CROSSWALK_ICON_DEFAULT);
            selectedCrosswalkMarkerRef.current.setZIndex(1);
            selectedCrosswalkMarkerRef.current.setAnimation(null);
          }

          // set current marker as selected
          marker.setIcon(CROSSWALK_ICON_SELECTED);
          marker.setZIndex(999);
          marker.setAnimation(window.google.maps.Animation.BOUNCE);

          // stop bounce after short pulse
          window.setTimeout(() => marker.setAnimation(null), 700);

          selectedCrosswalkMarkerRef.current = marker;
        });

        pedestrianSignalMarkersRef.current.push(marker);
      });

      if (!showBathrooms) {
        setStatus(
          nearbySignals.length
            ? `Found ${nearbySignals.length} crosswalk signals within ${radiusMiles} miles.`
            : `No crosswalk signals found within ${radiusMiles} miles.`,
        );
      }
    },
    [
      centerLocationOnLeftSide,
      clearPedestrianSignalMarkers,
      distanceInMiles,
      getNumericValue,
      getStringValue,
      persistPedestrianSignalsRows,
      radiusMiles,
      showBathrooms,
    ],
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
        setStatus("Showing your current location.");
        setSearch("");
        if (showBathrooms) void fetchNearbyRestrooms(userLocation);
        if (showCrosswalks) void fetchNearbyPedestrianSignals(userLocation);
      },
      () => {
        const fallbackLocation = { lat: NYC_CENTER.lat, lng: NYC_CENTER.lng };
        setMarkerAndCenter(fallbackLocation, "NYC", 12);
        onLocationChange?.({ ...fallbackLocation, label: "New York, NY" });
        setSearch("New York, NY");
        setStatus("Location permission denied. Showing NYC default.");
        if (showBathrooms) void fetchNearbyRestrooms(fallbackLocation);
        if (showCrosswalks) void fetchNearbyPedestrianSignals(fallbackLocation);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [
    fetchNearbyPedestrianSignals,
    fetchNearbyRestrooms,
    onLocationChange,
    setMarkerAndCenter,
    showBathrooms,
    showCrosswalks,
  ]);

  useEffect(() => {
    if (!mapRef.current) return;
    const position = userMarkerRef.current?.getPosition();
    const origin =
      position
        ? { lat: position.lat(), lng: position.lng() }
        : selectedLocation ?? { lat: NYC_CENTER.lat, lng: NYC_CENTER.lng };

    if (showBathrooms) {
      if (origin) {
        void fetchNearbyRestrooms(origin);
      }
    } else {
      clearRestroomMarkers();
      setNearbyRestrooms([]);
      setIsRestroomListOpen(false);
    }

    if (showCrosswalks) {
      if (origin) {
        void fetchNearbyPedestrianSignals(origin);
      }
    } else {
      clearPedestrianSignalMarkers();
      setNearbyPedestrianSignals([]);
    }

    if (!showBathrooms && !showCrosswalks) {
      setStatus(null);
    }
  }, [
    clearRestroomMarkers,
    clearPedestrianSignalMarkers,
    fetchNearbyPedestrianSignals,
    fetchNearbyRestrooms,
    selectedLocation,
    showBathrooms,
    showCrosswalks,
  ]);

  useEffect(() => {
    if (!apiKey) {
      setStatus("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.");
      return;
    }

    const initializeMap = () => {
      if (!mapElementRef.current || !window.google?.maps || mapRef.current) return;

      mapRef.current = new window.google.maps.Map(mapElementRef.current, {
        center: NYC_CENTER,
        zoom: 11,
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        styles: MAP_STYLES,
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
      return () => existingScript.removeEventListener("load", initializeMap);
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", initializeMap);
    document.head.appendChild(script);
    return () => script.removeEventListener("load", initializeMap);
  }, [apiKey, requestLocation]);

  useEffect(() => {
    if (!selectedLocation || !mapRef.current) return;
    setMarkerAndCenter(selectedLocation, selectedLocation.label ?? "Selected Location", 14);
  }, [selectedLocation, setMarkerAndCenter]);

  const applySelectedLocation = (address: string) => {
    const geocoder = geocoderRef.current;
    const map = mapRef.current;
    if (!geocoder || !map || !address.trim()) return;

    geocoder.geocode({ address: address.trim() }, (results, geocodeStatus) => {
      if (
        geocodeStatus !== window.google.maps.GeocoderStatus.OK ||
        !results?.[0]?.geometry?.location
      ) {
        setStatus("Could not find that location.");
        return;
      }

      const location = results[0].geometry.location;
      const nextLocation = { lat: location.lat(), lng: location.lng() };
      setMarkerAndCenter(nextLocation, "Selected Location", 14);
      onLocationChange?.({ ...nextLocation, label: results[0].formatted_address });
      setSearch(results[0].formatted_address);
      setSuggestions([]);
      if (showBathrooms) {
        setStatus(`Showing: ${results[0].formatted_address}. Loading nearby restrooms...`);
        void fetchNearbyRestrooms(nextLocation);
      } else {
        setStatus(`Showing: ${results[0].formatted_address}.`);
      }

      if (showCrosswalks) {
        void fetchNearbyPedestrianSignals(nextLocation);
      }
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
      { input: value, componentRestrictions: { country: "us" } },
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

      {/* Search bar */}
      <div className="pointer-events-none w-[50em] absolute left-0 right-0 top-14 z-10 p-4 md:p-6">
        <form
          onSubmit={handleSearch}
          className="pointer-events-auto mr-auto flex w-full flex-col gap-2 rounded-md bg-background/95 p-2 shadow"
        >
          <div className="flex w-full gap-2 sm:flex-col md:flex-row">
            <Input
              value={search}
              onChange={(event) => {
                const value = event.target.value;
                setSearch(value);
                updateSuggestions(value);
              }}
              placeholder="Search a place"
              aria-label="Search a place"
              className="text-md"
            />
            <Button type="submit" className = "text-lg">Search</Button>
            <Button type="button" className = "text-lg" variant="outline" onClick={requestLocation}>
              Use My Location
            </Button>
            <div className="flex-shrink-0">
              <FilterWrapper />
            </div>
          </div>

          <div className="flex w-full items-center gap-2 rounded-md border bg-background px-3 py-2">
            <label htmlFor="radius-miles" className="text-lg whitespace-nowrap">
              Radius: {radiusMiles} mi
            </label>
            <input
              id="radius-miles"
              type="range"
              min={1}
              max={10}
              step={1}
              value={radiusMiles}
              onChange={(event) => setRadiusMiles(Number(event.target.value))}
              className="w-full"
            />
          </div>
        </form>

        {suggestions.length > 0 && (
          <div className="pointer-events-auto mr-auto mt-2 w-full max-w-3xl overflow-hidden rounded-md border bg-background shadow">
            {suggestions.map((prediction) => (
              <button
                key={prediction.place_id}
                type="button"
                onClick={() => applySelectedLocation(prediction.description)}
                className="block w-full border-b px-3 py-2 text-left text-md hover:bg-accent last:border-b-0"
              >
                {prediction.description}
              </button>
            ))}
          </div>
        )}

        {status && (
          <button
            type="button"
            onClick={() => {
              if (nearbyRestrooms.length > 0) {
                setIsRestroomListOpen((previous) => !previous);
              }
            }}
            className="pointer-events-auto mr-auto mt-2 block w-full max-w-3xl rounded-md bg-background/95 px-3 py-2 text-left text-md shadow"
          >
            {status}
          </button>
        )}

        {isRestroomListOpen && nearbyRestrooms.length > 0 && (
          <div className="pointer-events-auto mr-auto mt-2 max-h-64 w-full max-w-3xl overflow-y-auto rounded-md bg-background/95 p-3 text-sm shadow">
            <ul className="space-y-2">
              {nearbyRestrooms.map((restroom, index) => (
                <li key={`${restroom.facilityName}-${index}`} className="rounded text-lg border px-3 py-2">
                  <p className="font-medium">{restroom.facilityName}</p>
                  <p>Status: {restroom.facilityStatus ?? "Unknown"}</p>
                  <p>Accessibility: {restroom.facilityAccessibility ?? "Unknown"}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Location detail panel — bottom right, opens on blue circle click */}
      {openPanel && (
        <LocationDetailPanel
          locationName={openPanel.name}
          address={openPanel.address}
          distance={openPanel.distance}
          onClose={() => setOpenPanel(null)}
        />
      )}
    </div>
  );
}