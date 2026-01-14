export interface SalesData {
  datum: string;

  // categorii medicamente
  M01AB: number;
  M01AE: number;
  N02BA: number;
  N02BE: number;
  N05B: number;
  N05C: number;
  R03: number;
  R06: number;

  // extra
  Year?: number;
  Month?: number;
  Hour?: number;
  "Weekday Name"?: string;

  // ✅ GEO (din excel/csv)
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
}

const STRING_HEADERS = new Set(["datum", "Weekday Name", "city", "country"]);
const NUMBER_HEADERS = new Set([
  "M01AB",
  "M01AE",
  "N02BA",
  "N02BE",
  "N05B",
  "N05C",
  "R03",
  "R06",
  "Year",
  "Month",
  "Hour",
  "lat",
  "lng",
]);

function clean(s: string | undefined) {
  return (s ?? "").trim();
}

function toNumber(v: string | undefined): number | undefined {
  const t = clean(v);
  if (!t) return undefined;

  // suportă "12,34" și "12.34"
  const normalized = t.replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : undefined;
}

export const parseCsvData = (csvText: string): SalesData[] => {
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(","); // ok pt dataset simplu (fără virgule în câmpuri text)
    const obj: any = {};

    headers.forEach((header, index) => {
      const raw = values[index];

      if (STRING_HEADERS.has(header)) {
        obj[header] = clean(raw) || undefined;
        return;
      }

      if (NUMBER_HEADERS.has(header)) {
        const n = toNumber(raw);
        obj[header] = n ?? 0; // pt categorii e ok să fie 0; pt lat/lng mai jos le lăsăm undefined dacă lipsesc
        return;
      }

      // fallback: încearcă number, altfel string
      const n = toNumber(raw);
      const s = clean(raw);
      obj[header] = (n !== null && n !== undefined) ? n : (s || undefined);

    });

    // ✅ IMPORTANT: dacă lat/lng lipsesc în CSV, NU le forța 0 (că 0,0 e în ocean)
    if (obj.lat === 0 && clean(values[headers.indexOf("lat")]) === "") obj.lat = undefined;
    if (obj.lng === 0 && clean(values[headers.indexOf("lng")]) === "") obj.lng = undefined;

    return obj as SalesData;
  });
};

export const MEDICINE_CATEGORIES = [
  { id: "M01AB", name: "Anti-inflammatory (M01AB)", color: "chart-1" },
  { id: "M01AE", name: "Anti-inflammatory (M01AE)", color: "chart-2" },
  { id: "N02BA", name: "Analgesics (N02BA)", color: "chart-3" },
  { id: "N02BE", name: "Analgesics (N02BE)", color: "chart-4" },
  { id: "N05B", name: "Anxiolytics (N05B)", color: "chart-5" },
  { id: "N05C", name: "Sedatives (N05C)", color: "chart-6" },
  { id: "R03", name: "Respiratory (R03)", color: "chart-7" },
  { id: "R06", name: "Antihistamines (R06)", color: "chart-8" },
] as const;

export type MedicineCategory = (typeof MEDICINE_CATEGORIES)[number]["id"];
