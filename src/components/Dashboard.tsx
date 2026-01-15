import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Activity, Package, Download } from "lucide-react";

import { SalesChart } from "./SalesChart";
import { CategoryComparison } from "./CategoryComparison";
import { MetricCard } from "./MetricCard";
import { ForecastChart } from "./ForecastChart";
import { PriceSimulator } from "./PriceSimulator";
import { PieChartDistribution } from "./PieChartDistribution";
import { StackedAreaChart } from "./StackedAreaChart";
import { CorrelationMatrix } from "./CorrelationMatrix";
import { RadarComparison } from "./RadarComparison";
import { ScatterAnalysis } from "./ScatterAnalysis";
import { SalesMapChart } from "@/components/SalesMapChart";
import { ChoroplethMap } from "@/components/ChoroplethMap";
import { PredictiveChart } from "./PredictiveChart";

import {
  parseCsvData,
  MEDICINE_CATEGORIES,
  type SalesData,
  type MedicineCategory,
} from "@/utils/csvParser";

import dailyCsv from "@/data/salesdaily.csv?raw";
import weeklyCsv from "@/data/salesweekly.csv?raw";
import monthlyCsv from "@/data/salesmonthly.csv?raw";

import { aggregateSalesByCity, exportCityStatistics } from "@/lib/aggregateGeo";

export const Dashboard = () => {
  const [timeView, setTimeView] = useState<"daily" | "weekly" | "monthly">(
    "daily",
  );
  const [selectedCategory, setSelectedCategory] = useState<
    MedicineCategory | "all"
  >("all");
  const [selectedCity, setSelectedCity] = useState<string | "all">("all");
  const [data, setData] = useState<SalesData[]>([]);

  // Load CSV depending on selected timeView
  useEffect(() => {
    const csvData =
      timeView === "daily"
        ? dailyCsv
        : timeView === "weekly"
          ? weeklyCsv
          : monthlyCsv;

    const parsed = parseCsvData(csvData);
    setData(parsed);
  }, [timeView]);

  // KPI metrics
  const calculateMetrics = () => {
    let filteredData = data;

    if (selectedCity !== "all") {
      filteredData = data.filter((row) => row.city?.trim() === selectedCity);
    }

    if (filteredData.length === 0) {
      return { total: 0, average: 0, peak: 0, growth: 0 };
    }

    const categories =
      selectedCategory === "all"
        ? MEDICINE_CATEGORIES.map((c) => c.id)
        : [selectedCategory];

    const totals = filteredData.map((row) =>
      categories.reduce(
        (sum, cat) =>
          sum + ((row[cat as keyof SalesData] as number) || 0),
        0,
      ),
    );

    const total = totals.reduce((s, v) => s + v, 0);
    const average = total / totals.length;
    const peak = Math.max(...totals);

    const split = Math.floor(totals.length * 0.2) || 1;
    const recent =
      totals.slice(-split).reduce((a, b) => a + b, 0) / split;
    const old =
      totals.slice(0, split).reduce((a, b) => a + b, 0) / split;

    const growth = old === 0 ? 0 : ((recent - old) / old) * 100;

    return { total, average, peak, growth };
  };

  const metrics = useMemo(() => calculateMetrics(), [data, selectedCategory, selectedCity]);

  // GEO points for maps – based on same data used in charts
  const geoPoints = useMemo(
    () => aggregateSalesByCity(data, selectedCategory),
    [data, selectedCategory]
  );

  const countryPoints = useMemo(
    () => aggregateSalesByCity(data, selectedCategory),
    [data, selectedCategory]
  );

  // Get unique cities for dropdown
  const availableCities = useMemo(() => {
    const cities = geoPoints.map((p) => p.city);
    return Array.from(new Set(cities)).sort();
  }, [geoPoints]);

  // Filter geoPoints by selected city
  const filteredGeoPoints = useMemo(() => {
    if (selectedCity === "all") return geoPoints;
    return geoPoints.filter((p) => p.city === selectedCity);
  }, [geoPoints, selectedCity]);

  const handleExportCityStats = () => {
    const dataToExport =
      selectedCity === "all" ? geoPoints : filteredGeoPoints;
    exportCityStatistics(dataToExport, selectedCategory);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Pharma Sales Analytics
            </h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive decision support system with forecasting, geospatial
              analysis and export capabilities
            </p>
          </div>

          <div className="flex gap-3">
            <Select
              value={selectedCategory}
              onValueChange={(v) => setSelectedCategory(v as any)}
            >
              <SelectTrigger className="w-[200px] shadow-sm">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {MEDICINE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-[200px] shadow-sm">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {availableCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleExportCityStats}
              disabled={geoPoints.length === 0}
              className="gap-2"
              variant="outline"
            >
              <Download className="h-4 w-4" />
              Export City Stats
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Sales"
            value={metrics.total.toFixed(0)}
            icon={<Package className="h-5 w-5" />}
            trend={metrics.growth > 0 ? "up" : "down"}
            trendValue={Math.abs(metrics.growth).toFixed(1)}
          />
          <MetricCard
            title="Average Sales"
            value={metrics.average.toFixed(1)}
            icon={<Activity className="h-5 w-5" />}
            description="Per period"
          />
          <MetricCard
            title="Peak Sales"
            value={metrics.peak.toFixed(0)}
            icon={<TrendingUp className="h-5 w-5" />}
            description="Maximum in period"
          />
          <MetricCard
            title="Growth Rate"
            value={`${metrics.growth > 0 ? "+" : ""}${metrics.growth.toFixed(
              1,
            )}%`}
            icon={
              metrics.growth >= 0 ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )
            }
            trend={metrics.growth >= 0 ? "up" : "down"}
          />
        </div>

        {/* Charts + Maps */}
        <Tabs
          value={timeView}
          onValueChange={(v) => setTimeView(v as any)}
          className="space-y-4"
        >
          {/* Time selector */}
          <Card className="p-1 w-fit shadow-md">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Card>

          <TabsContent value={timeView} className="space-y-6">
            {/* Row 1: Main sales chart and forecast / pie */}
            <div className="grid gap-6 lg:grid-cols-2">
              <SalesChart
                data={data}
                selectedCategory={selectedCategory}
                timeView={timeView}
              />

              {selectedCategory !== "all" && (
                <ForecastChart
                  data={data}
                  selectedCategory={selectedCategory}
                />
              )}

              {selectedCategory === "all" && (
                <PieChartDistribution data={data} />
              )}
            </div>

            {/* Row 2: Price simulator (full width) */}
            <PriceSimulator data={data} />

            {/* Row 3: Predictive Chart (full width) */}
            <PredictiveChart 
              data={data} 
              selectedCategory={selectedCategory} 
              timeView={timeView} 
            />

            {/* Row 4: Category comparison and stacked area */}
            <div className="grid gap-6 lg:grid-cols-2">
              <CategoryComparison data={data} timeView={timeView} />
              <StackedAreaChart data={data} timeView={timeView} />
            </div>

            {/* Row 4: Scatter and Radar */}
            <div className="grid gap-6 lg:grid-cols-2">
              <ScatterAnalysis data={data} />
              <RadarComparison data={data} />
            </div>

            {/* Row 5: Correlation matrix (full width) */}
            <CorrelationMatrix data={data} />

            {/* Row 6: Maps – only if we have geo points */}
            {filteredGeoPoints.length > 0 && <SalesMapChart points={filteredGeoPoints} />}
            {filteredGeoPoints.length > 0 && <ChoroplethMap points={filteredGeoPoints} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
