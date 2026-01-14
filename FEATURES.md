# New Features Documentation

## 1. Predictive Chart (`PredictiveChart.tsx`)

A comprehensive visual forecasting component that combines historical data with predictive analytics using multiple trend models.

### Features:
- **Three visualization modes**: Line, Area, and Composed charts
- **Multiple trend algorithms**: Linear Regression, Exponential Smoothing, Moving Average
- **Confidence intervals**: Visual bounds showing forecast uncertainty
- **Real-time statistics**: Average values, trend direction, data point count
- **Interactive tooltips**: Detailed information on hover
- **Customizable parameters**: Adjust algorithm-specific settings

### Data Display:
- **Blue line**: Actual historical sales data
- **Green dashed line**: Forecasted future values
- **Amber bounds**: Confidence interval showing range of uncertainty
- **Trend indicator**: Visual representation of market direction

### Chart Types:

1. **Line Chart** (default)
   - Clear visualization of data points
   - Best for seeing individual values
   - Shows actual vs forecasted clearly

2. **Area Chart**
   - Filled areas under curves
   - Better for showing magnitude comparison
   - Good for showing relative importance

3. **Composed Chart**
   - Combines line and area visualization
   - Shows confidence intervals as shaded region
   - Best for comprehensive analysis

### Statistics Panel:
- **Avg Actual**: Average of historical data
- **Avg Forecast**: Average of predicted values
- **Trend**: Direction indicator (Upward/Downward/Stable)
- **Data Points**: Number of historical records analyzed

### Usage:
```tsx
<PredictiveChart 
  data={salesData}
  selectedCategory="M01AB"
  timeView="daily"
/>
```

---

## 2. Data Buffering (`dataBuffer.ts`)

A performance optimization module that caches data to prevent unnecessary recalculations.

### Features:
- **Automatic caching** with Time-To-Live (TTL)
- **Size limits** to prevent memory overflow
- **Cache statistics** for monitoring
- **Chunking** for processing large datasets

### Usage:
```typescript
import { dataBuffer } from "@/lib/dataBuffer";

// Store data
dataBuffer.set("geoPoints", { city: "Paris" }, geoPointsArray);

// Retrieve cached data
const cached = dataBuffer.get("geoPoints", { city: "Paris" });

// Clear specific cache
dataBuffer.clear("geoPoints", { city: "Paris" });

// Get cache stats
const stats = dataBuffer.getStats();
```

---

## 2. Trend Type Selection (`TrendSelector.tsx`)

Users can choose different forecasting algorithms for trend analysis.

### Available Methods:

1. **Linear Regression** (default)
   - Best for: Steady, predictable trends
   - Good for: Sales over consistent timeframes
   - Calculation: Best-fit line through data points

2. **Exponential Smoothing**
   - Best for: Accelerating or decelerating trends
   - Good for: Rapidly growing markets
   - Customizable: Alpha parameter (0-1) controls reaction speed

3. **Moving Average**
   - Best for: Volatile data with noise
   - Good for: Smoothing out fluctuations
   - Customizable: Window size (3-30 days)

### Configuration:
```typescript
interface TrendConfig {
  type: "linear" | "exponential" | "movingAverage";
  window?: number; // For moving average
  alpha?: number;  // For exponential (0-1)
}

// Use in Dashboard:
const [trendConfig, setTrendConfig] = useState<TrendConfig>({
  type: "linear"
});

// Each forecast point includes trend direction:
// "up" | "down" | "stable"
```

---

## 3. KPI Rules & Formatting

### KPI Thresholds:
- **Minimum Value**: Only include sales above this amount
- **Maximum Value**: Cap or exclude sales above this amount
- **Minimum Growth (%)**: Filter metrics by growth rate
- **Minimum Peak**: Set acceptable peak values

### Export Formatting:
- **Currency Formatting**: Add currency symbols and decimals
- **Currency Symbol**: Customize symbol ($, €, £, etc.)
- **Decimal Places**: 0-5 decimal precision
- **Highlight Threshold**: Mark high-value entries

### Export Filters:
- **Exclude Below Threshold**: Remove low-value items from export

### Usage:
```typescript
import { KpiRules, formatValueByRules, filterByKpiRules } from "@/lib/kpiConfig";

const myRules: KpiRules = {
  minValue: 1000,
  maxValue: 100000,
  formatCurrency: true,
  currencySymbol: "€",
  decimalPlaces: 2,
  highlightThreshold: 5000,
  excludeBelowThreshold: true
};

// Format value
const formatted = formatValueByRules(2500, myRules); // "€2500.00"

// Filter data
const filtered = filterByKpiRules(data, myRules, "totalSales");
```

---

## 4. Updated Export Functions

### City Statistics Export with KPI Rules:
```typescript
import { exportCityStatistics } from "@/lib/aggregateGeo";

// Export with KPI formatting
exportCityStatistics(
  geoPoints,
  "M01AB",  // category
  kpiRules  // optional KPI rules
);

// Generated Excel file includes:
// - City, Country, Coordinates
// - Total Sales (formatted per KPI rules)
// - Category
// - Highlight column (YES/NO)
```

---

## 5. Components Reference

### TrendSelector
```tsx
<TrendSelector 
  trendConfig={trendConfig}
  onTrendChange={setTrendConfig}
/>
```

### KpiSettings
```tsx
<KpiSettings 
  rules={kpiRules}
  onRulesChange={setKpiRules}
/>
```

---

## Integration Example

```tsx
import { useState } from "react";
import { TrendSelector } from "@/components/TrendSelector";
import { KpiSettings } from "@/components/KpiSettings";
import { generateForecast } from "@/utils/forecasting";
import { defaultKpiRules } from "@/lib/kpiConfig";
import type { TrendConfig } from "@/utils/forecasting";

export const AdvancedAnalysis = () => {
  const [trendConfig, setTrendConfig] = useState<TrendConfig>({
    type: "linear"
  });
  const [kpiRules, setKpiRules] = useState(defaultKpiRules);

  // Generate forecast with selected trend
  const forecast = generateForecast(salesData, trendConfig);

  return (
    <div className="space-y-4">
      <TrendSelector 
        trendConfig={trendConfig}
        onTrendChange={setTrendConfig}
      />
      
      <KpiSettings 
        rules={kpiRules}
        onRulesChange={setKpiRules}
      />
      
      {/* Use forecast and kpiRules in your components */}
    </div>
  );
};
```

---

## Performance Tips

1. **Buffering**: Always use the data buffer for repeated lookups
2. **Filtering**: Apply KPI filters BEFORE export, not after
3. **Trend Calculation**: Choose appropriate method for your data type
4. **Cache TTL**: Default 5 minutes - adjust based on data update frequency
5. **Predictive Analysis**: Larger datasets (30+ points) produce more accurate forecasts

---

## Predictive Chart Examples

### Example 1: Steady Growth (Linear)
```
Use when: Sales follow a consistent upward/downward trend
Algorithm: Linear Regression
Best for: Seasonal markets, stable products
```

### Example 2: Rapid Acceleration (Exponential)
```
Use when: Sales are accelerating quickly
Algorithm: Exponential Smoothing
Best for: New product launches, emerging markets
Alpha: 0.5-0.7 for faster reaction
```

### Example 3: Volatile Market (Moving Average)
```
Use when: Sales fluctuate with noise/seasonality
Algorithm: Moving Average
Best for: Highly volatile categories
Window: 7-14 days for typical pharmacy data
```

---

## 5. Geographic Forecast Map (`GeographicForecastMap.tsx`)

Combines geographic data with forecasting to visualize predicted sales by city and region.

### Features:
- **Country-level distribution**: Bar + line chart showing actual vs forecast by country
- **City correlation scatter**: Visualizes relationship between actual and forecasted sales
- **City rankings table**: Sortable by forecast, actual, or growth percentage
- **Growth indicators**: Color-coded badges (Up/Down/Stable)
- **Confidence metrics**: Shows prediction confidence for each city
- **Key insights panel**: Highlights top growing cities, declining areas, and stable performers

### Data Displayed:
- Actual sales vs forecasted values
- Growth percentage by city
- Trend direction with visual indicators
- Confidence scores for predictions
- Regional aggregations

### Usage:
```tsx
<GeographicForecastMap
  geoPoints={geoPoints}
  selectedCategory="M01AB"
/>
```

---

## 6. Sales Heatmap Chart (`SalesHeatmapChart.tsx`)

Geographic intensity visualization showing sales concentration and regional performance.

### Features:
- **Bubble heatmap**: Geographic scatter with bubble size/color indicating sales intensity
- **5-level intensity scale**: Very Low → Very High
- **Regional statistics**: Performance metrics aggregated by region
- **Distribution analysis**: Shows percentage of cities in each intensity level
- **Top performers**: Identifies leading cities
- **Emerging markets**: Highlights underperforming but potential cities

### Intensity Levels:
- 🟢 Very Low (0-20%): Emerging markets, growth potential
- 🟢 Low (20-40%): Established but modest markets
- 🟡 Medium (40-60%): Solid performers
- 🟠 High (60-80%): Strong markets
- 🔴 Very High (80-100%): Leading markets

### Data Points:
- City location (lat/lng)
- Sales intensity (0-100%)
- Bubble size proportional to sales
- Regional aggregations

### Usage:
```tsx
<SalesHeatmapChart
  geoPoints={geoPoints}
  selectedCategory="M01AB"
/>
```

---

## Dashboard Integration

The Predictive Chart is now integrated into the main Dashboard:

1. Located after Price Simulator
2. Dynamically updates with category/city selection
3. Works with all time views (daily, weekly, monthly)
4. Exports forecast data with KPI rules applied

### New Geographic Charts:

7. **Geographic Forecast Map** - After standard maps
   - Shows city-level forecasts with growth indicators
   - Country aggregations with actual vs forecast comparison
   - Interactive rankings and key insights

8. **Sales Heatmap Chart** - Full width at bottom
   - Geographic intensity visualization
   - Bubble map with sales concentration
   - Top performers and emerging markets identification

---

## Future Enhancements

- [ ] Save/load KPI rule presets
- [ ] Custom trend calculation methods
- [ ] Advanced filtering UI
- [ ] Real-time KPI compliance checking
- [ ] Multi-export with different rule sets
- [ ] ARIMA forecasting model
- [ ] Seasonal decomposition analysis
- [ ] Forecast accuracy metrics
