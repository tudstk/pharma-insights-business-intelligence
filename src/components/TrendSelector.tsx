import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { TrendConfig, TrendType } from "@/utils/forecasting";

interface Props {
  trendConfig: TrendConfig;
  onTrendChange: (config: TrendConfig) => void;
}

export const TrendSelector = ({ trendConfig, onTrendChange }: Props) => {
  return (
    <Card className="p-4 shadow-sm">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="trendType" className="text-sm font-semibold">
            Trend Calculation Method
          </Label>
          <Select
            value={trendConfig.type}
            onValueChange={(value) =>
              onTrendChange({ ...trendConfig, type: value as TrendType })
            }
          >
            <SelectTrigger id="trendType" className="w-full">
              <SelectValue placeholder="Select trend type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linear">
                Linear Regression (Best for steady trends)
              </SelectItem>
              <SelectItem value="exponential">
                Exponential Smoothing (Best for acceleration)
              </SelectItem>
              <SelectItem value="movingAverage">
                Moving Average (Best for volatility)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {trendConfig.type === "movingAverage" && (
          <div className="space-y-2">
            <Label htmlFor="window" className="text-sm">
              Window Size (days)
            </Label>
            <Input
              id="window"
              type="number"
              min={3}
              max={30}
              value={trendConfig.window || 7}
              onChange={(e) =>
                onTrendChange({
                  ...trendConfig,
                  window: Number(e.target.value),
                })
              }
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Higher values smooth out more noise
            </p>
          </div>
        )}

        {trendConfig.type === "exponential" && (
          <div className="space-y-2">
            <Label htmlFor="alpha" className="text-sm">
              Smoothing Factor (0-1)
            </Label>
            <Input
              id="alpha"
              type="number"
              min={0}
              max={1}
              step={0.1}
              value={trendConfig.alpha || 0.3}
              onChange={(e) =>
                onTrendChange({
                  ...trendConfig,
                  alpha: Number(e.target.value),
                })
              }
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Higher values react faster to changes
            </p>
          </div>
        )}

        {trendConfig.type === "linear" && (
          <p className="text-xs text-muted-foreground italic">
            Uses linear regression to find the best-fit trend line through your
            data
          </p>
        )}
      </div>
    </Card>
  );
};
