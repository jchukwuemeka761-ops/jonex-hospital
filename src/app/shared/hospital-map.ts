import {isPlatformBrowser} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {GoogleMap, MapAdvancedMarker, MapInfoWindow} from '@angular/google-maps';
import {MatIconModule} from '@angular/material/icon';
import {HOSPITAL_PROFILE} from '../core/hospital-data';

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

declare global {
  interface Window {
    __jonexMapsLoaderPromise?: Promise<void>;
  }
}

const ATTRIBUTION_IDS = ['gmp_mcp_codeassist_v1_aistudio'];

const ABA_ORIGIN_LANDMARKS: readonly string[] = [
  'Ariaria International Market, Aba, Nigeria',
  'Osisioma Junction, Aba, Nigeria',
  'Aba Main Motor Park, Aba, Nigeria',
];

@Component({
  selector: 'app-hospital-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    GoogleMap,
    MapAdvancedMarker,
    MapInfoWindow,
    MatIconModule,
    ReactiveFormsModule,
  ],
  template: `
    <div class="rounded-2xl border border-slate-200 bg-white/95 shadow-md overflow-hidden">
      <div class="grid grid-cols-1 lg:grid-cols-12">
        <!-- Left Panel: Origin Search, Quick Landmarks, Travel Mode & Maneuvers -->
        <div class="lg:col-span-5 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-200 space-y-5">
          <div class="space-y-1.5">
            <p class="text-xs font-medium text-teal-800">Interactive Directions · Ogbor Hill, Aba</p>
            <h3 class="font-display text-xl sm:text-2xl font-bold text-[#0F2942]">
              Navigate to Jonex Hospital
            </h3>
            <p class="text-sm text-slate-600 leading-relaxed">
              {{ resolvedAddress() }}
            </p>
          </div>

          @if (mapsReady()) {
            <div class="space-y-4">
              <!-- Travel Mode Selector -->
              <div class="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  (click)="setTravelMode('DRIVING')"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors"
                  [class]="travelMode() === 'DRIVING'
                    ? 'bg-[#0F2942] text-white'
                    : 'text-slate-600 hover:text-slate-900'"
                >
                  <mat-icon class="!text-[16px] !w-[16px] !h-[16px]">directions_car</mat-icon>
                  <span>Driving</span>
                </button>
                <button
                  type="button"
                  (click)="setTravelMode('WALKING')"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors"
                  [class]="travelMode() === 'WALKING'
                    ? 'bg-[#0F2942] text-white'
                    : 'text-slate-600 hover:text-slate-900'"
                >
                  <mat-icon class="!text-[16px] !w-[16px] !h-[16px]">directions_walk</mat-icon>
                  <span>Walking</span>
                </button>
              </div>

              <!-- Places Autocomplete Web Component Mount -->
              <div class="space-y-1.5">
                <p id="originAutocompleteLabel" class="block text-xs font-semibold text-slate-700">
                  Search Your Starting Address or Landmark in Nigeria
                </p>
                <div
                  #autocompleteHost
                  aria-labelledby="originAutocompleteLabel"
                  class="rounded-lg border border-slate-300 bg-white overflow-hidden focus-within:border-teal-700"
                ></div>
              </div>

              <!-- Fallback Direct Search Form -->
              <form [formGroup]="originSearchForm" (ngSubmit)="routeFromTextQuery()" class="flex gap-2">
                <label for="originQuery" class="sr-only">Or enter landmark name</label>
                <input
                  id="originQuery"
                  type="text"
                  formControlName="query"
                  placeholder="Or type Aba street / junction..."
                  class="flex-1 min-w-0 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
                />
                <button
                  type="submit"
                  [disabled]="routingLoading()"
                  class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0F2942] hover:bg-teal-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <mat-icon class="!text-[16px] !w-[16px] !h-[16px]">directions</mat-icon>
                  <span>Route</span>
                </button>
              </form>

              <!-- Quick Aba Landmarks & Browser Geolocation -->
              <div class="space-y-2">
                <p class="text-xs font-medium text-slate-500">Quick Starting Points in Aba</p>
                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    (click)="routeFromGeolocation()"
                    [disabled]="routingLoading()"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
                  >
                    <mat-icon class="!text-[15px] !w-[15px] !h-[15px]">my_location</mat-icon>
                    <span>My Current Location</span>
                  </button>
                  @for (landmark of landmarks; track landmark) {
                    <button
                      type="button"
                      (click)="routeFromLandmark(landmark)"
                      [disabled]="routingLoading()"
                      class="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                    >
                      {{ shortLandmarkName(landmark) }}
                    </button>
                  }
                </div>
              </div>

              @if (routeStatusMessage()) {
                <p class="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  {{ routeStatusMessage() }}
                </p>
              }

              <!-- Computed Route Summary & Step List -->
              @if (activeRoute(); as summary) {
                <div class="rounded-xl border border-teal-200 bg-teal-50/40 p-4 space-y-3" data-testid="route-summary">
                  <div class="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-teal-200/70">
                    <div>
                      <p class="text-[11px] font-medium text-teal-800">
                        {{ summary.travelMode === 'DRIVING' ? 'Driving Route' : 'Walking Route' }}
                      </p>
                      <p class="text-xs font-semibold text-[#0F2942] truncate max-w-[230px]">
                        From {{ summary.originLabel }}
                      </p>
                    </div>
                    <div class="text-right">
                      <p class="font-display text-lg font-bold text-[#0F2942] tabular-nums">
                        {{ summary.durationLabel }}
                      </p>
                      <p class="font-mono text-xs text-slate-600 tabular-nums">
                        {{ summary.distanceLabel }}
                      </p>
                    </div>
                  </div>

                  @if (summary.steps.length > 0) {
                    <ol class="max-h-44 overflow-y-auto space-y-2 pr-1 text-xs text-slate-700">
                      @for (step of summary.steps; track step.index) {
                        <li class="flex items-start gap-2">
                          <span class="font-mono text-[11px] font-semibold text-teal-800 tabular-nums shrink-0 mt-0.5">
                            {{ step.index }}.
                          </span>
                          <span class="flex-1">{{ step.instruction }}</span>
                          <span class="font-mono text-[11px] text-slate-500 tabular-nums shrink-0">
                            {{ step.distanceLabel }}
                          </span>
                        </li>
                      }
                    </ol>
                  }
                </div>
              }
            </div>
          } @else if (mapLoadError()) {
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-sm text-slate-700">
              <p class="font-semibold text-[#0F2942]">Campus Wayfinding Summary</p>
              <p class="text-xs leading-relaxed text-slate-600">
                {{ mapLoadError() }}
              </p>
              <ul class="space-y-1.5 text-xs text-slate-600">
                <li><strong>Primary Hospital:</strong> {{ hospital.primaryAddress }}</li>
                <li><strong>Drop-Off:</strong> Covered patient driveway on Ebenma Street with step-free ramp</li>
                <li><strong>Parking:</strong> On-site visitor parking bay and wheelchair access slots</li>
              </ul>
            </div>
          } @else {
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-sm text-slate-600">
              <mat-icon class="!text-[20px] !w-[20px] !h-[20px] text-teal-700 animate-spin">sync</mat-icon>
              <span>Locating Jonex Hospital, Ebenma Street, Ogbor Hill...</span>
            </div>
          }

          <div class="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <a
              [href]="externalDirectionsUrl()"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-xs font-semibold text-[#0F2942] hover:text-teal-700 underline underline-offset-4"
            >
              <mat-icon class="!text-[16px] !w-[16px] !h-[16px]">open_in_new</mat-icon>
              <span>Open Turn-by-Turn GPS in Google Maps</span>
            </a>

            <a
              [href]="hospital.phoneHref"
              class="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-700 hover:text-[#0F2942]"
            >
              <mat-icon class="!text-[15px] !w-[15px] !h-[15px]">call</mat-icon>
              <span>{{ hospital.phoneDisplay }}</span>
            </a>
          </div>
        </div>

        <!-- Right Panel: Explicit-Height Interactive Google Map Canvas (CF2 Guarded) -->
        <div class="lg:col-span-7 bg-slate-100 relative">
          @if (mapsReady() && hospitalCenter(); as dest) {
            <div class="w-full h-[420px] lg:h-full lg:min-h-[480px]" data-testid="google-map-container">
              <google-map
                width="100%"
                height="100%"
                [mapId]="'DEMO_MAP_ID'"
                [center]="dest"
                [zoom]="15"
                [options]="mapOptions"
                (mapInitialized)="onMapInitialized($event)"
              >
                <map-advanced-marker
                  #hospitalMarker="mapAdvancedMarker"
                  [position]="dest"
                  [title]="resolvedTitle()"
                  [content]="hospitalPin()"
                  (mapClick)="openHospitalInfo(hospitalMarker)"
                />
                <map-info-window>
                  <div class="p-1 max-w-xs space-y-1 text-slate-900">
                    <p class="font-display font-bold text-sm text-[#0F2942]">
                      {{ resolvedTitle() }}
                    </p>
                    <p class="text-xs text-slate-600">{{ resolvedAddress() }}</p>
                    <p class="text-xs font-mono text-teal-800">
                      {{ hospital.hoursPrimary }} · {{ hospital.phoneDisplay }}
                    </p>
                  </div>
                </map-info-window>
              </google-map>
            </div>
          } @else {
            <div class="w-full h-[420px] lg:h-full lg:min-h-[480px] flex flex-col items-center justify-center p-8 text-center space-y-4 bg-slate-100">
              <mat-icon class="!text-[40px] !w-[40px] !h-[40px] text-[#0F2942]">location_on</mat-icon>
              <div class="space-y-1 max-w-md">
                <p class="font-display text-lg font-bold text-[#0F2942]">
                  Jonex Hospital · Ogbor Hill, Aba
                </p>
                <p class="text-sm text-slate-600">
                  {{ hospital.primaryAddress }}
                </p>
              </div>
              <a
                [href]="externalDirectionsUrl()"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0F2942] hover:bg-teal-800 rounded-lg transition-colors"
              >
                <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">directions</mat-icon>
                <span>Launch Google Maps Navigation</span>
              </a>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class HospitalMap implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  readonly hospital = HOSPITAL_PROFILE;
  readonly landmarks = ABA_ORIGIN_LANDMARKS;

  readonly autocompleteHost = viewChild<ElementRef<HTMLElement>>('autocompleteHost');
  readonly infoWindowRef = viewChild(MapInfoWindow);

  readonly mapsReady = signal(false);
  readonly mapLoadError = signal<string | null>(null);
  readonly hospitalCenter = signal<google.maps.LatLngLiteral | null>(null);
  readonly resolvedTitle = signal<string>('Jonex Hospital, Aba');
  readonly resolvedAddress = signal<string>(HOSPITAL_PROFILE.primaryAddress);
  readonly hospitalPin = signal<google.maps.marker.PinElement | null>(null);

  readonly travelMode = signal<'DRIVING' | 'WALKING'>('DRIVING');
  readonly routingLoading = signal(false);
  readonly routeStatusMessage = signal<string>('');
  readonly activeRoute = signal<ComputedRouteSummary | null>(null);

  readonly originSearchForm = new FormGroup({
    query: new FormControl('', {nonNullable: true}),
  });

  readonly mapOptions: google.maps.MapOptions = {
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    gestureHandling: 'cooperative',
    renderingType: 'RASTER' as google.maps.RenderingType,
    internalUsageAttributionIds: ATTRIBUTION_IDS,
  };

  private mapInstance: google.maps.Map | null = null;
  private activePolylines: google.maps.Polyline[] = [];
  private activeWaypointMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
  private lastOrigin: google.maps.LatLngLiteral | null = null;
  private lastOriginLabel = '';
  private autocompleteMounted = false;

  async ngOnInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const apiKey = await this.fetchMapsApiKey();
      if (!apiKey) {
        this.mapLoadError.set(
          'Interactive embedded map requires a Google Maps Platform key on the host server. Use the Google Maps GPS link below for turn-by-turn routing.',
        );
        return;
      }

      await this.loadGoogleMapsScript(apiKey);

      const [{Place}, {PinElement}] = await Promise.all([
        google.maps.importLibrary('places') as Promise<google.maps.PlacesLibrary>,
        google.maps.importLibrary('marker') as Promise<google.maps.MarkerLibrary>,
        google.maps.importLibrary('maps') as Promise<google.maps.MapsLibrary>,
      ]);

      const hospitalPlace = await this.resolvePlace(
        Place,
        'Jonex Hospital Ebenma Street Ogbor Hill Aba Abia Nigeria',
        'Ebenma Street Ogbor Hill Aba Abia Nigeria',
      );

      if (!hospitalPlace?.location) {
        this.mapLoadError.set(
          'Unable to resolve Ogbor Hill campus coordinates right now. Use direct GPS navigation below.',
        );
        return;
      }

      const loc = {
        lat: hospitalPlace.location.lat(),
        lng: hospitalPlace.location.lng(),
      };
      this.hospitalCenter.set(loc);
      if (hospitalPlace.displayName) {
        this.resolvedTitle.set(hospitalPlace.displayName);
      }
      if (hospitalPlace.formattedAddress) {
        this.resolvedAddress.set(hospitalPlace.formattedAddress);
      }

      this.hospitalPin.set(
        new PinElement({
          background: '#0F2942',
          borderColor: '#FFFFFF',
          glyphColor: '#FFFFFF',
          scale: 1.15,
        }),
      );

      this.mapsReady.set(true);
    } catch (error) {
      this.checkAndReportQuotaError(error);
      this.mapLoadError.set(
        'Map could not load cleanly right now. Use the turn-by-turn Google Maps link below or call +234 807 801 6691.',
      );
    }
  }

  ngOnDestroy(): void {
    this.clearRouteOverlays();
  }

  onMapInitialized(map: google.maps.Map): void {
    this.mapInstance = map;
    void this.mountPlaceAutocomplete();
  }

  openHospitalInfo(marker: MapAdvancedMarker): void {
    const iw = this.infoWindowRef();
    if (iw) {
      iw.open(marker);
    }
  }

  setTravelMode(mode: 'DRIVING' | 'WALKING'): void {
    if (this.travelMode() === mode) {
      return;
    }
    this.travelMode.set(mode);
    if (this.lastOrigin) {
      void this.computeRouteToHospital(this.lastOrigin, this.lastOriginLabel);
    }
  }

  shortLandmarkName(full: string): string {
    return full.split(',')[0] ?? full;
  }

  externalDirectionsUrl(): string {
    const query = encodeURIComponent('Jonex Hospital, Ebenma Street, Ogbor Hill, Aba, Nigeria');
    return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  }

  async routeFromLandmark(landmarkQuery: string): Promise<void> {
    if (!this.mapsReady()) {
      return;
    }
    this.routingLoading.set(true);
    this.routeStatusMessage.set('');
    try {
      const {Place} = (await google.maps.importLibrary('places')) as google.maps.PlacesLibrary;
      const place = await this.resolvePlace(Place, landmarkQuery);
      if (!place?.location) {
        this.routeStatusMessage.set(`Could not locate "${landmarkQuery}". Try typing a nearby Aba junction.`);
        return;
      }
      const origin = {lat: place.location.lat(), lng: place.location.lng()};
      await this.computeRouteToHospital(origin, place.displayName ?? this.shortLandmarkName(landmarkQuery));
    } catch (error) {
      this.checkAndReportQuotaError(error);
      this.routeStatusMessage.set('Unable to resolve starting point. Try another landmark or GPS button.');
    } finally {
      this.routingLoading.set(false);
    }
  }

  async routeFromTextQuery(): Promise<void> {
    const raw = this.originSearchForm.controls.query.value.trim();
    if (!raw || !this.mapsReady()) {
      return;
    }
    const queryWithContext = raw.toLowerCase().includes('aba') ? raw : `${raw}, Aba, Abia State, Nigeria`;
    await this.routeFromLandmark(queryWithContext);
  }

  routeFromGeolocation(): void {
    if (!isPlatformBrowser(this.platformId) || !navigator.geolocation) {
      this.routeStatusMessage.set('Location services are unavailable in this browser. Pick an Aba landmark above.');
      return;
    }
    this.routingLoading.set(true);
    this.routeStatusMessage.set('Waiting for browser location permission...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const origin = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        this.routeStatusMessage.set('');
        await this.computeRouteToHospital(origin, 'Your Current GPS Location');
        this.routingLoading.set(false);
      },
      () => {
        this.routingLoading.set(false);
        this.routeStatusMessage.set(
          'Location permission was declined or unavailable. Select a landmark above or search an Aba street.',
        );
      },
      {enableHighAccuracy: true, timeout: 10000},
    );
  }

  private async mountPlaceAutocomplete(): Promise<void> {
    if (this.autocompleteMounted) {
      return;
    }
    const hostEl = this.autocompleteHost()?.nativeElement;
    if (!hostEl) {
      return;
    }
    try {
      const {PlaceAutocompleteElement} = (await google.maps.importLibrary(
        'places',
      )) as google.maps.PlacesLibrary;

      const autocomplete = new PlaceAutocompleteElement({
        includedRegionCodes: ['ng'],
        locationBias: this.hospitalCenter() ?? undefined,
        requestedLanguage: 'en',
        requestedRegion: 'ng',
      });
      autocomplete.internalUsageAttributionIds = ATTRIBUTION_IDS;
      autocomplete.style.width = '100%';
      autocomplete.style.display = 'block';

      autocomplete.addEventListener('gmp-select', async (event: Event) => {
        const selectEvent = event as Event & {
          placePrediction?: google.maps.places.PlacePrediction;
        };
        const prediction = selectEvent.placePrediction;
        if (!prediction) {
          return;
        }
        try {
          this.routingLoading.set(true);
          this.routeStatusMessage.set('');
          const place = prediction.toPlace();
          await place.fetchFields({
            fields: ['displayName', 'formattedAddress', 'location'],
          });
          if (place.location) {
            const origin = {
              lat: place.location.lat(),
              lng: place.location.lng(),
            };
            await this.computeRouteToHospital(
              origin,
              place.displayName ?? place.formattedAddress ?? 'Selected Origin',
            );
          }
        } catch (error) {
          this.checkAndReportQuotaError(error);
          this.routeStatusMessage.set('Could not load details for the selected location.');
        } finally {
          this.routingLoading.set(false);
        }
      });

      hostEl.innerHTML = '';
      hostEl.appendChild(autocomplete);
      this.autocompleteMounted = true;
    } catch (error) {
      this.checkAndReportQuotaError(error);
    }
  }

  private async computeRouteToHospital(
    origin: google.maps.LatLngLiteral,
    originLabel: string,
  ): Promise<void> {
    const dest = this.hospitalCenter();
    if (!dest) {
      return;
    }

    this.lastOrigin = origin;
    this.lastOriginLabel = originLabel;
    this.clearRouteOverlays();

    try {
      const {Route} = (await google.maps.importLibrary('routes')) as google.maps.RoutesLibrary;
      const request: google.maps.routes.ComputeRoutesRequest = {
        origin,
        destination: dest,
        travelMode: this.travelMode(),
        fields: ['path', 'distanceMeters', 'durationMillis', 'viewport', 'legs'],
        internalUsageAttributionIds: ATTRIBUTION_IDS,
      };

      const response = await Route.computeRoutes(request);
      const route = response.routes?.[0];
      if (!route) {
        this.routeStatusMessage.set(
          'No road route could be calculated between those two points. Use Google Maps GPS link below.',
        );
        return;
      }

      if (this.mapInstance) {
        const polylines = route.createPolylines();
        polylines.forEach((polyline) => {
          polyline.setOptions({
            strokeColor: '#0D6E6E',
            strokeOpacity: 0.9,
            strokeWeight: 6,
          });
          polyline.setMap(this.mapInstance);
        });
        this.activePolylines = polylines;

        const waypointMarkers = await route.createWaypointAdvancedMarkers();
        waypointMarkers.forEach((m) => {
          m.map = this.mapInstance;
        });
        this.activeWaypointMarkers = waypointMarkers;

        if (route.viewport) {
          this.mapInstance.fitBounds(route.viewport, 48);
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

      this.activeRoute.set({
        originLabel,
        distanceLabel: distanceKm,
        durationLabel: durationMins,
        travelMode: this.travelMode(),
        steps,
      });
    } catch (error) {
      this.checkAndReportQuotaError(error);
      this.routeStatusMessage.set('Unable to calculate route right now. Try again shortly.');
    }
  }

  private clearRouteOverlays(): void {
    this.activePolylines.forEach((p) => p.setMap(null));
    this.activePolylines = [];
    this.activeWaypointMarkers.forEach((m) => {
      m.map = null;
    });
    this.activeWaypointMarkers = [];
  }

  private async resolvePlace(
    PlaceCtor: typeof google.maps.places.Place,
    primaryQuery: string,
    fallbackQuery?: string,
  ): Promise<google.maps.places.Place | null> {
    const runSearch = async (textQuery: string): Promise<google.maps.places.Place | null> => {
      const response = await PlaceCtor.searchByText({
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
  }

  private async fetchMapsApiKey(): Promise<string> {
    try {
      const response = await fetch('/api/maps-config');
      if (!response.ok) {
        return '';
      }
      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        return '';
      }
      const data = (await response.json()) as {apiKey?: string};
      return typeof data.apiKey === 'string' ? data.apiKey.trim() : '';
    } catch {
      return '';
    }
  }

  private loadGoogleMapsScript(apiKey: string): Promise<void> {
    if (window.__jonexMapsLoaderPromise) {
      return window.__jonexMapsLoaderPromise;
    }
    if (typeof google !== 'undefined' && typeof google.maps?.importLibrary === 'function') {
      return Promise.resolve();
    }

    window.__jonexMapsLoaderPromise = new Promise<void>((resolve, reject) => {
      const win = window as unknown as Record<string, unknown>;
      const g = (win['google'] as Record<string, unknown>) || {};
      win['google'] = g;
      const maps = (g['maps'] as Record<string, unknown>) || {};
      g['maps'] = maps;

      const callbackName = '__jonexInitMaps';
      maps[callbackName] = () => resolve();

      const params = new URLSearchParams({
        key: apiKey,
        v: 'weekly',
        language: 'en',
        region: 'NG',
        loading: 'async',
        callback: `google.maps.${callbackName}`,
      });

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
      script.async = true;
      script.onerror = () => reject(new Error('Google Maps JavaScript API script failed to load.'));
      document.head.appendChild(script);
    });

    return window.__jonexMapsLoaderPromise;
  }

  private checkAndReportQuotaError(error: unknown): void {
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
}
