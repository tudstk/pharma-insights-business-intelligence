import type { SalesData, MedicineCategory } from "@/utils/csvParser";
import { exportToExcel } from "./exportExcel";
import {
  KpiRules,
  formatValueByRules,
  filterByKpiRules,
} from "./kpiConfig";

export type GeoPoint = {
  city: string;
  country: string;
  lat: number;
  lng: number;
  totalSales: number;
  category: MedicineCategory | "all";
};

export type CountryPoint = {
  country: string;
  totalSales: number;
  category: MedicineCategory | "all";
};

function sumRow(row: SalesData, selectedCategory: MedicineCategory | "all") {
  if (selectedCategory !== "all") {
    const v = row[selectedCategory];
    return typeof v === "number" && Number.isFinite(v) ? v : 0;
  }

  let total = 0;

  const keys = [
    "M01AB",
    "M01AE",
    "N02BA",
    "N02BE",
    "N05B",
    "N05C",
    "R03",
    "R06",
  ] as const;

  for (const k of keys) {
    const v = row[k];
    if (typeof v === "number" && Number.isFinite(v)) total += v;
  }

  return total;
}

export function aggregateSalesByCity(
  rows: SalesData[],
  selectedCategory: MedicineCategory | "all" = "all",
): GeoPoint[] {
  const map = new Map<string, GeoPoint>();

  rows.forEach((row) => {
    const city = row.city?.trim();
    const country = row.country?.trim();
    const lat = row.lat;
    const lng = row.lng;

    // ✅ nu acceptăm 0,0 sau undefined
    if (!city || !country) return;
    if (typeof lat !== "number" || typeof lng !== "number") return;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const key = `${city}__${country}`;

    if (!map.has(key)) {
      map.set(key, {
        city,
        country,
        lat,
        lng,
        totalSales: 0,
        category: selectedCategory,
      });
    }

    map.get(key)!.totalSales += sumRow(row, selectedCategory);
  });

  return Array.from(map.values());
}

export function aggregateSalesByCountry(
  rows: SalesData[],
  selectedCategory: MedicineCategory | "all" = "all",
): CountryPoint[] {
  const map = new Map<string, CountryPoint>();

  rows.forEach((row) => {
    const country = row.country?.trim();
    if (!country) return;

    if (!map.has(country)) {
      map.set(country, {
        country,
        totalSales: 0,
        category: selectedCategory,
      });
    }

    map.get(country)!.totalSales += sumRow(row, selectedCategory);
  });

  return Array.from(map.values());
}

export function exportCityStatistics(
  geoPoints: GeoPoint[],
  selectedCategory: MedicineCategory | "all" = "all",
  kpiRules?: KpiRules
) {
  if (!geoPoints.length) {
    console.warn("No city data available to export");
    return;
  }

  // Apply KPI filters if provided
  let filteredPoints = geoPoints;
  if (kpiRules?.excludeBelowThreshold && kpiRules?.minValue !== undefined) {
    filteredPoints = geoPoints.filter(
      (p) => p.totalSales >= kpiRules.minValue!
    );
  }

  const exportData = filteredPoints.map((point) => ({
    City: point.city,
    Country: point.country,
    Latitude: point.lat.toFixed(6),
    Longitude: point.lng.toFixed(6),
    "Total Sales": kpiRules
      ? formatValueByRules(point.totalSales, kpiRules)
      : point.totalSales.toFixed(2),
    Category: selectedCategory === "all" ? "All Categories" : selectedCategory,
    "Highlight":
      kpiRules?.highlightThreshold &&
      point.totalSales >= kpiRules.highlightThreshold
        ? "YES"
        : "NO",
  }));

  const categoryLabel =
    selectedCategory === "all" ? "All" : selectedCategory;
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `city-statistics-${categoryLabel}-${timestamp}`;

  exportToExcel(exportData, filename);
}
