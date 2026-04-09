import type { ApiLocation } from "./api-types";

export type LatLng = {
  latitude: number;
  longitude: number;
};

export type ActivationZone = {
  id: string;
  name: string;
  center: LatLng;
  radius: number;
  type: string;
};

export type ActivationZoneWithDistance = ActivationZone & {
  centerDistance: number | null;
  distanceToZone: number | null;
  isInside: boolean;
};

export function haversineDistanceInMeters(point1: LatLng, point2: LatLng) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);
  const lat1 = toRad(point1.latitude);
  const lat2 = toRad(point2.latitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

export function formatDistance(distanceInMeters: number) {
  if (distanceInMeters >= 1000) {
    const rounded =
      distanceInMeters >= 10000
        ? Math.round(distanceInMeters / 1000)
        : Math.round(distanceInMeters / 100) / 10;
    return `${rounded}km`;
  }

  return `${Math.round(distanceInMeters)}m`;
}

export function getHeadingDirection(from: LatLng, to: LatLng) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const toDeg = (value: number) => (value * 180) / Math.PI;
  const lat1 = toRad(from.latitude);
  const lat2 = toRad(to.latitude);
  const dLon = toRad(to.longitude - from.longitude);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const bearing = (toDeg(Math.atan2(y, x)) + 360) % 360;
  const directions = [
    "north",
    "north-east",
    "east",
    "south-east",
    "south",
    "south-west",
    "west",
    "north-west",
  ];

  return directions[Math.round(bearing / 45) % directions.length];
}

export function getZoneDistanceLabel(zone: ActivationZoneWithDistance) {
  if (zone.distanceToZone === null) {
    return "Locating...";
  }

  if (zone.isInside) {
    return "Inside zone";
  }

  return `${formatDistance(zone.distanceToZone)} away`;
}

export function mapLocationsToActivationZones(
  locations: ApiLocation[],
): ActivationZone[] {
  return locations.map((location, index) => ({
    id: String(location.id ?? location.location_id ?? `zone-${index}`),
    name: location.name ?? location.location_name ?? "Unknown Location",
    center: {
      latitude: Number(location.latitude) || 0,
      longitude: Number(location.longitude) || 0,
    },
    radius: Number(location.radius) || 50,
    type: location.type || "green",
  }));
}

export function decorateZonesWithDistance(
  zones: ActivationZone[],
  currentLocation: LatLng | null,
): ActivationZoneWithDistance[] {
  return zones.map((zone) => {
    if (!currentLocation) {
      return {
        ...zone,
        centerDistance: null,
        distanceToZone: null,
        isInside: false,
      };
    }

    const centerDistance = haversineDistanceInMeters(
      currentLocation,
      zone.center,
    );
    const distanceToZone = Math.max(0, centerDistance - zone.radius);

    return {
      ...zone,
      centerDistance,
      distanceToZone,
      isInside: centerDistance <= zone.radius,
    };
  });
}

export function getNearestZone(
  zones: ActivationZoneWithDistance[],
  type?: string,
) {
  const filteredZones = type ? zones.filter((zone) => zone.type === type) : zones;

  if (!filteredZones.length) {
    return null;
  }

  return filteredZones.reduce<ActivationZoneWithDistance | null>((closest, zone) => {
    if (zone.distanceToZone === null) {
      return closest;
    }

    if (!closest || closest.distanceToZone === null) {
      return zone;
    }

    return zone.distanceToZone < closest.distanceToZone ? zone : closest;
  }, null);
}
