import {
  AdvancedMarker,
  APIProvider,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  Car,
  ExternalLink,
  Footprints,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
} from 'lucide-react';
import {useCallback, useEffect, useRef, useState, type FormEvent} from 'react';
import {HOSPITAL_PROFILE} from '../core/hospital-data.ts';

interface RouteStepSummary {
  readonly index: number;
  readonly instruction: string;
  readonly distanceLabel: string;
}

interface ComputedRouteSummary {
  readonly originLabel: string;
  readonly distanceLabel: string;
  readonly durationLabel: string;
  readonly travelMode: 'DRIVING' | 'WALKING';
  readonly steps: readonly RouteStepSummary[];
}

const ATTRIBUTION_IDS = ['gmp_mcp_codeassist_v1_aistudio'];

const OGBOR_HILL_FALLBACK_CENTER: google.maps.LatLngLiteral = {
  lat: 5.1184,
  lng: 7.3859,
};

const ABA_ORIGIN_LANDMARKS: readonly string[] = [
  'Ariaria International Market, Aba, Nigeria',
  'Osisioma Junction, Aba, Nigeria',
  'Aba Main Motor Park, Aba, Nigeria',
];

function shortLandmarkName(full: string): string {
  return full.split(',')[0] ?? full;
}

function checkAndReportQuotaError(error: unknown): void {
  const raw = String(error ?? '');
  const status = (error as {status?: number | string})?.status;
  const code = (error as {code?: string})?.code;
  if (
    status === 429 ||
    status === 'RESOURCE_EXHAUSTED' ||
    status === 'OVER_QUERY_LIMIT' ||
    code === 'RESOURCE_EXHAUSTED' ||
    raw.includes('OVER_QUERY_LIMIT') ||
    raw.includes('RESOURCE_EXHAUSTED') ||
    raw.includes('OverQuotaMapError') ||
    raw.includes('QuotaExceededError')
  ) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  }
}

interface InnerHospitalNavigatorProps {
  readonly externalDirectionsUrl: string;
}

function InnerHospitalNavigator({externalDirectionsUrl}: InnerHospitalNavigatorProps) {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const routesLib = useMapsLibrary('routes');
  const [markerRef, hospitalMarker] = useAdvancedMarkerRef();

  const [hospitalCenter, setHospitalCenter] = useState<google.maps.LatLngLiteral | null>(null);
  const [resolvedTitle, setResolvedTitle] = useState('Jonex Hospital, Aba');
  const [resolvedAddress, setResolvedAddress] = useState<string>(HOSPITAL_PROFILE.primaryAddress);
  const [infoOpen, setInfoOpen] = useState(false);

  const [travelMode, setTravelMode] = useState<'DRIVING' | 'WALKING'>('DRIVING');
  const [routingLoading, setRoutingLoading] = useState(false);
  const [routeStatusMessage, setRouteStatusMessage] = useState('');
  const [activeRoute, setActiveRoute] = useState<ComputedRouteSummary | null>(null);
  const [originQuery, setOriginQuery] = useState('');

  const autocompleteHostRef = useRef<HTMLDivElement | null>(null);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const waypointMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const lastOriginRef = useRef<{coords: google.maps.LatLngLiteral; label: string} | null>(null);

  const clearRouteOverlays = useCallback(() => {
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];
    waypointMarkersRef.current.forEach((m) => {
      m.map = null;
    });
    waypointMarkersRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearRouteOverlays();
    };
  }, [clearRouteOverlays]);

  const resolvePlace = useCallback(
    async (
      primaryQuery: string,
      fallbackQuery?: string,
    ): Promise<google.maps.places.Place | null> => {
      if (!placesLib?.Place) {
        return null;
      }
      const runSearch = async (textQuery: string): Promise<google.maps.places.Place | null> => {
        const response = await placesLib.Place.searchByText({
          textQuery,
          fields: ['id', 'displayName', 'formattedAddress', 'location'],
          region: 'ng',
          language: 'en',
          maxResultCount: 1,
          internalUsageAttributionIds: ATTRIBUTION_IDS,
        });
        return response.places?.[0] ?? null;
      };

      const primary = await runSearch(primaryQuery);
      if (primary) {
        return primary;
      }
      if (fallbackQuery) {
        return await runSearch(fallbackQuery);
      }
      return null;
    },
    [placesLib],
  );

  useEffect(() => {
    if (!placesLib || hospitalCenter) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const place = await resolvePlace(
          'Jonex Hospital Ebenma Street Ogbor Hill Aba Abia Nigeria',
          'Ebenma Street Ogbor Hill Aba Abia Nigeria',
        );
        if (cancelled) {
          return;
        }
        if (place?.location) {
          const loc = {lat: place.location.lat(), lng: place.location.lng()};
          setHospitalCenter(loc);
          if (place.displayName) {
            setResolvedTitle(place.displayName);
          }
          if (place.formattedAddress) {
            setResolvedAddress(place.formattedAddress);
          }
          if (map) {
            map.panTo(loc);
          }
        } else {
          setHospitalCenter(OGBOR_HILL_FALLBACK_CENTER);
        }
      } catch (error) {
        checkAndReportQuotaError(error);
        if (!cancelled) {
          setHospitalCenter(OGBOR_HILL_FALLBACK_CENTER);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [placesLib, hospitalCenter, map, resolvePlace]);

  const computeRouteToHospital = useCallback(
    async (
      origin: google.maps.LatLngLiteral,
      originLabel: string,
      modeOverride?: 'DRIVING' | 'WALKING',
    ) => {
      const dest = hospitalCenter ?? OGBOR_HILL_FALLBACK_CENTER;
      if (!routesLib?.Route) {
        setRouteStatusMessage('Routing library is still initializing. Try again shortly.');
        return;
      }

      const mode = modeOverride ?? travelMode;
      lastOriginRef.current = {coords: origin, label: originLabel};
      clearRouteOverlays();

      try {
        const request: google.maps.routes.ComputeRoutesRequest = {
          origin,
          destination: dest,
          travelMode: mode as google.maps.TravelMode,
          fields: ['path', 'distanceMeters', 'durationMillis', 'viewport', 'legs'],
          internalUsageAttributionIds: ATTRIBUTION_IDS,
        };

        const response = await routesLib.Route.computeRoutes(request);
        const route = response.routes?.[0];
        if (!route) {
          setRouteStatusMessage(
            'No road route could be calculated between those two points. Use Google Maps GPS link below.',
          );
          return;
        }

        if (map) {
          const polylines = route.createPolylines();
          polylines.forEach((polyline) => {
            polyline.setOptions({
              strokeColor: '#0D6E6E',
              strokeOpacity: 0.9,
              strokeWeight: 6,
            });
            polyline.setMap(map);
          });
          polylinesRef.current = polylines;

          const waypointMarkers = await route.createWaypointAdvancedMarkers();
          waypointMarkers.forEach((m) => {
            m.map = map;
          });
          waypointMarkersRef.current = waypointMarkers;

          if (route.viewport) {
            map.fitBounds(route.viewport, 48);
          }
        }

        const distanceKm = route.distanceMeters
          ? `${(route.distanceMeters / 1000).toFixed(1)} km`
          : '—';
        const durationMins = route.durationMillis
          ? `${Math.max(1, Math.round(route.durationMillis / 60000))} min`
          : '—';

        const steps: RouteStepSummary[] = [];
        let counter = 1;
        for (const leg of route.legs ?? []) {
          for (const step of leg.steps ?? []) {
            const cleanInstruction = (step.instructions ?? 'Continue along route')
              .replace(/<[^>]*>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            const distLabel = step.distanceMeters
              ? step.distanceMeters >= 1000
                ? `${(step.distanceMeters / 1000).toFixed(1)} km`
                : `${step.distanceMeters} m`
              : '';
            steps.push({
              index: counter++,
              instruction: cleanInstruction,
              distanceLabel: distLabel,
            });
          }
        }

        setActiveRoute({
          originLabel,
          distanceLabel: distanceKm,
          durationLabel: durationMins,
          travelMode: mode,
          steps,
        });
      } catch (error) {
        checkAndReportQuotaError(error);
        setRouteStatusMessage('Unable to calculate route right now. Try again shortly.');
      }
    },
    [hospitalCenter, routesLib, travelMode, map, clearRouteOverlays],
  );

  useEffect(() => {
    const hostEl = autocompleteHostRef.current;
    if (!placesLib?.PlaceAutocompleteElement || !hostEl) {
      return;
    }

    try {
      const autocomplete = new placesLib.PlaceAutocompleteElement({
        includedRegionCodes: ['ng'],
        locationBias: hospitalCenter ?? OGBOR_HILL_FALLBACK_CENTER,
        requestedLanguage: 'en',
        requestedRegion: 'ng',
      });
      autocomplete.internalUsageAttributionIds = ATTRIBUTION_IDS;
      autocomplete.style.width = '100%';
      autocomplete.style.display = 'block';

      const handleSelect = async (event: Event) => {
        const selectEvent = event as Event & {
          placePrediction?: google.maps.places.PlacePrediction;
        };
        const prediction = selectEvent.placePrediction;
        if (!prediction) {
          return;
        }
        try {
          setRoutingLoading(true);
          setRouteStatusMessage('');
          const place = prediction.toPlace();
          await place.fetchFields({
            fields: ['displayName', 'formattedAddress', 'location'],
          });
          if (place.location) {
            const origin = {
              lat: place.location.lat(),
              lng: place.location.lng(),
            };
            await computeRouteToHospital(
              origin,
              place.displayName ?? place.formattedAddress ?? 'Selected Origin',
            );
          }
        } catch (error) {
          checkAndReportQuotaError(error);
          setRouteStatusMessage('Could not load details for the selected location.');
        } finally {
          setRoutingLoading(false);
        }
      };

      autocomplete.addEventListener('gmp-select', handleSelect);
      hostEl.innerHTML = '';
      hostEl.appendChild(autocomplete);

      return () => {
        autocomplete.removeEventListener('gmp-select', handleSelect);
        hostEl.innerHTML = '';
      };
    } catch (error) {
      checkAndReportQuotaError(error);
      return undefined;
    }
  }, [placesLib, hospitalCenter, computeRouteToHospital]);

  const handleTravelModeChange = (mode: 'DRIVING' | 'WALKING') => {
    if (travelMode === mode) {
      return;
    }
    setTravelMode(mode);
    if (lastOriginRef.current) {
      setRoutingLoading(true);
      void computeRouteToHospital(
        lastOriginRef.current.coords,
        lastOriginRef.current.label,
        mode,
      ).finally(() => setRoutingLoading(false));
    }
  };

  const handleLandmarkClick = async (landmarkQuery: string) => {
    setRoutingLoading(true);
    setRouteStatusMessage('');
    try {
      const place = await resolvePlace(landmarkQuery);
      if (!place?.location) {
        setRouteStatusMessage(
          `Could not locate "${landmarkQuery}". Try typing a nearby Aba junction.`,
        );
        return;
      }
      const origin = {lat: place.location.lat(), lng: place.location.lng()};
      await computeRouteToHospital(
        origin,
        place.displayName ?? shortLandmarkName(landmarkQuery),
      );
    } catch (error) {
      checkAndReportQuotaError(error);
      setRouteStatusMessage('Unable to resolve starting point. Try another landmark or GPS button.');
    } finally {
      setRoutingLoading(false);
    }
  };

  const handleTextSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const raw = originQuery.trim();
    if (!raw) {
      return;
    }
    const queryWithContext = raw.toLowerCase().includes('aba')
      ? raw
      : `${raw}, Aba, Abia State, Nigeria`;
    await handleLandmarkClick(queryWithContext);
  };

  const handleGeolocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setRouteStatusMessage(
        'Location services are unavailable in this browser. Pick an Aba landmark above.',
      );
      return;
    }
    setRoutingLoading(true);
    setRouteStatusMessage('Waiting for browser location permission...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const origin = {lat: pos.coords.latitude, lng: pos.coords.longitude};
        setRouteStatusMessage('');
        await computeRouteToHospital(origin, 'Your Current GPS Location');
        setRoutingLoading(false);
      },
      () => {
        setRoutingLoading(false);
        setRouteStatusMessage(
          'Location permission was declined or unavailable. Select a landmark above or search an Aba street.',
        );
      },
      {enableHighAccuracy: true, timeout: 10000},
    );
  };

  const markerPosition = hospitalCenter ?? OGBOR_HILL_FALLBACK_CENTER;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12">
      <div className="lg:col-span-5 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-200 space-y-5">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-teal-800">
            Interactive Directions · Ogbor Hill, Aba
          </p>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0F2942]">
            Navigate to Jonex Hospital
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">{resolvedAddress}</p>
        </div>

        <div className="space-y-4">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => handleTravelModeChange('DRIVING')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                travelMode === 'DRIVING'
                  ? 'bg-[#0F2942] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Car className="w-4 h-4" aria-hidden="true" />
              <span>Driving</span>
            </button>
            <button
              type="button"
              onClick={() => handleTravelModeChange('WALKING')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                travelMode === 'WALKING'
                  ? 'bg-[#0F2942] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Footprints className="w-4 h-4" aria-hidden="true" />
              <span>Walking</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <p id="originAutocompleteLabel" className="block text-xs font-semibold text-slate-700">
              Search Your Starting Address or Landmark in Nigeria
            </p>
            <div
              ref={autocompleteHostRef}
              aria-labelledby="originAutocompleteLabel"
              className="rounded-lg border border-slate-300 bg-white overflow-hidden focus-within:border-teal-700 min-h-[40px]"
            />
          </div>

          <form onSubmit={handleTextSearch} className="flex gap-2">
            <label htmlFor="originQuery" className="sr-only">
              Or enter landmark name
            </label>
            <input
              id="originQuery"
              type="text"
              value={originQuery}
              onChange={(e) => setOriginQuery(e.target.value)}
              placeholder="Or type Aba street / junction..."
              className="flex-1 min-w-0 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
            />
            <button
              type="submit"
              disabled={routingLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0F2942] hover:bg-teal-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Navigation className="w-4 h-4" aria-hidden="true" />
              <span>Route</span>
            </button>
          </form>

          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500">Quick Starting Points in Aba</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleGeolocation}
                disabled={routingLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
              >
                <LocateFixed className="w-3.5 h-3.5" aria-hidden="true" />
                <span>My Current Location</span>
              </button>
              {ABA_ORIGIN_LANDMARKS.map((landmark) => (
                <button
                  key={landmark}
                  type="button"
                  onClick={() => void handleLandmarkClick(landmark)}
                  disabled={routingLoading}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                >
                  {shortLandmarkName(landmark)}
                </button>
              ))}
            </div>
          </div>

          {routeStatusMessage && (
            <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              {routeStatusMessage}
            </p>
          )}

          {activeRoute && (
            <div
              className="rounded-xl border border-teal-200 bg-teal-50/40 p-4 space-y-3"
              data-testid="route-summary"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-teal-200/70">
                <div>
                  <p className="text-[11px] font-medium text-teal-800">
                    {activeRoute.travelMode === 'DRIVING' ? 'Driving Route' : 'Walking Route'}
                  </p>
                  <p className="text-xs font-semibold text-[#0F2942] truncate max-w-[230px]">
                    From {activeRoute.originLabel}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-bold text-[#0F2942] tabular-nums">
                    {activeRoute.durationLabel}
                  </p>
                  <p className="font-mono text-xs text-slate-600 tabular-nums">
                    {activeRoute.distanceLabel}
                  </p>
                </div>
              </div>

              {activeRoute.steps.length > 0 && (
                <ol className="max-h-44 overflow-y-auto space-y-2 pr-1 text-xs text-slate-700">
                  {activeRoute.steps.map((step) => (
                    <li key={step.index} className="flex items-start gap-2">
                      <span className="font-mono text-[11px] font-semibold text-teal-800 tabular-nums shrink-0 mt-0.5">
                        {step.index}.
                      </span>
                      <span className="flex-1">{step.instruction}</span>
                      <span className="font-mono text-[11px] text-slate-500 tabular-nums shrink-0">
                        {step.distanceLabel}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <a
            href={externalDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#0F2942] hover:text-teal-700 underline underline-offset-4"
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            <span>Open Turn-by-Turn GPS in Google Maps</span>
          </a>

          <a
            href={HOSPITAL_PROFILE.phoneHref}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-700 hover:text-[#0F2942]"
          >
            <Phone className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{HOSPITAL_PROFILE.phoneDisplay}</span>
          </a>
        </div>
      </div>

      <div className="lg:col-span-7 bg-slate-100 relative">
        <div
          className="w-full h-[420px] lg:h-full lg:min-h-[480px]"
          data-testid="google-map-container"
        >
          <GoogleMap
            defaultCenter={OGBOR_HILL_FALLBACK_CENTER}
            defaultZoom={15}
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={ATTRIBUTION_IDS}
            gestureHandling="cooperative"
            mapTypeControl={false}
            streetViewControl={false}
            fullscreenControl={true}
            renderingType="RASTER"
            style={{width: '100%', height: '100%'}}
          >
            <AdvancedMarker
              ref={markerRef}
              position={markerPosition}
              title={resolvedTitle}
              onClick={() => setInfoOpen(true)}
            >
              <Pin background="#0F2942" borderColor="#FFFFFF" glyphColor="#FFFFFF" scale={1.15} />
            </AdvancedMarker>

            {infoOpen && hospitalMarker && (
              <InfoWindow anchor={hospitalMarker} onCloseClick={() => setInfoOpen(false)}>
                <div className="p-1 max-w-xs space-y-1 text-slate-900">
                  <p className="font-display font-bold text-sm text-[#0F2942]">{resolvedTitle}</p>
                  <p className="text-xs text-slate-600">{resolvedAddress}</p>
                  <p className="text-xs font-mono text-teal-800">
                    {HOSPITAL_PROFILE.hoursPrimary} · {HOSPITAL_PROFILE.phoneDisplay}
                  </p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      </div>
    </div>
  );
}

export function HospitalMap() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const externalDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    'Jonex Hospital, Ebenma Street, Ogbor Hill, Aba, Nigeria',
  )}`;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/maps-config');
        if (!res.ok) {
          throw new Error('Unable to fetch maps configuration');
        }
        const contentType = res.headers.get('content-type') ?? '';
        if (!contentType.includes('application/json')) {
          throw new Error('Unexpected response format from maps configuration endpoint');
        }
        const data = (await res.json()) as {apiKey?: string};
        const resolved = typeof data.apiKey === 'string' ? data.apiKey.trim() : '';
        if (!cancelled) {
          if (resolved) {
            setApiKey(resolved);
          } else {
            setLoadError(
              'Interactive embedded map requires a Google Maps Platform key on the host server. Use the Google Maps GPS link below for turn-by-turn routing.',
            );
          }
        }
      } catch {
        if (!cancelled) {
          setLoadError(
            'Map could not load cleanly right now. Use the turn-by-turn Google Maps link below or call +234 807 801 6691.',
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (apiKey) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/95 shadow-md overflow-hidden">
        <APIProvider
          apiKey={apiKey}
          language="en"
          region="NG"
        >
          <InnerHospitalNavigator externalDirectionsUrl={externalDirectionsUrl} />
        </APIProvider>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 shadow-md overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-200 space-y-5">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-teal-800">
              Interactive Directions · Ogbor Hill, Aba
            </p>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0F2942]">
              Navigate to Jonex Hospital
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {HOSPITAL_PROFILE.primaryAddress}
            </p>
          </div>

          {loadError ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-sm text-slate-700">
              <p className="font-semibold text-[#0F2942]">Campus Wayfinding Summary</p>
              <p className="text-xs leading-relaxed text-slate-600">{loadError}</p>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li>
                  <strong>Primary Hospital:</strong> {HOSPITAL_PROFILE.primaryAddress}
                </li>
                <li>
                  <strong>Drop-Off:</strong> Covered patient driveway on Ebenma Street with
                  step-free ramp
                </li>
                <li>
                  <strong>Parking:</strong> On-site visitor parking bay and wheelchair access slots
                </li>
              </ul>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-sm text-slate-600">
              <RefreshCw className="w-5 h-5 text-teal-700 animate-spin shrink-0" aria-hidden="true" />
              <span>Locating Jonex Hospital, Ebenma Street, Ogbor Hill...</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <a
              href={externalDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#0F2942] hover:text-teal-700 underline underline-offset-4"
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
              <span>Open Turn-by-Turn GPS in Google Maps</span>
            </a>

            <a
              href={HOSPITAL_PROFILE.phoneHref}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-700 hover:text-[#0F2942]"
            >
              <Phone className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{HOSPITAL_PROFILE.phoneDisplay}</span>
            </a>
          </div>
        </div>

        <div className="lg:col-span-7 bg-slate-100">
          <div className="w-full h-[420px] lg:h-full lg:min-h-[480px] flex flex-col items-center justify-center p-8 text-center space-y-4 bg-slate-100">
            <MapPin className="w-10 h-10 text-[#0F2942]" aria-hidden="true" />
            <div className="space-y-1 max-w-md">
              <p className="font-display text-lg font-bold text-[#0F2942]">
                Jonex Hospital · Ogbor Hill, Aba
              </p>
              <p className="text-sm text-slate-600">{HOSPITAL_PROFILE.primaryAddress}</p>
            </div>
            <a
              href={externalDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0F2942] hover:bg-teal-800 rounded-lg transition-colors"
            >
              <Navigation className="w-[18px] h-[18px]" aria-hidden="true" />
              <span>Launch Google Maps Navigation</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
