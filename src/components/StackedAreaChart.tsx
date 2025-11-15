import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { MEDICINE_CATEGORIES, type SalesData } from "@/utils/csvParser";

interface StackedAreaChartProps {
  data: SalesData[];
  timeView: "daily" | "weekly" | "monthly";
}

export const StackedAreaChart = ({ data, timeView }: StackedAreaChartProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    MEDICINE_CATEGORIES.map(c => c.id)
  );

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const chartData = data.map(row => {
    const point: any = { date: row.datum };
    MEDICINE_CATEGORIES.forEach(cat => {
      if (selectedCategories.includes(cat.id)) {
        point[cat.id] = row[cat.id as keyof SalesData] || 0;
      }
    });
    return point;
  });

  return (
    <Card className="p-6 shadow-lg border-border/50">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-foreground">Stacked Sales Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Cumulative sales trends across all categories
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-4">
        {MEDICINE_CATEGORIES.map(cat => (
          <div key={cat.id} className="flex items-center space-x-2">
            <Checkbox
              id={cat.id}
              checked={selectedCategories.includes(cat.id)}
              onCheckedChange={() => toggleCategory(cat.id)}
            />
            <label
              htmlFor={cat.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {cat.name}
            </label>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            {MEDICINE_CATEGORIES.map(cat => (
              <linearGradient key={cat.id} id={`gradient-${cat.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={`hsl(var(--${cat.color}))`} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={`hsl(var(--${cat.color}))`} stopOpacity={0.2}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value) => {
              if (timeView === "monthly") return value.slice(0, 7);
              if (timeView === "weekly") return value.slice(0, 5);
              return value.slice(0, 5);
            }}
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
          />
          <Legend />
          {MEDICINE_CATEGORIES.filter(cat => selectedCategories.includes(cat.id)).map(cat => (
            <Area
              key={cat.id}
              type="monotone"
              dataKey={cat.id}
              stackId="1"
              stroke={`hsl(var(--${cat.color}))`}
              fill={`url(#gradient-${cat.id})`}
              name={cat.name}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};
