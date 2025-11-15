import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { MEDICINE_CATEGORIES, type SalesData } from "@/utils/csvParser";

interface PieChartDistributionProps {
  data: SalesData[];
}

export const PieChartDistribution = ({ data }: PieChartDistributionProps) => {
  const distribution = MEDICINE_CATEGORIES.map(cat => {
    const total = data.reduce((sum, row) => sum + (row[cat.id as keyof SalesData] as number || 0), 0);
    return {
      name: cat.name,
      value: parseFloat(total.toFixed(2)),
      color: `hsl(var(--${cat.color}))`,
    };
  }).filter(d => d.value > 0);

  const totalSales = distribution.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="p-6 shadow-lg border-border/50">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-foreground">Sales Distribution</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Market share by medicine category
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={distribution}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name.split('(')[0].trim()}: ${(percent * 100).toFixed(1)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            animationDuration={800}
          >
            {distribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.75rem',
              boxShadow: 'var(--shadow-md)',
            }}
            formatter={(value: number) => [
              `${value.toFixed(2)} (${((value / totalSales) * 100).toFixed(1)}%)`,
              'Sales'
            ]}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => value.split('(')[0].trim()}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};
