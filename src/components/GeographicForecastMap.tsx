import { useMemo, useRef, useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import html2canvas from "html2canvas";
import type { GeoPoint } from "@/lib/aggregateGeo";
import type { TrendConfig } from "@/utils/forecasting";
import { generateForecast } from "@/utils/forecasting";

interface Props {
  geoPoints: GeoPoint[];
  selectedCategory: string;
}

interface CityForecastData {
  city: string;
  country: string;
  lat: number;
  lng: number;
  actual: number;
  forecast: number;
  growth: number;
  trend: "up" | "down" | "stable";
  confidence: number;
}

export const GeographicForecastMap = ({
  geoPoints,
  selectedCategory,
}: Props) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [trendConfig] = useState<TrendConfig>({ type: "linear" });
  const [sortBy, setSortBy] = useState<"actual" | "forecast" | "growth">(
    "forecast"
  );

  const handleExportPNG = async () => {
    if (!chartContainerRef.current) return;
    try {
      const canvas = await html2canvas(chartContainerRef.current);
      const link = document.createElement("a");
      link.download = `geographic-forecast-${selectedCategory}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };


  const cityForecasts = useMemo(() => {
    if (geoPoints.length === 0) return [];

    const forecasts: CityForecastData[] = geoPoints.map((point) => {
      // Simulate historical data from current value
      const historical = Array(20)
        .fill(0)
        .map((_, i) => point.totalSales * (0.8 + Math.random() * 0.4));

      const forecast = generateForecast(historical, trendConfig, 1);
      const forecastValue = forecast[0]?.forecast || point.totalSales;

      const growth =
        point.totalSales > 0
          ? ((forecastValue - point.totalSales) / point.totalSales) * 100
          : 0;

      const trend =
        growth > 2 ? "up" : growth < -2 ? "down" : "stable";

      const confidence = Math.min(
        100,
        95 - Math.abs(growth) * 2 // Less confidence for higher changes
      );

      return {
        city: point.city,
        country: point.country,
        lat: point.lat,
        lng: point.lng,
        actual: point.totalSales,
        forecast: forecastValue,
        growth,
        trend,
        confidence,
      };
    });

    // Sort data
    return forecasts.sort((a, b) => {
      switch (sortBy) {
        case "forecast":
          return b.forecast - a.forecast;
        case "actual":
          return b.actual - a.actual;
        case "growth":
          return b.growth - a.growth;
        default:
          return 0;
      }
    });
  }, [geoPoints, trendConfig, sortBy]);

  // Geographic distribution data
  const geoDistribution = useMemo(() => {
    const byCountry = new Map<
      string,
      { actual: number; forecast: number; cities: number }
    >();

    cityForecasts.forEach((city) => {
      const existing = byCountry.get(city.country) || {
        actual: 0,
        forecast: 0,
        cities: 0,
      };
      byCountry.set(city.country, {
        actual: existing.actual + city.actual,
        forecast: existing.forecast + city.forecast,
        cities: existing.cities + 1,
      });
    });

    return Array.from(byCountry.entries()).map(([country, data]) => ({
      country,
      actual: data.actual,
      forecast: data.forecast,
      growth: ((data.forecast - data.actual) / data.actual) * 100,
      cities: data.cities,
    }));
  }, [cityForecasts]);

  if (cityForecasts.length === 0) {
    return (
      <Card className="p-6 bg-white shadow-md">
        <p className="text-muted-foreground text-center">
          No geographic data available
        </p>
      </Card>
    );
  }

  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case "up":
        return "#22c55e";
      case "down":
        return "#ef4444";
      default:
        return "#f59e0b";
    }
  };

  const getTrendBadge = (trend: string) => {
    switch (trend) {
      case "up":
        return <Badge className="bg-green-600">📈 Up</Badge>;
      case "down":
        return <Badge className="bg-red-600">📉 Down</Badge>;
      default:
        return <Badge className="bg-amber-600">➡️ Stable</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Geographic Distribution by Country */}
      <Card ref={chartContainerRef} className="p-6 bg-white shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            Geographic Distribution: Actual vs Forecast
          </h2>
          <div className="flex gap-2 items-center">
            <Button variant="outline" size="sm" onClick={handleExportPNG}>
              Export PNG
            </Button>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "actual" | "forecast" | "growth")
              }
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="forecast">Sort by Forecast</option>
              <option value="actual">Sort by Actual</option>
              <option value="growth">Sort by Growth %</option>
            </select>
          </div>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={geoDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="country" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={100} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  padding: "8px",
                }}
                formatter={(value) => {
                  if (typeof value === "number") {
                    return [value.toFixed(2), ""];
                  }
                  return value;
                }}
              />
              <Legend />
              <Bar
                dataKey="actual"
                fill="#3b82f6"
                name="Actual Sales"
                opacity={0.8}
                yAxisId="left"
              />
              <Bar
                dataKey="forecast"
                fill="#22c55e"
                name="Forecast Sales"
                opacity={0.8}
                yAxisId="left"
              />
              <Line
                type="monotone"
                dataKey="growth"
                stroke="#f59e0b"
                name="Growth %"
                yAxisId="right"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-gray-600">Total Countries</p>
            <p className="font-semibold text-lg">{geoDistribution.length}</p>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <p className="text-gray-600">Total Cities</p>
            <p className="font-semibold text-lg">
              {cityForecasts.length}
            </p>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <p className="text-gray-600">Total Forecast Sales</p>
            <p className="font-semibold text-lg">
              {cityForecasts
                .reduce((sum, c) => sum + c.forecast, 0)
                .toFixed(0)}
            </p>
          </div>
          <div className="bg-amber-50 p-3 rounded">
            <p className="text-gray-600">Avg Growth</p>
            <p className="font-semibold text-lg">
              {(
                cityForecasts.reduce((sum, c) => sum + c.growth, 0) /
                cityForecasts.length
              ).toFixed(1)}
              %
            </p>
          </div>
        </div>
      </Card>

      {/* City-Level Scatter: Sales vs Forecast */}
      <Card className="p-6 bg-white shadow-md">
        <h2 className="text-2xl font-bold mb-4">
          City Performance: Actual vs Forecast (Correlation)
        </h2>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="actual"
                name="Actual Sales"
                tick={{ fontSize: 12 }}
                label={{ value: "Actual Sales", position: "insideBottomRight", offset: -10 }}
              />
              <YAxis
                dataKey="forecast"
                name="Forecast Sales"
                tick={{ fontSize: 12 }}
                label={{ value: "Forecast Sales", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2 border border-gray-300 rounded shadow text-sm">
                        <p className="font-semibold">{data.city}</p>
                        <p className="text-blue-600">
                          Actual: {data.actual.toFixed(2)}
                        </p>
                        <p className="text-green-600">
                          Forecast: {data.forecast.toFixed(2)}
                        </p>
                        <p className="text-orange-600">
                          Growth: {data.growth.toFixed(1)}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter
                name="Cities"
                data={cityForecasts}
                fill="#3b82f6"
                shape={(props) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill={getTrendColor(payload.trend)}
                      opacity={0.7}
                    />
                  );
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* City Rankings Table */}
      <Card className="p-6 bg-white shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">City Rankings & Forecasts</h2>
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "actual" | "forecast" | "growth")
            }
            className="px-3 py-1 border rounded text-sm"
          >
            <option value="forecast">Sort by Forecast</option>
            <option value="actual">Sort by Actual</option>
            <option value="growth">Sort by Growth %</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">City</th>
                <th className="px-4 py-2 text-right font-semibold">
                  Actual Sales
                </th>
                <th className="px-4 py-2 text-right font-semibold">
                  Forecast Sales
                </th>
                <th className="px-4 py-2 text-right font-semibold">
                  Growth %
                </th>
                <th className="px-4 py-2 text-center font-semibold">Trend</th>
                <th className="px-4 py-2 text-right font-semibold">
                  Confidence
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {cityForecasts.slice(0, 15).map((city) => (
                <tr
                  key={`${city.city}-${city.country}`}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-2 font-medium">
                    {city.city}, {city.country}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {city.actual.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {city.forecast.toFixed(2)}
                  </td>
                  <td
                    className={`px-4 py-2 text-right font-semibold ${
                      city.growth > 0
                        ? "text-green-600"
                        : city.growth < 0
                          ? "text-red-600"
                          : "text-gray-600"
                    }`}
                  >
                    {city.growth > 0 ? "+" : ""}
                    {city.growth.toFixed(1)}%
                  </td>
                  <td className="px-4 py-2 text-center">
                    {getTrendBadge(city.trend)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-gray-200 rounded">
                        <div
                          className="h-full bg-green-500 rounded"
                          style={{ width: `${city.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">
                        {city.confidence.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {cityForecasts.length > 15 && (
            <p className="mt-4 text-sm text-gray-500 text-center">
              Showing top 15 of {cityForecasts.length} cities
            </p>
          )}
        </div>
      </Card>

      {/* Key Insights */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 shadow-md">
        <h3 className="text-lg font-bold mb-4">Key Geographic Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-semibold text-green-700">
              🚀 Top Growing Cities
            </p>
            <ul className="mt-2 space-y-1">
              {cityForecasts
                .filter((c) => c.growth > 10)
                .slice(0, 3)
                .map((city) => (
                  <li key={`${city.city}-${city.country}`}>
                    • {city.city}: +{city.growth.toFixed(1)}%
                  </li>
                ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold text-red-700">⚠️ Declining Cities</p>
            <ul className="mt-2 space-y-1">
              {cityForecasts
                .filter((c) => c.growth < -5)
                .slice(0, 3)
                .map((city) => (
                  <li key={`${city.city}-${city.country}`}>
                    • {city.city}: {city.growth.toFixed(1)}%
                  </li>
                ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold text-blue-700">
              💼 Stable High Performers
            </p>
            <ul className="mt-2 space-y-1">
              {cityForecasts
                .filter((c) => c.trend === "stable" && c.actual > 1000)
                .slice(0, 3)
                .map((city) => (
                  <li key={`${city.city}-${city.country}`}>
                    • {city.city}: {city.actual.toFixed(0)}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
