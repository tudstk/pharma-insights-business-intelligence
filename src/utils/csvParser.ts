export interface SalesData {
  datum: string;
  M01AB: number;
  M01AE: number;
  N02BA: number;
  N02BE: number;
  N05B: number;
  N05C: number;
  R03: number;
  R06: number;
  Year?: number;
  Month?: number;
  Hour?: number;
  'Weekday Name'?: string;
}

export const parseCsvData = (csvText: string): SalesData[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj: any = {};
    
    headers.forEach((header, index) => {
      const value = values[index];
      if (header === 'datum' || header === 'Weekday Name') {
        obj[header] = value;
      } else {
        obj[header] = parseFloat(value) || 0;
      }
    });
    
    return obj as SalesData;
  });
};

export const MEDICINE_CATEGORIES = [
  { id: 'M01AB', name: 'Anti-inflammatory (M01AB)', color: 'chart-1' },
  { id: 'M01AE', name: 'Anti-inflammatory (M01AE)', color: 'chart-2' },
  { id: 'N02BA', name: 'Analgesics (N02BA)', color: 'chart-3' },
  { id: 'N02BE', name: 'Analgesics (N02BE)', color: 'chart-4' },
  { id: 'N05B', name: 'Anxiolytics (N05B)', color: 'chart-5' },
  { id: 'N05C', name: 'Sedatives (N05C)', color: 'chart-6' },
  { id: 'R03', name: 'Respiratory (R03)', color: 'chart-7' },
  { id: 'R06', name: 'Antihistamines (R06)', color: 'chart-8' },
] as const;

export type MedicineCategory = typeof MEDICINE_CATEGORIES[number]['id'];
