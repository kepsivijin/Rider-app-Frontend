import { useState, useEffect, useCallback } from 'react';

export type GeoPermission = 'prompt' | 'granted' | 'denied' | 'unsupported';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  errorCode: number | null;
  loading: boolean;
  permission: GeoPermission;
}

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 20000,
  maximumAge: 0,
};

/** One-shot GPS request — use for "current location" pickup. */
export function requestCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(Object.assign(new Error('Geolocation not supported'), { code: 0 }));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, GEO_OPTIONS);
  });
}

function friendlyGeoError(code: number): string {
  switch (code) {
    case 1:
      return 'Location access denied. Allow location in your browser settings, or tap the map to pick a spot.';
    case 2:
      return 'Location unavailable. Check GPS/network or select pickup on the map.';
    case 3:
      return 'Location request timed out. Try again or pick on the map.';
    default:
      return 'Could not get your location. Pick pickup on the map instead.';
  }
}

export const useGeolocation = (watch = false) => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    errorCode: null,
    loading: true,
    permission: 'prompt',
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        latitude: null,
        longitude: null,
        error: 'Geolocation is not supported on this device. Use the map to select locations.',
        errorCode: null,
        loading: false,
        permission: 'unsupported',
      });
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
        errorCode: null,
        loading: false,
        permission: 'granted',
      });
    };

    const onError = (error: GeolocationPositionError) => {
      setState({
        latitude: null,
        longitude: null,
        error: friendlyGeoError(error.code),
        errorCode: error.code,
        loading: false,
        permission: error.code === 1 ? 'denied' : 'prompt',
      });
    };

    const opts: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: watch ? 5000 : 0,
    };

    if (watch) {
      const id = navigator.geolocation.watchPosition(onSuccess, onError, opts);
      return () => navigator.geolocation.clearWatch(id);
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError, opts);
    return undefined;
  }, [watch]);

  useEffect(() => {
    const cleanup = requestLocation();
    return cleanup;
  }, [requestLocation]);

  return { ...state, retry: requestLocation };
};

/** Continuous GPS updates for live ride tracking (driver). */
export const useWatchGeolocation = (enabled: boolean) => {
  const [state, setState] = useState<Omit<GeolocationState, 'permission'> & { permission: GeoPermission }>({
    latitude: null,
    longitude: null,
    error: null,
    errorCode: null,
    loading: enabled,
    permission: 'prompt',
  });

  useEffect(() => {
    if (!enabled) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    if (!navigator.geolocation) {
      setState({
        latitude: null,
        longitude: null,
        error: 'Geolocation not supported',
        errorCode: null,
        loading: false,
        permission: 'unsupported',
      });
      return;
    }

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
        errorCode: null,
        loading: false,
        permission: 'granted',
      });
    };

    const onError = (error: GeolocationPositionError) => {
      setState((s) => ({
        ...s,
        error: friendlyGeoError(error.code),
        errorCode: error.code,
        loading: false,
        permission: error.code === 1 ? 'denied' : 'prompt',
      }));
    };

    const id = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 3000,
    });
    return () => navigator.geolocation.clearWatch(id);
  }, [enabled]);

  return state;
};
