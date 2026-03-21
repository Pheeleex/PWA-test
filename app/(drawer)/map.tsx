import {
  ActivityIndicator,
  Alert,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MapView, { Circle, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import ScreenHeader from '@/components/ScreenHeader';
import { Colors } from '@/constants/theme';

type LatLng = {
  latitude: number;
  longitude: number;
};

type ActivationZone = {
  id: string;
  name: string;
  center: LatLng;
  radius: number;
};

type ActivationZoneWithDistance = ActivationZone & {
  centerDistance: number | null;
  distanceToZone: number | null;
  isInside: boolean;
};

type ScreenPoint = {
  x: number;
  y: number;
};

type ZoneLabelPosition = {
  left: number;
  top: number;
};

const LOCATION_UPDATE_INTERVAL_MS = 1000;
const LOCATION_UPDATE_DISTANCE_METERS = 1;
const GPS_ACCURACY_THRESHOLD = 30;
const LABEL_WIDTH = 112;
const LABEL_HEIGHT = 34;
const LABEL_VERTICAL_OFFSET = 54;

const ACTIVATION_ZONES: ActivationZone[] = [
  {
    id: 'titilayo-1',
    name: 'Titilayo Test Point 1',
    center: { latitude: 6.632139865614449, longitude: 3.3620775269210394 },
    radius: 25,
  },
  {
    id: 'titilayo-2',
    name: 'Titilayo Test Point 2',
    center: { latitude: 6.636118032464394, longitude: 3.3592141602207057 },
    radius: 25,
  },
  {
    id: 'titilayo-3',
    name: 'Titilayo Test Point 3',
    center: { latitude: 6.6375, longitude: 3.35555 },
    radius: 25,
  },
];

function haversineDistanceInMeters(point1: LatLng, point2: LatLng) {
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

function formatDistance(distanceInMeters: number) {
  if (distanceInMeters >= 1000) {
    const rounded =
      distanceInMeters >= 10000
        ? Math.round(distanceInMeters / 1000)
        : Math.round(distanceInMeters / 100) / 10;
    return `${rounded}km`;
  }
  return `${Math.round(distanceInMeters)}m`;
}

function getHeadingDirection(from: LatLng, to: LatLng) {
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
    'north',
    'north-east',
    'east',
    'south-east',
    'south',
    'south-west',
    'west',
    'north-west',
  ];
  return directions[Math.round(bearing / 45) % directions.length];
}

function getZoneDistanceLabel(zone: ActivationZoneWithDistance) {
  if (zone.distanceToZone === null) return 'Locating...';
  if (zone.isInside) return 'Inside zone';
  return `${formatDistance(zone.distanceToZone)} away`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function MapScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const mapRef = useRef<MapView | null>(null);
  const hasAnimated = useRef(false);
  const updatePositionsRequestRef = useRef(0);

  const [location, setLocation] = useState<LatLng | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [zoneLabelPositions, setZoneLabelPositions] = useState<
    Record<string, ZoneLabelPosition>
  >({});

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const getUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setPermissionDenied(true);
          setLoading(false);
          return;
        }

        const currentPosition = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const currentCoords = {
          latitude: currentPosition.coords.latitude,
          longitude: currentPosition.coords.longitude,
        };

        setLocation(currentCoords);
        setLocationAccuracy(currentPosition.coords.accuracy ?? null);

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: LOCATION_UPDATE_INTERVAL_MS,
            distanceInterval: LOCATION_UPDATE_DISTANCE_METERS,
          },
          (updatedPosition) => {
            const updatedCoords = {
              latitude: updatedPosition.coords.latitude,
              longitude: updatedPosition.coords.longitude,
            };

            setLocation(updatedCoords);
            setLocationAccuracy(updatedPosition.coords.accuracy ?? null);

            if (!hasAnimated.current && mapRef.current) {
              hasAnimated.current = true;
              mapRef.current.animateToRegion(
                {
                  latitude: updatedCoords.latitude,
                  longitude: updatedCoords.longitude,
                  latitudeDelta: 0.003,
                  longitudeDelta: 0.003,
                },
                1000
              );
            }
          }
        );
      } catch (error) {
        console.error('Error getting location:', error);
        Alert.alert('Location Error', 'Could not get your current location.');
      } finally {
        setLoading(false);
      }
    };

    getUserLocation();
    return () => {
      subscription?.remove();
    };
  }, []);

  const activationZonesWithDistance = useMemo<ActivationZoneWithDistance[]>(() => {
    return ACTIVATION_ZONES.map((zone) => {
      const centerDistance = location
        ? haversineDistanceInMeters(location, zone.center)
        : null;
      const isInside = centerDistance !== null && centerDistance <= zone.radius;
      return {
        ...zone,
        centerDistance,
        distanceToZone:
          centerDistance === null ? null : Math.max(0, centerDistance - zone.radius),
        isInside,
      };
    });
  }, [location]);

  const activeZone = useMemo(() => {
    const inside = activationZonesWithDistance.filter((zone) => zone.isInside);
    if (inside.length === 0) return null;
    return inside.reduce((best, zone) =>
      (zone.centerDistance ?? Infinity) < (best.centerDistance ?? Infinity)
        ? zone
        : best
    );
  }, [activationZonesWithDistance]);

  const nearestZoneInfo = useMemo(() => {
    if (!location) return null;

    return activationZonesWithDistance.reduce((nearest, zone) => {
      const distance = zone.distanceToZone ?? Infinity;
      const nearestDistance = nearest.distanceToZone ?? Infinity;

      if (distance < nearestDistance) {
        return zone;
      }

      if (
        distance === nearestDistance &&
        (zone.centerDistance ?? Infinity) < (nearest.centerDistance ?? Infinity)
      ) {
        return zone;
      }

      return nearest;
    });
  }, [activationZonesWithDistance, location]);

  const nearestZoneHeading = useMemo(() => {
    if (!location || !nearestZoneInfo) return null;
    return getHeadingDirection(location, nearestZoneInfo.center);
  }, [location, nearestZoneInfo]);

  const isGpsReliable = locationAccuracy !== null && locationAccuracy <= GPS_ACCURACY_THRESHOLD;
  const isInsideZone = !!activeZone && isGpsReliable;

  const statusDotColor = isInsideZone
    ? '#16A34A'
    : activeZone && !isGpsReliable
    ? '#F59E0B'
    : '#EF4444';

  const statusTitle = isInsideZone
    ? 'Inside activation zone'
    : activeZone && !isGpsReliable
    ? 'GPS signal too weak'
    : 'Outside activation zone';

  const initialRegion: Region = {
    latitude: 6.63762,
    longitude: 3.35571,
    latitudeDelta: 0.003,
    longitudeDelta: 0.003,
  };

  const updateZoneLabelPositions = useCallback(async () => {
    if (!mapReady || !mapRef.current || mapSize.width === 0 || mapSize.height === 0) {
      return;
    }

    const requestId = updatePositionsRequestRef.current + 1;
    updatePositionsRequestRef.current = requestId;

    try {
      const points = await Promise.all(
        ACTIVATION_ZONES.map(async (zone) => ({
          id: zone.id,
          point: (await mapRef.current?.pointForCoordinate(zone.center)) as ScreenPoint | undefined,
        }))
      );

      if (updatePositionsRequestRef.current !== requestId) {
        return;
      }

      const nextPositions: Record<string, ZoneLabelPosition> = {};

      for (const entry of points) {
        if (!entry.point) {
          continue;
        }

        const left = clamp(
          entry.point.x - LABEL_WIDTH / 2,
          8,
          Math.max(8, mapSize.width - LABEL_WIDTH - 8)
        );

        const top = clamp(
          entry.point.y - LABEL_VERTICAL_OFFSET,
          8,
          Math.max(8, mapSize.height - LABEL_HEIGHT - 8)
        );

        nextPositions[entry.id] = { left, top };
      }

      setZoneLabelPositions(nextPositions);
    } catch (error) {
      console.error('Error updating zone label positions:', error);
    }
  }, [mapReady, mapSize.height, mapSize.width]);

  useEffect(() => {
    if (!mapReady || mapSize.width === 0 || mapSize.height === 0) {
      return;
    }

    void updateZoneLabelPositions();
  }, [activationZonesWithDistance.length, mapReady, mapSize, updateZoneLabelPositions]);

  const handleMapLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setMapSize({ width, height });
  };

  const handleMapReady = () => {
    setMapReady(true);
    void updateZoneLabelPositions();
  };

  const centerOnUser = () => {
    if (!location || !mapRef.current) return;
    mapRef.current.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      },
      1000
    );
  };

  const showAllZones = () => {
    if (!mapRef.current) return;
    mapRef.current.fitToCoordinates(
      ACTIVATION_ZONES.map((zone) => zone.center),
      {
        edgePadding: { top: 160, right: 60, bottom: 160, left: 60 },
        animated: true,
      }
    );
  };

  const handleOpenQr = () => {
    if (!location) {
      Alert.alert('Location not ready', 'Please wait for your location to load.');
      return;
    }

    if (!activeZone) {
      Alert.alert(
        'QR Locked',
        'You must be inside an activation zone before the QR code can be shown.'
      );
      return;
    }

    if (!isGpsReliable) {
      Alert.alert(
        'GPS Signal Weak',
        `Your GPS accuracy is currently ±${Math.round(locationAccuracy ?? 0)}m. Move to an open area to improve signal.`
      );
      return;
    }

    router.push('/(drawer)/qr-code');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScreenHeader title="Activation map" withSafeArea={false} />

      <View style={styles.content}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#0E2B63" />
            <Text style={[styles.infoText, { color: theme.text }]}>
              Loading your location...
            </Text>
          </View>
        ) : permissionDenied ? (
          <View style={styles.centered}>
            <Text style={[styles.infoText, { color: theme.text, textAlign: 'center' }]}>
              Location permission is required to use activation zones.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.mapWrap} onLayout={handleMapLayout}>
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation={true}
                showsMyLocationButton={false}
                onMapReady={handleMapReady}
                onRegionChangeComplete={() => {
                  void updateZoneLabelPositions();
                }}
                onLongPress={(event) => {
                  console.log('Long press:', event.nativeEvent.coordinate);
                }}
              >
                {activationZonesWithDistance.map((zone) => {
                  const isActive = activeZone?.id === zone.id;

                  return (
                    <Circle
                      key={zone.id}
                      center={zone.center}
                      radius={zone.radius}
                      strokeWidth={isActive ? 3 : 2}
                      lineDashPattern={[8, 5]}
                      strokeColor={
                        isActive
                          ? 'rgba(22,163,74,0.95)'
                          : 'rgba(22,163,74,0.6)'
                      }
                      fillColor={
                        isActive
                          ? 'rgba(22,163,74,0.14)'
                          : 'rgba(22,163,74,0.07)'
                      }
                    />
                  );
                })}

                {activationZonesWithDistance.map((zone) => {
                  const isActive = activeZone?.id === zone.id;

                  return (
                    <Circle
                      key={`${zone.id}-halo`}
                      center={zone.center}
                      radius={7}
                      strokeWidth={0}
                      fillColor={
                        isActive
                          ? 'rgba(22,163,74,0.28)'
                          : 'rgba(22,163,74,0.18)'
                      }
                    />
                  );
                })}

                {activationZonesWithDistance.map((zone) => {
                  const isActive = activeZone?.id === zone.id;

                  return (
                    <Circle
                      key={`${zone.id}-dot`}
                      center={zone.center}
                      radius={3}
                      strokeWidth={2}
                      strokeColor="#FFFFFF"
                      fillColor={isActive ? '#15803D' : '#16A34A'}
                    />
                  );
                })}
              </MapView>

              <View pointerEvents="none" style={styles.zoneLabelOverlay}>
                {activationZonesWithDistance.map((zone) => {
                  const position = zoneLabelPositions[zone.id];

                  if (!position) {
                    return null;
                  }

                  const isActive = activeZone?.id === zone.id;

                  return (
                    <View
                      key={`${zone.id}-label`}
                      style={[
                        styles.zoneLabelWrap,
                        {
                          left: position.left,
                          top: position.top,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.zoneDistancePill,
                          isActive && styles.zoneDistancePillActive,
                        ]}
                      >
                        <Text style={styles.zoneDistancePillText}>
                          {getZoneDistanceLabel(zone)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.topOverlay}>
              <View style={styles.statusRow}>
                <View style={styles.statusTitleGroup}>
                  <View
                    style={[styles.statusDot, { backgroundColor: statusDotColor }]}
                  />
                  <Text style={styles.statusTitle}>{statusTitle}</Text>
                </View>
                {locationAccuracy !== null && (
                  <View
                    style={[styles.gpsChip, !isGpsReliable && styles.gpsChipWeak]}
                  >
                    <Text
                      style={[
                        styles.gpsChipText,
                        !isGpsReliable && styles.gpsChipTextWeak,
                      ]}
                    >
                      GPS ±{Math.round(locationAccuracy)}m
                    </Text>
                  </View>
                )}
              </View>

              {isInsideZone && activeZone ? (
                <Text style={styles.statusMessage}>
                  {'You are in '}
                  <Text style={styles.statusStrong}>{activeZone.name}</Text>
                  {'. '}
                  <Text style={styles.statusGreen}>QR unlocked.</Text>
                </Text>
              ) : activeZone && !isGpsReliable ? (
                <Text style={styles.statusMessage}>
                  {'Inside '}
                  <Text style={styles.statusStrong}>{activeZone.name}</Text>
                  {' but '}
                  <Text style={styles.statusAmber}>GPS needs a cleaner fix.</Text>
                  {' Move to open space.'}
                </Text>
              ) : nearestZoneInfo ? (
                <Text style={styles.statusMessage}>
                  {'Nearest: '}
                  <Text style={styles.statusStrong}>{nearestZoneInfo.name}</Text>
                  {' — '}
                  <Text style={styles.statusGreen}>
                    {getZoneDistanceLabel(nearestZoneInfo)}
                  </Text>
                  {nearestZoneHeading ? `. Head ${nearestZoneHeading}.` : '.'}
                </Text>
              ) : (
                <Text style={styles.statusMessage}>
                  Finding nearby activation zones...
                </Text>
              )}
            </View>

            <View style={styles.actionCol}>
              <TouchableOpacity style={styles.mapBtn} onPress={centerOnUser}>
                <Text style={styles.mapBtnText}>Center on me</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mapBtn} onPress={showAllZones}>
                <Text style={styles.mapBtnText}>All zones</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.qrButton, !isInsideZone && styles.qrButtonDisabled]}
              onPress={handleOpenQr}
              disabled={!isInsideZone}
              activeOpacity={0.85}
            >
              <Text style={styles.qrButtonText}>
                {isInsideZone ? 'Activation QR code' : 'QR locked — enter a zone'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, position: 'relative' },
  mapWrap: { flex: 1 },
  map: { flex: 1 },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  infoText: { marginTop: 12, fontSize: 16 },

  zoneLabelOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  zoneLabelWrap: {
    position: 'absolute',
    width: LABEL_WIDTH,
    height: LABEL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneDistancePill: {
    minWidth: 96,
    maxWidth: LABEL_WIDTH,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#16A34A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  zoneDistancePillActive: { backgroundColor: '#15803D' },
  zoneDistancePillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },

  topOverlay: {
    position: 'absolute',
    top: 16,
    left: 14,
    right: 14,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusTitleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDot: { width: 14, height: 14, borderRadius: 999 },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0E2B63',
    flexShrink: 1,
  },
  gpsChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    marginLeft: 8,
  },
  gpsChipWeak: { backgroundColor: '#FEF3C7' },
  gpsChipText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  gpsChipTextWeak: { color: '#B45309' },
  statusMessage: { fontSize: 13, lineHeight: 20, color: '#4B5563' },
  statusStrong: { fontWeight: '700', color: '#1E293B' },
  statusGreen: { fontWeight: '700', color: '#16A34A' },
  statusAmber: { fontWeight: '700', color: '#B45309' },

  actionCol: {
    position: 'absolute',
    right: 14,
    bottom: 110,
    gap: 10,
  },
  mapBtn: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  mapBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0E2B63',
    textAlign: 'center',
  },

  qrButton: {
    position: 'absolute',
    bottom: 36,
    left: 16,
    right: 16,
    backgroundColor: '#0E2B63',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#0E2B63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  qrButtonDisabled: { backgroundColor: '#94A3B8', shadowOpacity: 0 },
  qrButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
