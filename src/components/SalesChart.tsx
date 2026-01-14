import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  MEDICINE_CATEGORIES,
  type SalesData,
  type MedicineCategory,
} from "@/utils/csvParser";
import { exportToExcel } from "@/lib/exportExcel";
import { enrichRowsWithGeo } from "@/lib/enrichGeoRows";

interface SalesChartProps {
  data: SalesData[];
  selectedCategory: MedicineCategory | "all";
  timeView: "daily" | "weekly" | "monthly";
}

export const SalesChart = ({ data, selectedCategory, timeView }: SalesChartProps) => {
  const chartData = data.map((row) => {
    const point: any = { date: row.datum };

    if (selectedCategory === "all") {
      MEDICINE_CATEGORIES.forEach((cat) => {
        point[cat.id] = (row[cat.id as keyof SalesData] as number) || 0;
      });
    } else {
      point[selectedCategory] =
        (row[selectedCategory as keyof SalesData] as number) || 0;
    }

    return point;
  });

  const allValues = chartData.flatMap((point) =>
    Object.entries(point)
      .filter(([key]) => key !== "date")
      .map(([, value]) => value as number),
  );
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues.filter((v) => v > 0));

  const categoriesToShow =
    selectedCategory === "all"
      ? MEDICINE_CATEGORIES
      : MEDICINE_CATEGORIES.filter((c) => c.id === selectedCategory);

  const handleExport = () => {
    if (!data.length) return;

    // ✅ Exportăm "excel-ul existent" (salesdaily/salesweekly/salesmonthly) + coloane GEO
    const enriched = enrichRowsWithGeo(data);

    // ✅ păstrăm și contextul categoriei, ca să fie evident la prezentare
    const rows = enriched.map((r) => ({
      ...r,
      selectedCategory,
      timeView,
    }));

    const fileName = `sales-${timeView}-${selectedCategory}-with-geo.xlsx`;
    exportToExcel(rows as any, fileName);
  };

  return (
    <Card className="p-6 shadow-lg border-border/50">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            Sales Trend Analysis
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track sales performance over time with peak and minimum indicators
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="self-start md:self-auto"
        >
          Export Excel
        </Button>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            opacity={0.3}
          />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(value) => {
              if (timeView === "monthly") return String(value).slice(0, 7);
              if (timeView === "weekly") return String(value).slice(0, 5);
              return String(value).slice(0, 5);
            }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.75rem",
              boxShadow: "var(--shadow-md)",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />
          <ReferenceLine
            y={maxValue}
            stroke="hsl(var(--secondary))"
            strokeDasharray="5 5"
            label={{
              value: "Peak",
              position: "right",
              fill: "hsl(var(--secondary))",
            }}
          />

          {categoriesToShow.map((cat) => (
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
