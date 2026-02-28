"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SCRIPT_ID = "google-maps-script";
const NYC_CENTER = { lat: 40.7128, lng: -74.006 };

export function NycMap() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const searchMarkerRef = useRef<google.maps.Marker | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>(null);

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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", initializeMap);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", initializeMap);
    };
  }, [apiKey]);

  const requestLocation = () => {
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

        if (!userMarkerRef.current) {
          userMarkerRef.current = new window.google.maps.Marker({
            map,
            position: userLocation,
            title: "Your Location",
          });
        } else {
          userMarkerRef.current.setPosition(userLocation);
        }

        map.setCenter(userLocation);
        map.setZoom(13);
        setStatus("Showing your current location.");
      },
      () => {
        setStatus("Location permission denied. Showing NYC default.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const geocoder = geocoderRef.current;
    const map = mapRef.current;

    if (!geocoder || !map || !search.trim()) {
      return;
    }

    geocoder.geocode({ address: search.trim() }, (results, geocodeStatus) => {
      if (
        geocodeStatus !== window.google.maps.GeocoderStatus.OK ||
        !results ||
        !results[0]?.geometry?.location
      ) {
        setStatus("Could not find that location.");
        return;
      }

      const location = results[0].geometry.location;
      map.setCenter(location);
      map.setZoom(14);

      if (!searchMarkerRef.current) {
        searchMarkerRef.current = new window.google.maps.Marker({
          map,
          position: location,
          title: results[0].formatted_address,
        });
      } else {
        searchMarkerRef.current.setPosition(location);
        searchMarkerRef.current.setTitle(results[0].formatted_address);
      }

      setStatus(`Showing: ${results[0].formatted_address}`);
    });
  };

  return (
    <div className="relative h-screen w-full">
      <div ref={mapElementRef} className="h-full w-full" />

      <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 p-4 md:p-6">
        <form
          onSubmit={handleSearch}
          className="pointer-events-auto mx-auto flex w-full max-w-2xl gap-2 rounded-md bg-background/95 p-2 shadow"
        >
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search a place"
            aria-label="Search a place"
          />
          <Button type="submit">Search</Button>
          <Button type="button" variant="outline" onClick={requestLocation}>
            Use My Location
          </Button>
        </form>

        {status && (
          <div className="pointer-events-auto mx-auto mt-2 w-full max-w-2xl rounded-md bg-background/95 px-3 py-2 text-sm shadow">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}