// ──────────────────────────────────────────────────────────────────────────────
// IMPORTANT: This service mixes two raw-fetch patterns (Pattern B + external).
// Neither function uses axiosInstance. Do NOT add authenticated (Pattern D)
// functions to this file. If an authenticated reference-data endpoint is
// needed in the future, create a new service file for it.
// ──────────────────────────────────────────────────────────────────────────────

import type { Industry } from "@/app/upload/type";
import type { LocationResult, GeoItem } from "@/types/api";

const LOCATION_API_BASE = "https://techades.com/App/api.php";

export const getIndustries = async (): Promise<Industry[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=industrylist`
  );
  if (!res.ok) throw new Error(`getIndustries failed: ${res.status}`);
  return res.json() as Promise<Industry[]>;
};

export const getLocations = async (
  searchTerm: string
): Promise<LocationResult[]> => {
  const res = await fetch(
    `${LOCATION_API_BASE}?gofor=locationlist&search=${encodeURIComponent(searchTerm)}`
  );
  if (!res.ok) throw new Error(`getLocations failed: ${res.status}`);
  return res.json() as Promise<LocationResult[]>;
};

export const getCountries = async (): Promise<GeoItem[]> => {
  const res = await fetch(
    `${LOCATION_API_BASE}?gofor=countrieslist`
  );
  if (!res.ok) throw new Error(`getCountries failed: ${res.status}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map(
    (c: { id: string | number; name: string }) => ({
      id: String(c.id),
      name: String(c.name),
    })
  );
};

export const getStates = async (
  countryId: string
): Promise<GeoItem[]> => {
  const res = await fetch(
    `${LOCATION_API_BASE}?gofor=stateslist&country_id=${encodeURIComponent(countryId)}`
  );
  if (!res.ok) throw new Error(`getStates failed: ${res.status}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map(
    (s: { id: string | number; name: string }) => ({
      id: String(s.id),
      name: String(s.name),
    })
  );
};

export const getCities = async (
  stateId: string
): Promise<GeoItem[]> => {
  const res = await fetch(
    `${LOCATION_API_BASE}?gofor=citieslist&state_id=${encodeURIComponent(stateId)}`
  );
  if (!res.ok) throw new Error(`getCities failed: ${res.status}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map(
    (c: { id: string | number; name: string }) => ({
      id: String(c.id),
      name: String(c.name),
    })
  );
};
