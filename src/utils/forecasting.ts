export type TrendType = "linear" | "exponential" | "movingAverage";

export interface TrendConfig {
  type: TrendType;
  window?: number; // For moving average
  alpha?: number; // For exponential smoothing
}

export interface ForecastPoint {
  date: string;
  actual?: number;
  forecast: number;
  lowerBound: number;
  upperBound: number;
  trend?: "up" | "down" | "stable";
}

export const linearRegressionForecast = (
  data: number[],
  periods: number = 30
): ForecastPoint[] => {
  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += i * data[i];
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  
  let sse = 0;
  for (let i = 0; i < n; i++) {
    const predicted = slope * i + intercept;
    sse += Math.pow(data[i] - predicted, 2);
  }
  const standardError = Math.sqrt(sse / (n - 2));

  const results: ForecastPoint[] = [];
  
  for (let i = n; i < n + periods; i++) {
    const forecast = slope * i + intercept;
    const margin = 1.96 * standardError * Math.sqrt(1 + 1/n + Math.pow(i - sumX/n, 2) / sumX2);
    
    results.push({
      date: `Day ${i + 1}`,
      forecast: Math.max(0, forecast),
      lowerBound: Math.max(0, forecast - margin),
      upperBound: forecast + margin,
    });
  }

  return results;
};

export const movingAverageForecast = (
  data: number[],
  window: number = 7,
  periods: number = 30
): ForecastPoint[] => {
  const results: ForecastPoint[] = [];
  
  for (let i = 0; i < periods; i++) {
    const startIdx = Math.max(0, data.length - window + i);
    const endIdx = data.length + i;
    const relevantData = i === 0 ? data.slice(startIdx) : [...data, ...results.map(r => r.forecast)].slice(startIdx, endIdx);
    
    const avg = relevantData.reduce((a, b) => a + b, 0) / relevantData.length;
    const stdDev = Math.sqrt(relevantData.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / relevantData.length);
    
    results.push({
      date: `Day ${data.length + i + 1}`,
      forecast: Math.max(0, avg),
      lowerBound: Math.max(0, avg - 1.96 * stdDev),
      upperBound: avg + 1.96 * stdDev,
    });
  }

  return results;
};

export const exponentialSmoothing = (
  data: number[],
  alpha: number = 0.3,
  periods: number = 30
): ForecastPoint[] => {
  let lastSmoothed = data[0];
  
  for (let i = 1; i < data.length; i++) {
    lastSmoothed = alpha * data[i] + (1 - alpha) * lastSmoothed;
  }

  const recentData = data.slice(-10);
  const trend = (recentData[recentData.length - 1] - recentData[0]) / recentData.length;

  const results: ForecastPoint[] = [];
  
  for (let i = 0; i < periods; i++) {
    const forecast = lastSmoothed + trend * (i + 1);
    const margin = Math.abs(forecast * 0.2);
    
    results.push({
      date: `Day ${data.length + i + 1}`,
      forecast: Math.max(0, forecast),
      lowerBound: Math.max(0, forecast - margin),
      upperBound: forecast + margin,
    });
  }

  return results;
};


function calculateTrendDirection(
  forecast: number,
  previous: number,
  threshold: number = 0.02
): "up" | "down" | "stable" {
  const change = (forecast - previous) / previous;
  if (change > threshold) return "up";
  if (change < -threshold) return "down";
  return "stable";
}


export const generateForecast = (
  data: number[],
  config: TrendConfig = { type: "linear" },
  periods: number = 30
): ForecastPoint[] => {
  let results: ForecastPoint[] = [];

  switch (config.type) {
    case "linear":
      results = linearRegressionForecast(data, periods);
      break;
    case "movingAverage":
      results = movingAverageForecast(data, config.window || 7, periods);
      break;
    case "exponential":
      results = exponentialSmoothing(data, config.alpha || 0.3, periods);
      break;
  }

  // Add trend direction to each point
  const dataPoints = [...data, ...results.map((r) => r.forecast)];
  return results.map((point, idx) => ({
    ...point,
    trend: calculateTrendDirection(
      point.forecast,
      dataPoints[data.length + idx - 1] || point.forecast
    ),
  }));
};
