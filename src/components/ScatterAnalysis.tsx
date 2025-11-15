import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts";
import { MEDICINE_CATEGORIES, type SalesData, type MedicineCategory } from "@/utils/csvParser";

interface ScatterAnalysisProps {
  data: SalesData[];
}

export const ScatterAnalysis = ({ data }: ScatterAnalysisProps) => {
  const [xCategory, setXCategory] = useState<MedicineCategory>(MEDICINE_CATEGORIES[0].id);
  const [yCategory, setYCategory] = useState<MedicineCategory>(MEDICINE_CATEGORIES[3].id);

  const scatterData = data.map((row, index) => ({
    x: row[xCategory as keyof SalesData] as number || 0,
    y: row[yCategory as keyof SalesData] as number || 0,
    z: index,
  }));

  return (
    <Card className="p-6 shadow-lg border-border/50">
      <div className="space-y-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Scatter Plot Analysis</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Explore relationships between different medicine categories
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-foreground mb-2 block">X-Axis Category</label>
            <Select value={xCategory} onValueChange={(v: any) => setXCategory(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEDICINE_CATEGORIES.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-foreground mb-2 block">Y-Axis Category</label>
            <Select value={yCategory} onValueChange={(v: any) => setYCategory(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEDICINE_CATEGORIES.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            type="number" 
            dataKey="x" 
            name={xCategory}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            label={{ value: xCategory, position: 'bottom', fill: 'hsl(var(--foreground))' }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name={yCategory}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            label={{ value: yCategory, angle: -90, position: 'left', fill: 'hsl(var(--foreground))' }}
          />
          <ZAxis range={[50, 400]} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.75rem',
              boxShadow: 'var(--shadow-md)',
            }}
            formatter={(value: number, name: string) => [value.toFixed(2), name]}
          />
          <Scatter 
            name="Sales Relationship" 
            data={scatterData} 
            fill="hsl(var(--primary))"
            fillOpacity={0.6}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </Card>
  );
};
