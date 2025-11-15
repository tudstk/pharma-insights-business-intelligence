import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { MEDICINE_CATEGORIES, type SalesData } from "@/utils/csvParser";

interface CategoryComparisonProps {
  data: SalesData[];
  timeView: "daily" | "weekly" | "monthly";
}

export const CategoryComparison = ({ data, timeView }: CategoryComparisonProps) => {
  const categoryTotals = MEDICINE_CATEGORIES.map(cat => {
    const total = data.reduce((sum, row) => sum + (row[cat.id as keyof SalesData] as number || 0), 0);
    return {
      category: cat.name,
      total: parseFloat(total.toFixed(2)),
      color: `hsl(var(--${cat.color}))`,
    };
  });

  // Sort by total descending
  categoryTotals.sort((a, b) => b.total - a.total);

  return (
    <Card className="p-6 shadow-lg border-border/50">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-foreground">Category Comparison</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Total sales by medicine category for the selected period
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={categoryTotals} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey="category" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
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
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value: number) => [value.toFixed(2), 'Total Sales']}
          />
          <Bar 
            dataKey="total" 
            radius={[8, 8, 0, 0]}
            animationDuration={800}
          >
            {categoryTotals.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
