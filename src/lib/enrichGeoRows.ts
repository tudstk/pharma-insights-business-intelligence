import type { SalesData } from "@/utils/csvParser";
import { CITY_COORDS } from "@/data/geoLocations";

const CITY_LIST = Object.entries(CITY_COORDS).map(([city, value]) => ({
  city,
  country: value.country,
  lat: value.lat,
  lng: value.lng,
}));

export type SalesRowWithGeo = SalesData & {
  city: string;
  country: string;
  lat: number;
  lng: number;
};

export function enrichRowsWithGeo(rows: SalesData[]): SalesRowWithGeo[] {
  if (!rows.length || CITY_LIST.length === 0) return [];

  return rows.map((row, index) => {
    const base = CITY_LIST[index % CITY_LIST.length];
    return {
      ...row,
      city: base.city,
      country: base.country,
      lat: base.lat,
      lng: base.lng,
    };
  });
}
