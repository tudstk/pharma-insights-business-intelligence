import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Activity, Package } from "lucide-react";
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
import { parseCsvData, MEDICINE_CATEGORIES, type SalesData, type MedicineCategory } from "@/utils/csvParser";
import dailyCsv from "@/data/salesdaily.csv?raw";
import weeklyCsv from "@/data/salesweekly.csv?raw";
import monthlyCsv from "@/data/salesmonthly.csv?raw";

export const Dashboard = () => {
  const [timeView, setTimeView] = useState<"daily" | "weekly" | "monthly">("daily");
  const [selectedCategory, setSelectedCategory] = useState<MedicineCategory | "all">("all");
  const [data, setData] = useState<SalesData[]>([]);

  useEffect(() => {
    const csvData = timeView === "daily" ? dailyCsv : timeView === "weekly" ? weeklyCsv : monthlyCsv;
    const parsed = parseCsvData(csvData);
    setData(parsed);
  }, [timeView]);

  const calculateMetrics = () => {
    if (data.length === 0) return { total: 0, average: 0, peak: 0, growth: 0 };

    const categories = selectedCategory === "all" 
      ? MEDICINE_CATEGORIES.map(c => c.id)
      : [selectedCategory];

    const totals = data.map(row => 
      categories.reduce((sum, cat) => sum + (row[cat as keyof SalesData] as number || 0), 0)
    );

    const total = totals.reduce((sum, val) => sum + val, 0);
    const average = total / totals.length;
    const peak = Math.max(...totals);
    
    // Calculate growth (comparing last 20% vs first 20% of data)
    const splitPoint = Math.floor(totals.length * 0.2);
    const recentAvg = totals.slice(-splitPoint).reduce((a, b) => a + b, 0) / splitPoint;
    const oldAvg = totals.slice(0, splitPoint).reduce((a, b) => a + b, 0) / splitPoint;
    const growth = ((recentAvg - oldAvg) / oldAvg) * 100;

    return { total, average, peak, growth };
  };

  const metrics = calculateMetrics();

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
              Comprehensive decision support system with forecasting and interactive analysis
            </p>
          </div>
          
          <div className="flex gap-3">
            <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
              <SelectTrigger className="w-[200px] shadow-sm">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {MEDICINE_CATEGORIES.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Metrics Cards */}
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
            value={`${metrics.growth > 0 ? '+' : ''}${metrics.growth.toFixed(1)}%`}
            icon={metrics.growth >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            trend={metrics.growth >= 0 ? "up" : "down"}
          />
        </div>

        {/* Charts Section */}
        <Tabs value={timeView} onValueChange={(v) => setTimeView(v as any)} className="space-y-4">
          <Card className="p-1 w-fit shadow-md">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Daily
              </TabsTrigger>
              <TabsTrigger value="weekly" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Weekly
              </TabsTrigger>
              <TabsTrigger value="monthly" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Monthly
              </TabsTrigger>
            </TabsList>
          </Card>

          <TabsContent value={timeView} className="space-y-6">
            {/* Row 1: Main sales chart and forecast */}
            <div className="grid gap-6 lg:grid-cols-2">
              <SalesChart data={data} selectedCategory={selectedCategory} timeView={timeView} />
              {selectedCategory !== "all" && (
                <ForecastChart data={data} selectedCategory={selectedCategory} />
              )}
              {selectedCategory === "all" && (
                <PieChartDistribution data={data} />
              )}
            </div>

            {/* Row 2: Price simulator (full width) */}
            <PriceSimulator data={data} />

            {/* Row 3: Category comparison and stacked area */}
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
