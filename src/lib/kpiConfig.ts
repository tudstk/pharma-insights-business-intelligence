export interface KpiRules {
  minValue?: number;
  maxValue?: number;
  minGrowth?: number;
  minPeak?: number;
  // New formatting rules
  formatCurrency?: boolean;
  currencySymbol?: string;
  decimalPlaces?: number;
  highlightThreshold?: number; // Value above which to highlight
  excludeBelowThreshold?: boolean; // Exclude rows below threshold from export
}

export interface KpiRuleSet {
  name: string;
  rules: KpiRules;
  createdAt: number;
}

export const defaultKpiRules: KpiRules = {
  minValue: 0,
  maxValue: 999999,
  minGrowth: 0,
  minPeak: 0,
  formatCurrency: true,
  currencySymbol: "$",
  decimalPlaces: 2,
  highlightThreshold: 1000,
  excludeBelowThreshold: false,
};

/**
 * Format a value according to KPI rules
 */
export function formatValueByRules(value: number, rules: KpiRules): string {
  if (rules.formatCurrency) {
    const formatted = value.toFixed(rules.decimalPlaces || 2);
    return `${rules.currencySymbol || "$"}${formatted}`;
  }
  return value.toFixed(rules.decimalPlaces || 2);
}

/**
 * Check if a value meets KPI criteria
 */
export function meetsKpiCriteria(
  value: number,
  rules: KpiRules
): {
  meets: boolean;
  reason?: string;
} {
  if (rules.minValue !== undefined && value < rules.minValue) {
    return { meets: false, reason: `Below minimum (${rules.minValue})` };
  }
  if (rules.maxValue !== undefined && value > rules.maxValue) {
    return { meets: false, reason: `Exceeds maximum (${rules.maxValue})` };
  }
  return { meets: true };
}

/**
 * Filter export data by KPI rules
 */
export function filterByKpiRules<T extends Record<string, any>>(
  data: T[],
  rules: KpiRules,
  valueKey: string = "totalSales"
): T[] {
  if (!rules.excludeBelowThreshold) return data;

  return data.filter((item) => {
    const value = item[valueKey];
    if (typeof value !== "number") return true;
    return meetsKpiCriteria(value, rules).meets;
  });
}
