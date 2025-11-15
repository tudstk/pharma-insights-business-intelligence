import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { MEDICINE_CATEGORIES, type SalesData } from "@/utils/csvParser";

interface PriceSimulatorProps {
  data: SalesData[];
}

export const PriceSimulator = ({ data }: PriceSimulatorProps) => {
  const [priceChanges, setPriceChanges] = useState<Record<string, number>>(
    Object.fromEntries(MEDICINE_CATEGORIES.map(cat => [cat.id, 0]))
  );

  // Calculate baseline sales
  const baselineSales = MEDICINE_CATEGORIES.map(cat => ({
    category: cat.name,
    baseline: data.reduce((sum, row) => sum + (row[cat.id as keyof SalesData] as number || 0), 0),
    id: cat.id,
    color: `hsl(var(--${cat.color}))`,
  }));

  // Apply price elasticity (simplified model: -1.5 elasticity)
  const simulatedSales = baselineSales.map(cat => {
    const priceChange = priceChanges[cat.id] / 100;
    const elasticity = -1.5; // Price elasticity coefficient
    const salesChange = elasticity * priceChange;
    const projected = cat.baseline * (1 + salesChange);
    
    return {
      ...cat,
      projected: Math.max(0, projected),
      change: ((projected - cat.baseline) / cat.baseline) * 100,
    };
  });

  return (
    <Card className="p-6 shadow-lg border-border/50">
      <div className="space-y-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Price Impact Simulator</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Adjust prices to see projected impact on sales volume
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {MEDICINE_CATEGORIES.map(cat => (
            <div key={cat.id} className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {cat.name}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-12">-50%</span>
                <Slider
                  value={[priceChanges[cat.id]]}
                  onValueChange={([v]) => setPriceChanges(prev => ({ ...prev, [cat.id]: v }))}
                  min={-50}
                  max={50}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-12 text-right">+50%</span>
              </div>
              <div className="text-center">
                <span className={`text-sm font-semibold ${
                  priceChanges[cat.id] === 0 ? 'text-muted-foreground' :
                  priceChanges[cat.id] > 0 ? 'text-destructive' : 'text-secondary'
                }`}>
                  {priceChanges[cat.id] > 0 ? '+' : ''}{priceChanges[cat.id]}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={simulatedSales} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey="category" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.75rem',
              boxShadow: 'var(--shadow-md)',
            }}
            formatter={(value: number, name: string) => [
              value.toFixed(2),
              name === 'baseline' ? 'Current Sales' : 'Projected Sales'
            ]}
          />
          <Legend />
          <Bar dataKey="baseline" fill="hsl(var(--muted))" name="Current Sales" radius={[8, 8, 0, 0]} />
          <Bar dataKey="projected" name="Projected Sales" radius={[8, 8, 0, 0]}>
            {simulatedSales.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.change >= 0 ? 'hsl(var(--secondary))' : 'hsl(var(--destructive))'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {simulatedSales.map(cat => (
          <div key={cat.id} className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">{cat.category}</p>
            <p className={`text-lg font-bold ${
              cat.change >= 0 ? 'text-secondary' : 'text-destructive'
            }`}>
              {cat.change >= 0 ? '+' : ''}{cat.change.toFixed(1)}%
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};
