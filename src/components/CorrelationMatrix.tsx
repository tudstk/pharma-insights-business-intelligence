
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { MEDICINE_CATEGORIES, type SalesData } from "@/utils/csvParser";

interface CorrelationMatrixProps {
  data: SalesData[];
}

export const CorrelationMatrix = ({ data }: CorrelationMatrixProps) => {
  const [displayMode, setDisplayMode] = useState<'color' | 'symbol' | 'both'>('color');
  // Calculate correlation between categories
  const calculateCorrelation = (cat1: string, cat2: string): number => {
    const values1 = data.map(row => row[cat1 as keyof SalesData] as number || 0);
    const values2 = data.map(row => row[cat2 as keyof SalesData] as number || 0);

    const mean1 = values1.reduce((a, b) => a + b, 0) / values1.length;
    const mean2 = values2.reduce((a, b) => a + b, 0) / values2.length;

    const numerator = values1.reduce((sum, val, i) => 
      sum + (val - mean1) * (values2[i] - mean2), 0
    );

    const denom1 = Math.sqrt(values1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0));
    const denom2 = Math.sqrt(values2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0));

    return numerator / (denom1 * denom2);
  };

  const getColor = (correlation: number) => {
    if (displayMode === 'symbol') return '';
    const abs = Math.abs(correlation);
    if (abs > 0.7) return correlation > 0 ? 'bg-secondary/80' : 'bg-destructive/80';
    if (abs > 0.4) return correlation > 0 ? 'bg-secondary/50' : 'bg-destructive/50';
    if (abs > 0.2) return correlation > 0 ? 'bg-secondary/30' : 'bg-destructive/30';
    return 'bg-muted';
  };

  const getSymbol = (correlation: number) => {
    if (displayMode === 'color') return '';
    if (correlation > 0.7) return '⬆️';
    if (correlation < -0.7) return '⬇️';
    if (correlation > 0.4) return '↗️';
    if (correlation < -0.4) return '↘️';
    if (correlation > 0.2) return '➡️';
    if (correlation < -0.2) return '⬅️';
    return '•';
  };

  return (
    <Card className="p-6 shadow-lg border-border/50">
      <div className="mb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Category Correlation Matrix</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Correlation coefficients between medicine categories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="displayMode" className="text-xs font-medium text-muted-foreground">Display:</label>
          <select
            id="displayMode"
            value={displayMode}
            onChange={e => setDisplayMode(e.target.value as any)}
            className="border rounded px-2 py-1 text-xs"
          >
            <option value="color">Color</option>
            <option value="symbol">Symbol</option>
            <option value="both">Both</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left text-xs font-medium text-muted-foreground border-b border-border"></th>
              {MEDICINE_CATEGORIES.map(cat => (
                <th key={cat.id} className="p-2 text-center text-xs font-medium text-muted-foreground border-b border-border">
                  {cat.id}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEDICINE_CATEGORIES.map(cat1 => (
              <tr key={cat1.id}>
                <td className="p-2 text-xs font-medium text-muted-foreground border-r border-border">
                  {cat1.id}
                </td>
                {MEDICINE_CATEGORIES.map(cat2 => {
                  const correlation = cat1.id === cat2.id ? 1 : calculateCorrelation(cat1.id, cat2.id);
                  return (
                    <td
                      key={cat2.id}
                      className={`p-2 text-center text-xs font-semibold border border-border ${getColor(correlation)} transition-colors`}
                      title={`Correlation: ${correlation.toFixed(3)}`}
                    >
                      {displayMode === 'color' && correlation.toFixed(2)}
                      {displayMode === 'symbol' && getSymbol(correlation)}
                      {displayMode === 'both' && <span>{correlation.toFixed(2)} {getSymbol(correlation)}</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-secondary/80 rounded"></div>
          <span className="text-muted-foreground">Strong Positive (&gt;0.7)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-muted rounded"></div>
          <span className="text-muted-foreground">Weak (0.2-0.4)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-destructive/80 rounded"></div>
          <span className="text-muted-foreground">Strong Negative (&lt;-0.7)</span>
        </div>
      </div>
    </Card>
  );
};
