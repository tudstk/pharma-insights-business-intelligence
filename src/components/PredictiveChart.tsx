import { useMemo, useRef, useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendSelector } from "./TrendSelector";
import html2canvas from "html2canvas";
import type { SalesData, MedicineCategory } from "@/utils/csvParser";
import { generateForecast, type TrendConfig } from "@/utils/forecasting";
import { exportToExcel } from "@/lib/exportExcel";

interface Props {
  data: SalesData[];
  selectedCategory: MedicineCategory | "all";
  timeView: "daily" | "weekly" | "monthly";
}

interface ChartDataPoint {
  date: string;
  actual?: number;
  forecast?: number;
  lowerBound?: number;
  upperBound?: number;
  trend?: string;
  isForecasted: boolean;
}

interface DateRange {
  startDate: string;
  endDate: string;
}


// Extract sales data for the selected category (move above hooks to avoid ReferenceError)
function extractSalesData(data: SalesData[], selectedCategory: MedicineCategory | "all") {
  const categories =
    selectedCategory === "all"
      ? ["M01AB", "M01AE", "N02BA", "N02BE", "N05B", "N05C", "R03", "R06"]
      : [selectedCategory];

  return data.map((row) => {
    let total = 0;
    for (const cat of categories) {
      const value = row[cat as keyof SalesData];
      if (typeof value === "number") total += value;
    }
    return {
      date: row.datum || "",
      value: total,
      timestamp: new Date(row.datum || "").getTime(),
    };
  });
}

export const PredictiveChart = ({
  data,
  selectedCategory,
  timeView,
}: Props) => {
  const chartCardRef = useRef<HTMLDivElement>(null);
  const chartOnlyRef = useRef<HTMLDivElement>(null);
  const [trendConfig, setTrendConfig] = useState<TrendConfig>({
    type: "linear",
  });
  const [chartType, setChartType] = useState<"line" | "area" | "composed">(
    "line"
  );
  const [forecastPeriods, setForecastPeriods] = useState(30);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: "",
    endDate: "",
  });
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange>({
    startDate: "",
    endDate: "",
  });

  // Compute if the selected interval is valid (at least 2 data points)
  // Allow interval if it is in the future and there is at least 2 historical data points to base the prediction on
  const isIntervalValid = useMemo(() => {
    const salesData = extractSalesData(data, selectedCategory);
    if (!dateRange.startDate && !dateRange.endDate) return true;
    const start = dateRange.startDate ? new Date(dateRange.startDate).getTime() : 0;
    const end = dateRange.endDate ? new Date(dateRange.endDate).getTime() : Date.now();
    const filtered = salesData.filter((item) => {
      if (item.timestamp === 0 || isNaN(item.timestamp)) return true;
      return item.timestamp >= start && item.timestamp <= end;
    });
    // If the interval is in the future (no data), allow as long as there are at least 2 historical data points
    if (filtered.length === 0 && salesData.length >= 2 && start > salesData[salesData.length - 1].timestamp) {
      return true;
    }
    return filtered.length >= 2;
  }, [data, selectedCategory, dateRange]);



  // Export predictive data (actual + forecast) as Excel
  const handleExportData = () => {
    if (!chartData.length) return;
    // Remove React-only fields if needed
    const exportRows = chartData.map(({ isForecasted, ...rest }) => rest);
    exportToExcel(exportRows, `predictive-data-${selectedCategory}-${timeView}.xlsx`);
  };

  const handleExportPNG = async () => {
    if (!chartOnlyRef.current) return;
    try {
      chartOnlyRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      await new Promise((resolve) => setTimeout(resolve, 350));
      const canvas = await html2canvas(chartOnlyRef.current, { backgroundColor: null, useCORS: true });
      const link = document.createElement("a");
      link.download = `predictive-chart-${selectedCategory}-${timeView}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  // Filter data by date range
  const filterDataByDateRange = (salesData: Array<{ date: string; value: number; timestamp: number }>) => {
    // If no date range is set, return all data
    if (!dateRange.startDate && !dateRange.endDate) {
      return salesData;
    }

    try {
      const start = dateRange.startDate ? new Date(dateRange.startDate).getTime() : 0;
      const end = dateRange.endDate ? new Date(dateRange.endDate).getTime() : Date.now();

      const filtered = salesData.filter((item) => {
        // Only filter if we have valid dates in the data
        if (item.timestamp === 0 || isNaN(item.timestamp)) return true;
        return item.timestamp >= start && item.timestamp <= end;
      });

      console.log("Filtering:", {
        totalData: salesData.length,
        filtered: filtered.length,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        startTime: new Date(start).toString(),
        endTime: new Date(end).toString()
      });

      return filtered.length > 0 ? filtered : salesData;
    } catch (err) {
      console.error("Date filtering error:", err);
      return salesData;
    }
  };

  // Generate chart data with forecasts only for the applied date interval
  const chartData = useMemo(() => {
    try {
      const salesData = extractSalesData(data, selectedCategory);
      const start = appliedDateRange.startDate ? new Date(appliedDateRange.startDate).getTime() : 0;
      const end = appliedDateRange.endDate ? new Date(appliedDateRange.endDate).getTime() : Date.now();
      // If the selected interval is entirely in the future (no actual data), use all historical data for prediction
      const lastActualTimestamp = salesData.length > 0 ? salesData[salesData.length - 1].timestamp : 0;
      const intervalIsFuture = start > lastActualTimestamp;
      if (intervalIsFuture && salesData.length >= 2) {
        // Predict for the interval length
        const intervalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        const forecast = generateForecast(salesData.map((item) => item.value), trendConfig, intervalDays);
        // Generate future dates for the forecast
        const combined: ChartDataPoint[] = forecast.map((point, idx) => {
          const date = new Date(start + idx * 24 * 60 * 60 * 1000);
          return {
            date: date.toLocaleDateString(),
            actual: undefined,
            forecast: point.forecast,
            lowerBound: point.lowerBound,
            upperBound: point.upperBound,
            trend: point.trend,
            isForecasted: true,
          };
        });
        return combined;
      }
      // Otherwise, use the original logic for intervals with actual data
      const filteredData = (() => {
        if (!appliedDateRange.startDate && !appliedDateRange.endDate) return salesData;
        return salesData.filter((item) => {
          if (item.timestamp === 0 || isNaN(item.timestamp)) return true;
          return item.timestamp >= start && item.timestamp <= end;
        });
      })();
      if (!Array.isArray(filteredData) || filteredData.length === 0) {
        console.warn("No data after filtering");
        return [];
      }
      const actualData = filteredData.map((item) => item.value);
      if (!Array.isArray(actualData) || actualData.length === 0) return [];
      const forecast = generateForecast(actualData, trendConfig, forecastPeriods);
      const combined: ChartDataPoint[] = [];
      filteredData.forEach((item, idx) => {
        combined.push({
          date: item.date || `Day ${idx + 1}`,
          actual: item.value,
          forecast: undefined,
          lowerBound: undefined,
          upperBound: undefined,
          isForecasted: false,
        });
      });
      forecast.forEach((point, idx) => {
        const forecastPoint: ChartDataPoint = {
          date: point.date,
          actual: undefined,
          forecast: point.forecast,
          lowerBound: point.lowerBound,
          upperBound: point.upperBound,
          trend: point.trend,
          isForecasted: true,
        };
        combined.push(forecastPoint);
      });
      return combined;
    } catch (err) {
      console.error("Chart data generation error:", err);
      return [];
    }
  }, [data, selectedCategory, trendConfig, appliedDateRange, forecastPeriods]);

  // Calculate statistics
  const stats = useMemo(() => {
    const actualValues = chartData
      .filter((p) => !p.isForecasted && p.actual !== undefined)
      .map((p) => p.actual as number);

    const forecastValues = chartData
      .filter((p) => p.isForecasted && p.forecast !== undefined)
      .map((p) => p.forecast as number);

    const avgActual =
      actualValues.length > 0
        ? actualValues.reduce((a, b) => a + b, 0) / actualValues.length
        : 0;

    const avgForecast =
      forecastValues.length > 0
        ? forecastValues.reduce((a, b) => a + b, 0) / forecastValues.length
        : 0;

    const trend =
      avgForecast > avgActual * 1.02
        ? "📈 Upward"
        : avgForecast < avgActual * 0.98
          ? "📉 Downward"
          : "➡️ Stable";

    console.log("Stats - Actual points:", actualValues.length, "Forecast points:", forecastValues.length);
    console.log("Forecast data sample:", forecastValues.slice(0, 3));

    return {
      avgActual,
      avgForecast,
      trend,
      dataPoints: actualValues.length,
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg text-sm">
          <p className="font-semibold">{data.date}</p>
          {data.actual !== undefined && (
            <p className="text-blue-600">
              Actual: {data.actual.toFixed(2)}
            </p>
          )}
          {data.forecast !== undefined && (
            <>
              <p className="text-green-600">
                Forecast: {data.forecast.toFixed(2)}
              </p>
              <p className="text-gray-500 text-xs">
                Range: {data.lowerBound?.toFixed(2)} -{" "}
                {data.upperBound?.toFixed(2)}
              </p>
              {data.trend && <p className="text-orange-600 text-xs">Trend: {data.trend}</p>}
            </>
          )}
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <Card className="p-6 bg-white shadow-md">
        <p className="text-muted-foreground text-center">
          No data available for predictive analysis
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white shadow-md space-y-4" ref={chartCardRef}>
      <div className="space-y-2">
        <div className="flex justify-between items-start gap-2 flex-wrap">
          <h2 className="text-2xl font-bold">
            Predictive Analysis - {selectedCategory === "all" ? "All Categories" : selectedCategory}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportPNG}>
              Export PNG
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportData}>
              Export Data
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 text-sm">
          <div className="bg-blue-50 p-2 rounded">
            <p className="text-gray-600">Avg Actual</p>
            <p className="font-semibold">{stats.avgActual.toFixed(2)}</p>
          </div>
          <div className="bg-green-50 p-2 rounded">
            <p className="text-gray-600">Avg Forecast</p>
            <p className="font-semibold">{stats.avgForecast.toFixed(2)}</p>
          </div>
          <div className="bg-orange-50 p-2 rounded">
            <p className="text-gray-600">Trend</p>
            <p className="font-semibold">{stats.trend}</p>
          </div>
          <div className="bg-purple-50 p-2 rounded">
            <p className="text-gray-600">Data Points</p>
            <p className="font-semibold">{stats.dataPoints}</p>
          </div>
        </div>
      </div>

      {/* Trend Selector */}
      <TrendSelector trendConfig={trendConfig} onTrendChange={setTrendConfig} />

      {/* Date Range and Forecast Periods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-sm font-semibold">
            Start Date
          </Label>
          <Input
            id="startDate"
            type="date"
            value={dateRange.startDate}
            onChange={(e) =>
              setDateRange({ ...dateRange, startDate: e.target.value })
            }
            className="text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-sm font-semibold">
            End Date
          </Label>
          <Input
            id="endDate"
            type="date"
            value={dateRange.endDate}
            onChange={(e) =>
              setDateRange({ ...dateRange, endDate: e.target.value })
            }
            className="text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="forecastPeriods" className="text-sm font-semibold">
            Forecast Days
          </Label>
          <Input
            id="forecastPeriods"
            type="number"
            min="1"
            max="90"
            value={forecastPeriods}
            onChange={(e) => setForecastPeriods(Number(e.target.value))}
            className="text-sm"
          />
        </div>
        <div className="flex items-end pt-4">
          <Button
            variant="default"
            size="sm"
            onClick={() => setAppliedDateRange(dateRange)}
            disabled={!isIntervalValid}
          >
            Apply Interval
          </Button>
          {!isIntervalValid && (
            <span className="ml-4 text-xs text-destructive">Select a longer interval (at least 2 data points)</span>
          )}
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="flex gap-2">
        <label className="text-sm font-semibold">Chart Type:</label>
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value as any)}
          className="px-3 py-1 border rounded text-sm"
        >
          <option value="line">Line Chart</option>
          <option value="area">Area Chart</option>
          <option value="composed">Composed (Line + Area)</option>
        </select>
      </div>

      {/* Chart */}
      <div className="w-full h-96 bg-gray-50 rounded-lg p-4" ref={chartOnlyRef}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                interval={Math.floor(chartData.length / 10)}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Actual Data"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#22c55e"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Forecast"
                dot={false}
                connectNulls={true}
              />
              <Line
                type="monotone"
                dataKey="lowerBound"
                stroke="#fbbf24"
                strokeWidth={1}
                strokeDasharray="3 3"
                name="Confidence Lower"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="upperBound"
                stroke="#fbbf24"
                strokeWidth={1}
                strokeDasharray="3 3"
                name="Confidence Upper"
                dot={false}
              />
            </LineChart>
          ) : chartType === "area" ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                interval={Math.floor(chartData.length / 10)}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorActual)"
                name="Actual Data"
              />
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="#22c55e"
                fillOpacity={1}
                fill="url(#colorForecast)"
                name="Forecast"
              />
            </AreaChart>
          ) : (
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="colorBounds" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                interval={Math.floor(chartData.length / 10)}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="upperBound"
                stroke="transparent"
                fill="url(#colorBounds)"
                name="Confidence Range"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Actual Data"
              />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#22c55e"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Forecast"
                connectNulls={true}
              />
              <Line
                type="monotone"
                dataKey="lowerBound"
                stroke="#fbbf24"
                strokeWidth={1}
                strokeDasharray="3 3"
                name="Lower Bound"
              />
              <Line
                type="monotone"
                dataKey="upperBound"
                stroke="#fbbf24"
                strokeWidth={1}
                strokeDasharray="3 3"
                name="Upper Bound"
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm pt-4 border-t">
        <div className="flex items-center gap-2">
          <div className="w-6 h-1 bg-blue-600"></div>
          <span>Actual historical data</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-1 bg-green-600" style={{borderTop: "2px dashed"}}></div>
          <span>Forecasted values (30 days ahead)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-1 bg-amber-400" style={{borderTop: "2px dashed"}}></div>
          <span>Confidence interval</span>
        </div>
      </div>
    </Card>
  );
};
