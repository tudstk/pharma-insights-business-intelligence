import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card } from "@/components/ui/card";
import type { GeoPoint } from "@/lib/aggregateGeo";

interface Props {
  geoPoints: GeoPoint[];
  selectedCategory: string;
}

interface HeatmapPoint {
  lng: number;
  lat: number;
  city: string;
  country: string;
  sales: number;
  intensity: number; // 0-100
  size: number; // For bubble size
}

export const SalesHeatmapChart = ({
  geoPoints,
  selectedCategory,
}: Props) => {
  // Transform geo points into heatmap data
  const heatmapData = useMemo(() => {
    if (geoPoints.length === 0) return [];

    // Find min/max for normalization
    const salesValues = geoPoints.map((p) => p.totalSales);
    const maxSales = Math.max(...salesValues);
    const minSales = Math.min(...salesValues);
    const range = maxSales - minSales || 1;

    return geoPoints.map((point) => {
      // Normalize sales to 0-100 for intensity
      const intensity = ((point.totalSales - minSales) / range) * 100;

      // Size proportional to sales (between 5 and 30)
      const size = 5 + (intensity / 100) * 25;

      return {
        lng: point.lng,
        lat: point.lat,
        city: point.city,
        country: point.country,
        sales: point.totalSales,
        intensity,
        size,
      };
    });
  }, [geoPoints]);

  // Regional aggregation
  const regionalData = useMemo(() => {
    const regions = new Map<
      string,
      { sales: number; cities: number; count: number }
    >();

    heatmapData.forEach((point) => {
      // Create region from lat/lng (rough grid)
      const latRegion = Math.floor(point.lat / 10);
      const lngRegion = Math.floor(point.lng / 10);
      const regionKey = `${latRegion},${lngRegion}`;

      const existing = regions.get(regionKey) || {
        sales: 0,
        cities: 0,
        count: 0,
      };

      regions.set(regionKey, {
        sales: existing.sales + point.sales,
        cities: existing.cities + 1,
        count: existing.count + 1,
      });
    });

    return Array.from(regions.entries()).map(([key, data]) => ({
      region: key,
      avgSales: data.sales / data.count,
      totalSales: data.sales,
      cities: data.cities,
    }));
  }, [heatmapData]);

  // Get color based on intensity
  const getColor = (intensity: number): string => {
    if (intensity > 80) return "#dc2626"; // Red - very high
    if (intensity > 60) return "#f97316"; // Orange - high
    if (intensity > 40) return "#fbbf24"; // Amber - medium
    if (intensity > 20) return "#84cc16"; // Lime - low
    return "#86efac"; // Light green - very low
  };

  const getColorLabel = (intensity: number): string => {
    if (intensity > 80) return "Very High";
    if (intensity > 60) return "High";
    if (intensity > 40) return "Medium";
    if (intensity > 20) return "Low";
    return "Very Low";
  };

  if (heatmapData.length === 0) {
    return (
      <Card className="p-6 bg-white shadow-md">
        <p className="text-muted-foreground text-center">
          No geographic data available for heatmap
        </p>
      </Card>
    );
  }

  const maxSales = Math.max(...heatmapData.map((p) => p.sales));
  const minSales = Math.min(...heatmapData.map((p) => p.sales));

  return (
    <div className="space-y-6">
      {/* Geographic Heatmap */}
      <Card className="p-6 bg-white shadow-md">
        <h2 className="text-2xl font-bold mb-4">
          Geographic Sales Intensity Heatmap
        </h2>

        <p className="text-sm text-gray-600 mb-4">
          Bubble size and color represent sales intensity by location
        </p>

        <div className="w-full h-96 bg-gray-50 rounded-lg p-2">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                type="number"
                dataKey="lng"
                name="Longitude"
                tick={{ fontSize: 11 }}
                label={{
                  value: "Longitude",
                  position: "insideBottomRight",
                  offset: -10,
                }}
              />
              <YAxis
                type="number"
                dataKey="lat"
                name="Latitude"
                tick={{ fontSize: 11 }}
                label={{
                  value: "Latitude",
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  padding: "8px",
                }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-gray-300 rounded shadow text-sm">
                        <p className="font-semibold">{data.city}</p>
                        <p className="text-gray-600">{data.country}</p>
                        <p className="mt-1">
                          <span className="font-medium">Sales:</span>{" "}
                          {data.sales.toFixed(2)}
                        </p>
                        <p>
                          <span className="font-medium">Intensity:</span>{" "}
                          {data.intensity.toFixed(0)}%
                        </p>
                        <p>
                          <span className="font-medium">Level:</span>{" "}
                          {getColorLabel(data.intensity)}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          Lat: {data.lat.toFixed(3)}, Lng:{" "}
                          {data.lng.toFixed(3)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Cities" data={heatmapData} fill="#3b82f6">
                {heatmapData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.intensity)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-5 gap-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span>Very Low</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 bg-lime-400 rounded"></div>
            <span>Low</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 bg-amber-400 rounded"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span>High</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span>Very High</span>
          </div>
        </div>
      </Card>

      {/* Regional Statistics */}
      <Card className="p-6 bg-white shadow-md">
        <h2 className="text-2xl font-bold mb-4">Regional Performance</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Total Cities</p>
            <p className="text-3xl font-bold text-blue-600">
              {heatmapData.length}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Total Sales Volume</p>
            <p className="text-3xl font-bold text-green-600">
              {heatmapData
                .reduce((sum, p) => sum + p.sales, 0)
                .toFixed(0)}
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Average Sales/City</p>
            <p className="text-3xl font-bold text-purple-600">
              {(
                heatmapData.reduce((sum, p) => sum + p.sales, 0) /
                heatmapData.length
              ).toFixed(0)}
            </p>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Regions Covered</p>
            <p className="text-3xl font-bold text-amber-600">
              {regionalData.length}
            </p>
          </div>
        </div>
      </Card>

      {/* Intensity Distribution */}
      <Card className="p-6 bg-white shadow-md">
        <h2 className="text-2xl font-bold mb-4">Sales Intensity Distribution</h2>

        <div className="space-y-4">
          {[
            {
              level: "Very High",
              range: "80-100%",
              color: "bg-red-600",
              count: heatmapData.filter((p) => p.intensity > 80).length,
            },
            {
              level: "High",
              range: "60-80%",
              color: "bg-orange-500",
              count: heatmapData.filter((p) => p.intensity > 60 && p.intensity <= 80).length,
            },
            {
              level: "Medium",
              range: "40-60%",
              color: "bg-amber-400",
              count: heatmapData.filter((p) => p.intensity > 40 && p.intensity <= 60).length,
            },
            {
              level: "Low",
              range: "20-40%",
              color: "bg-lime-400",
              count: heatmapData.filter((p) => p.intensity > 20 && p.intensity <= 40).length,
            },
            {
              level: "Very Low",
              range: "0-20%",
              color: "bg-green-400",
              count: heatmapData.filter((p) => p.intensity <= 20).length,
            },
          ].map((item) => {
            const percentage = (item.count / heatmapData.length) * 100;
            return (
              <div key={item.level}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded ${item.color}`}></div>
                    <div>
                      <p className="font-semibold text-sm">{item.level}</p>
                      <p className="text-xs text-gray-600">{item.range}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{item.count}</p>
                    <p className="text-xs text-gray-600">
                      {percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Top and Bottom Cities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card className="p-6 bg-white shadow-md">
          <h3 className="text-lg font-bold mb-4">🌟 Top 5 Performers</h3>
          <ul className="space-y-3">
            {heatmapData
              .sort((a, b) => b.sales - a.sales)
              .slice(0, 5)
              .map((city, idx) => (
                <li key={`${city.city}-${idx}`} className="flex justify-between items-center pb-2 border-b">
                  <div>
                    <p className="font-semibold text-sm">{city.city}</p>
                    <p className="text-xs text-gray-600">{city.country}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {city.sales.toFixed(0)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {city.intensity.toFixed(0)}%
                    </p>
                  </div>
                </li>
              ))}
          </ul>
        </Card>

        {/* Emerging Markets */}
        <Card className="p-6 bg-white shadow-md">
          <h3 className="text-lg font-bold mb-4">📍 Emerging Markets</h3>
          <ul className="space-y-3">
            {heatmapData
              .sort((a, b) => a.sales - b.sales)
              .slice(0, 5)
              .map((city, idx) => (
                <li key={`${city.city}-${idx}`} className="flex justify-between items-center pb-2 border-b">
                  <div>
                    <p className="font-semibold text-sm">{city.city}</p>
                    <p className="text-xs text-gray-600">{city.country}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">
                      {city.sales.toFixed(0)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {city.intensity.toFixed(0)}%
                    </p>
                  </div>
                </li>
              ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};
