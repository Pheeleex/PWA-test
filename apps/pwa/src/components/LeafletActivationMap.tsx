import { useEffect, useRef } from "react";
import L from "leaflet";
import {
  getZoneDistanceLabel,
  type ActivationZoneWithDistance,
  type LatLng,
} from "@promolocation/shared";

type LeafletActivationMapProps = {
  accuracy: number | null;
  currentLocation: LatLng | null;
  fitAllSignal: number;
  highlightedZoneId: string | null;
  recenterSignal: number;
  zones: ActivationZoneWithDistance[];
};

const DEFAULT_CENTER: LatLng = {
  latitude: 6.5244,
  longitude: 3.3792,
};

const MAP_PADDING = {
  paddingBottomRight: [88, 140] as [number, number],
  paddingTopLeft: [24, 140] as [number, number],
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function fitMapToZones(map: L.Map, points: [number, number][]) {
  map.fitBounds(L.latLngBounds(points), {
    ...MAP_PADDING,
  });
}

function getZoneColors(zone: ActivationZoneWithDistance, highlightedZoneId: string | null) {
  const isActive = zone.id === highlightedZoneId;
  const isRedZone = zone.type === "red";

  if (isRedZone) {
    return {
      fill: "rgba(239, 68, 68, 0.18)",
      stroke: "rgba(220, 38, 38, 0.92)",
      weight: isActive ? 3 : 2,
    };
  }

  return {
    fill: isActive ? "rgba(22, 163, 74, 0.2)" : "rgba(34, 197, 94, 0.1)",
    stroke: isActive ? "rgba(21, 128, 61, 0.96)" : "rgba(34, 197, 94, 0.72)",
    weight: isActive ? 3 : 2,
  };
}

export default function LeafletActivationMap({
  accuracy,
  currentLocation,
  fitAllSignal,
  highlightedZoneId,
  recenterSignal,
  zones,
}: LeafletActivationMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const hasFittedBounds = useRef(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = L.map(containerRef.current, {
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);
    map.setView([DEFAULT_CENTER.latitude, DEFAULT_CENTER.longitude], 11);

    layerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;

    if (!map || !layerGroup) {
      return;
    }

    layerGroup.clearLayers();

    zones.forEach((zone) => {
      const colors = getZoneColors(zone, highlightedZoneId);
      const isRedZone = zone.type === "red";

      L.circle([zone.center.latitude, zone.center.longitude], {
        color: colors.stroke,
        dashArray: isRedZone ? undefined : "8 5",
        fillColor: colors.fill,
        fillOpacity: 1,
        radius: zone.radius,
        weight: colors.weight,
      })
        .bindPopup(
          `<strong>${zone.name}</strong><br />${zone.isInside ? "Inside zone" : "Zone nearby"}`,
        )
        .addTo(layerGroup);

      L.circleMarker([zone.center.latitude, zone.center.longitude], {
        color: "#ffffff",
        fillColor: zone.type === "red" ? "#ef4444" : "#16a34a",
        fillOpacity: 1,
        radius: zone.id === highlightedZoneId ? 8 : 6,
        weight: 2,
      }).addTo(layerGroup);

      const labelText = isRedZone ? zone.name : getZoneDistanceLabel(zone);
      const labelClassName = [
        "zone-pill",
        isRedZone ? "zone-pill-red" : "zone-pill-green",
        zone.id === highlightedZoneId ? "zone-pill-active" : "",
      ]
        .filter(Boolean)
        .join(" ");

      L.marker([zone.center.latitude, zone.center.longitude], {
        icon: L.divIcon({
          className: "zone-pill-anchor",
          html: `<span class="${labelClassName}">${escapeHtml(labelText)}</span>`,
          iconAnchor: [56, 44],
        }),
        interactive: false,
        keyboard: false,
        zIndexOffset: 1000,
      }).addTo(layerGroup);
    });

    if (currentLocation) {
      if (accuracy && Number.isFinite(accuracy)) {
        L.circle([currentLocation.latitude, currentLocation.longitude], {
          color: "rgba(14, 165, 233, 0.25)",
          fillColor: "rgba(14, 165, 233, 0.08)",
          fillOpacity: 1,
          radius: Math.min(accuracy, 250),
          stroke: true,
          weight: 1,
        }).addTo(layerGroup);
      }

      L.circleMarker([currentLocation.latitude, currentLocation.longitude], {
        color: "#ffffff",
        fillColor: "#0ea5e9",
        fillOpacity: 1,
        radius: 9,
        weight: 3,
      })
        .bindPopup("Your current location")
        .addTo(layerGroup);
    }

    if (!hasFittedBounds.current) {
      const boundsPoints = [
        ...zones.map((zone) => [zone.center.latitude, zone.center.longitude] as [number, number]),
        ...(currentLocation
          ? [[currentLocation.latitude, currentLocation.longitude] as [number, number]]
          : []),
      ];

      if (boundsPoints.length > 1) {
        fitMapToZones(map, boundsPoints);
      } else if (currentLocation) {
        map.setView([currentLocation.latitude, currentLocation.longitude], 16);
      } else {
        map.setView([DEFAULT_CENTER.latitude, DEFAULT_CENTER.longitude], 11);
      }

      hasFittedBounds.current = true;
    }
  }, [accuracy, currentLocation, highlightedZoneId, zones]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || recenterSignal === 0) {
      return;
    }

    if (currentLocation) {
      map.flyTo([currentLocation.latitude, currentLocation.longitude], 16, {
        animate: true,
        duration: 1.2,
      });
      return;
    }

    if (zones.length > 0) {
      fitMapToZones(
        map,
        zones.map((zone) => [zone.center.latitude, zone.center.longitude] as [number, number]),
      );
    }
  }, [currentLocation, recenterSignal, zones]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || fitAllSignal === 0 || zones.length === 0) {
      return;
    }

    fitMapToZones(
      map,
      zones.map((zone) => [zone.center.latitude, zone.center.longitude] as [number, number]),
    );
  }, [fitAllSignal, zones]);

  return <div className="leaflet-map" ref={containerRef} />;
}
