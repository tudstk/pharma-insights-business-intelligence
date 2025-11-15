import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { MEDICINE_CATEGORIES, type SalesData } from "@/utils/csvParser";

interface RadarComparisonProps {
  data: SalesData[];
}

export const RadarComparison = ({ data }: RadarComparisonProps) => {
  const [dataRange, setDataRange] = useState([0, Math.min(100, data.length)]);

  const selectedData = data.slice(dataRange[0], dataRange[1]);

  const radarData = MEDICINE_CATEGORIES.map(cat => {
    const total = selectedData.reduce((sum, row) => sum + (row[cat.id as keyof SalesData] as number || 0), 0);
    const avg = total / selectedData.length;
    const max = Math.max(...selectedData.map(row => row[cat.id as keyof SalesData] as number || 0));
    
    return {
      category: cat.id,
      average: parseFloat(avg.toFixed(2)),
      peak: max,
      fullName: cat.name,
    };
  });

  return (
    <Card className="p-6 shadow-lg border-border/50">
      <div className="space-y-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Multi-dimensional Comparison</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Radar chart comparing average and peak sales across categories
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Data Range: Records {dataRange[0]} to {dataRange[1]} of {data.length}
          </label>
          <Slider
            value={dataRange}
            onValueChange={setDataRange}
            min={0}
            max={data.length}
            step={1}
            className="mt-2"
            minStepsBetweenThumbs={10}
          />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis 
            dataKey="category" 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 'auto']}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Radar
            name="Average Sales"
            dataKey="average"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.5}
            strokeWidth={2}
          />
          <Radar
            name="Peak Sales"
            dataKey="peak"
            stroke="hsl(var(--secondary))"
            fill="hsl(var(--secondary))"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.75rem',
              boxShadow: 'var(--shadow-md)',
            }}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </Card>
  );
};
