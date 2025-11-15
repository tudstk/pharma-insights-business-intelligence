import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { linearRegressionForecast, movingAverageForecast, exponentialSmoothing, type ForecastPoint } from "@/utils/forecasting";
import { type SalesData, type MedicineCategory, MEDICINE_CATEGORIES } from "@/utils/csvParser";

interface ForecastChartProps {
  data: SalesData[];
  selectedCategory: MedicineCategory;
}

export const ForecastChart = ({ data, selectedCategory }: ForecastChartProps) => {
  const [forecastMethod, setForecastMethod] = useState<"linear" | "moving" | "exponential">("linear");
  const [forecastPeriods, setForecastPeriods] = useState(30);

  const historicalData = data.map(row => ({
    date: row.datum,
    actual: row[selectedCategory as keyof SalesData] as number || 0,
  }));

  const actualValues = historicalData.map(d => d.actual);
  
  let forecastData: ForecastPoint[] = [];
  switch (forecastMethod) {
    case "linear":
      forecastData = linearRegressionForecast(actualValues, forecastPeriods);
      break;
    case "moving":
      forecastData = movingAverageForecast(actualValues, 7, forecastPeriods);
      break;
    case "exponential":
      forecastData = exponentialSmoothing(actualValues, 0.3, forecastPeriods);
      break;
  }

  // Combine historical and forecast data
  const combinedData = [
    ...historicalData.slice(-60).map(d => ({ ...d, forecast: null, lowerBound: null, upperBound: null })),
    ...forecastData.map(d => ({ ...d, actual: null })),
  ];

  return (
    <Card className="p-6 shadow-lg border-border/50">
      <div className="space-y-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Sales Forecasting</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Predict future sales using advanced statistical methods
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Forecast Method
            </label>
            <Select value={forecastMethod} onValueChange={(v: any) => setForecastMethod(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linear">Linear Regression</SelectItem>
                <SelectItem value="moving">Moving Average</SelectItem>
                <SelectItem value="exponential">Exponential Smoothing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Forecast Periods: {forecastPeriods} days
            </label>
            <Slider
              value={[forecastPeriods]}
              onValueChange={([v]) => setForecastPeriods(v)}
              min={7}
              max={90}
              step={1}
              className="mt-2"
            />
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={combinedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
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
          <Area
            type="monotone"
            dataKey="upperBound"
            stackId="1"
            stroke="none"
            fill="url(#colorConfidence)"
            name="Upper Confidence"
          />
          <Area
            type="monotone"
            dataKey="lowerBound"
            stackId="1"
            stroke="none"
            fill="url(#colorConfidence)"
            name="Lower Confidence"
          />
          <Area
            type="monotone"
            dataKey="actual"
            stroke="hsl(var(--primary))"
            fill="url(#colorActual)"
            strokeWidth={2}
            name="Historical Sales"
          />
          <Area
            type="monotone"
            dataKey="forecast"
            stroke="hsl(var(--secondary))"
            fill="url(#colorForecast)"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Forecasted Sales"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};
