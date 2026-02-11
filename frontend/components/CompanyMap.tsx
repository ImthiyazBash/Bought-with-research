'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { HamburgTarget, CompanyWithCoordinates } from '@/lib/types';
import { formatCurrency, getCompanyNachfolgeScore, getScoreColor } from '@/lib/utils';
import { useTranslations } from '@/lib/i18n-context';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface CompanyMapProps {
  companies: HamburgTarget[];
  hoveredCompanyId: number | null;
  selectedCity: string | null;
  onMarkerClick?: (company: HamburgTarget) => void;
  onMarkerHover?: (id: number | null) => void;
}

// Cache for geocoded coordinates
const geocodeCache: Record<string, { lat: number; lng: number }> = {};

// City bounds for zoom functionality
const CITY_BOUNDS: Record<string, [[number, number], [number, number]]> = {
  Hamburg: [
    [9.7, 53.4], // Southwest [lng, lat]
    [10.3, 53.7], // Northeast [lng, lat]
  ],
  Buxtehude: [
    [9.60, 53.42], // Southwest - zoomed out more
    [9.76, 53.52], // Northeast - zoomed out more
  ],
};

async function geocodeAddress(
  street: string | null,
  zip: string | null,
  city: string | null
): Promise<{ lat: number; lng: number } | null> {
  const address = [street, zip, city, 'Germany'].filter(Boolean).join(', ');
  if (!address || address === ', Germany') return null;

  // Check cache
  if (geocodeCache[address]) {
    return geocodeCache[address];
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        address
      )}.json?access_token=${mapboxgl.accessToken}&limit=1`
    );
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      geocodeCache[address] = { lat, lng };
      return { lat, lng };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  return null;
}

export default function CompanyMap({
  companies,
  hoveredCompanyId,
  selectedCity,
  onMarkerClick,
  onMarkerHover,
}: CompanyMapProps) {
  const t = useTranslations();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<number, mapboxgl.Marker>>(new Map());
  const [companiesWithCoords, setCompaniesWithCoords] = useState<CompanyWithCoordinates[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Geocode all companies
  useEffect(() => {
    async function geocodeCompanies() {
      setIsLoading(true);
      const results: CompanyWithCoordinates[] = [];

      for (const company of companies) {
        const coords = await geocodeAddress(
          company.address_street,
          company.address_zip,
          company.address_city
        );

        if (coords) {
          results.push({
            ...company,
            latitude: coords.lat,
            longitude: coords.lng,
          });
        }
      }

      setCompaniesWithCoords(results);
      setIsLoading(false);
    }

    if (companies.length > 0) {
      geocodeCompanies();
    }
  }, [companies]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [9.9937, 53.5511], // Hamburg center
      zoom: 11,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add/update markers
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    companiesWithCoords.forEach((company) => {
      if (!company.latitude || !company.longitude) return;

      const score = getCompanyNachfolgeScore(company);
      const color = getScoreColor(score);

      // Create custom marker element with wrapper to prevent position shift
      const el = document.createElement('div');
      el.className = 'custom-marker-wrapper';
      el.style.cssText = `
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      `;

      const innerEl = document.createElement('div');
      innerEl.className = 'custom-marker-inner';
      innerEl.style.cssText = `
        width: 32px;
        height: 32px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: transform 0.2s, box-shadow 0.2s;
        transform-origin: center center;
      `;

      el.appendChild(innerEl);

      el.addEventListener('mouseenter', () => {
        innerEl.style.transform = 'scale(1.2)';
        innerEl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
        onMarkerHover?.(company.id);
      });

      el.addEventListener('mouseleave', () => {
        innerEl.style.transform = 'scale(1)';
        innerEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        onMarkerHover?.(null);
      });

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        maxWidth: '280px',
        className: 'map-popup-high-z',
      }).setHTML(`
        <div style="padding: 8px;">
          <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">
            ${company.company_name || 'Unnamed Company'}
          </h3>
          <p style="color: #666; font-size: 12px; margin-bottom: 8px;">
            ${[company.address_zip, company.address_city].filter(Boolean).join(' ')}
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
            <div>
              <span style="color: #999;">Equity</span><br/>
              <strong>${formatCurrency(company.equity_eur)}</strong>
            </div>
            <div>
              <span style="color: #999;">Employees</span><br/>
              <strong>${company.employee_count || 'N/A'}</strong>
            </div>
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center', // Center anchor for circular markers
      })
        .setLngLat([company.longitude, company.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onMarkerClick?.(company);
      });

      markersRef.current.set(company.id, marker);
    });
  }, [companiesWithCoords, onMarkerClick, onMarkerHover]);

  // Handle city selection zoom
  useEffect(() => {
    if (!map.current) return;

    if (selectedCity && CITY_BOUNDS[selectedCity]) {
      // Zoom to city bounds
      map.current.fitBounds(CITY_BOUNDS[selectedCity], {
        padding: 50,
        duration: 1000,
      });
    } else {
      // Reset to default Hamburg view
      map.current.flyTo({
        center: [9.9937, 53.5511],
        zoom: 9.5,
        duration: 1000,
      });
    }
  }, [selectedCity]);

  // Handle hover state
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const el = marker.getElement();
      const innerEl = el.querySelector('.custom-marker-inner') as HTMLElement;
      if (id === hoveredCompanyId) {
        if (innerEl) {
          innerEl.style.transform = 'scale(1.3)';
          innerEl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
        }
        el.style.zIndex = '100';
        marker.togglePopup();
      } else {
        if (innerEl) {
          innerEl.style.transform = 'scale(1)';
          innerEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        }
        el.style.zIndex = '1';
        if (marker.getPopup()?.isOpen()) {
          marker.togglePopup();
        }
      }
    });
  }, [hoveredCompanyId]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full rounded-lg" />
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
            <p className="text-sm text-gray-600">Geocoding addresses...</p>
          </div>
        </div>
      )}
      {!isLoading && companiesWithCoords.length === 0 && companies.length > 0 && (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-lg">
          <div className="text-center max-w-sm px-4">
            <div className="text-4xl mb-3">📍</div>
            <p className="text-sm font-medium text-gray-700 mb-1">No Address Data Available</p>
            <p className="text-xs text-gray-500">
              Companies need address_street, address_zip, and address_city populated in the database for geocoding.
            </p>
          </div>
        </div>
      )}
      {companiesWithCoords.length < companies.length && companiesWithCoords.length > 0 && !isLoading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 shadow-sm">
          <p className="text-xs text-amber-800">
            {t('map.partialData').replace('{shown}', companiesWithCoords.length.toString()).replace('{total}', companies.length.toString())}
          </p>
        </div>
      )}
      {/* Legend - Compact on mobile, full on desktop */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-2 sm:p-3">
        <p className="text-xs font-medium text-gray-700 mb-1 sm:mb-2">{t('score.legend')}</p>
        <div className="space-y-0.5 sm:space-y-1">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-[10px] sm:text-xs">{t('score.high')}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500 flex-shrink-0" />
            <span className="text-[10px] sm:text-xs">{t('score.medium')}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 flex-shrink-0" />
            <span className="text-[10px] sm:text-xs">{t('score.low')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
