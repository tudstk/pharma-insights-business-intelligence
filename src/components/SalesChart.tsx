import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { MEDICINE_CATEGORIES, type SalesData, type MedicineCategory } from "@/utils/csvParser";

interface SalesChartProps {
  data: SalesData[];
  selectedCategory: MedicineCategory | "all";
  timeView: "daily" | "weekly" | "monthly";
}

export const SalesChart = ({ data, selectedCategory, timeView }: SalesChartProps) => {
  const chartData = data.map(row => {
    const point: any = {
      date: row.datum,
    };

    if (selectedCategory === "all") {
      MEDICINE_CATEGORIES.forEach(cat => {
        point[cat.id] = row[cat.id as keyof SalesData] || 0;
      });
    } else {
      point[selectedCategory] = row[selectedCategory as keyof SalesData] || 0;
    }

    return point;
  });

  // Calculate peak and minimum values
  const allValues = chartData.flatMap(point => 
    Object.entries(point)
      .filter(([key]) => key !== 'date')
      .map(([_, value]) => value as number)
  );
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues.filter(v => v > 0));

  const categoriesToShow = selectedCategory === "all" 
    ? MEDICINE_CATEGORIES 
    : MEDICINE_CATEGORIES.filter(c => c.id === selectedCategory);

  return (
    <Card className="p-6 shadow-lg border-border/50">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-foreground">Sales Trend Analysis</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Track sales performance over time with peak and minimum indicators
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          <ReferenceLine 
            y={maxValue} 
            stroke="hsl(var(--secondary))" 
            strokeDasharray="5 5"
            label={{ value: 'Peak', position: 'right', fill: 'hsl(var(--secondary))' }}
          />
          {categoriesToShow.map((cat, index) => (
            <Line
              key={cat.id}
              type="monotone"
              dataKey={cat.id}
              name={cat.name}
              stroke={`hsl(var(--${cat.color}))`}
              strokeWidth={2}
              dot={{ fill: `hsl(var(--${cat.color}))`, r: 4 }}
              activeDot={{ r: 6, fill: `hsl(var(--${cat.color}))` }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
