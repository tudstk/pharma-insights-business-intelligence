import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { KpiRules, defaultKpiRules } from "@/lib/kpiConfig";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  rules: KpiRules;
  onRulesChange: (rules: KpiRules) => void;
}

export const KpiSettings = ({ rules, onRulesChange }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tempRules, setTempRules] = useState<KpiRules>(rules);

  const updateRule = <K extends keyof KpiRules>(
    key: K,
    value: KpiRules[K]
  ) => {
    setTempRules((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onRulesChange(tempRules);
    setIsExpanded(false);
  };

  const handleReset = () => {
    setTempRules(rules);
    setIsExpanded(false);
  };

  return (
    <Card className="w-full shadow-md">
      <div
        className="p-4 cursor-pointer flex items-center justify-between hover:bg-muted/50 transition"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold">KPI Rules & Formatting</h3>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </div>

      {isExpanded && (
        <div className="p-4 space-y-6 border-t">
          {/* Thresholds Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase">
              Value Thresholds
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minValue" className="text-sm">
                  Minimum Value
                </Label>
                <Input
                  id="minValue"
                  type="number"
                  value={tempRules.minValue || ""}
                  onChange={(e) =>
                    updateRule("minValue", Number(e.target.value))
                  }
                  placeholder="No minimum"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxValue" className="text-sm">
                  Maximum Value
                </Label>
                <Input
                  id="maxValue"
                  type="number"
                  value={tempRules.maxValue || ""}
                  onChange={(e) =>
                    updateRule("maxValue", Number(e.target.value))
                  }
                  placeholder="No maximum"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minGrowth" className="text-sm">
                  Minimum Growth (%)
                </Label>
                <Input
                  id="minGrowth"
                  type="number"
                  value={tempRules.minGrowth || ""}
                  onChange={(e) =>
                    updateRule("minGrowth", Number(e.target.value))
                  }
                  placeholder="0"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minPeak" className="text-sm">
                  Minimum Peak
                </Label>
                <Input
                  id="minPeak"
                  type="number"
                  value={tempRules.minPeak || ""}
                  onChange={(e) =>
                    updateRule("minPeak", Number(e.target.value))
                  }
                  placeholder="0"
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Formatting Section */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase">
              Export Formatting
            </h4>

            <div className="flex items-center gap-3">
              <Checkbox
                id="formatCurrency"
                checked={tempRules.formatCurrency || false}
                onCheckedChange={(checked) =>
                  updateRule("formatCurrency", checked as boolean)
                }
              />
              <Label htmlFor="formatCurrency" className="text-sm cursor-pointer">
                Format as Currency
              </Label>
            </div>

            {tempRules.formatCurrency && (
              <div className="grid grid-cols-2 gap-4 ml-6">
                <div className="space-y-2">
                  <Label htmlFor="currencySymbol" className="text-sm">
                    Currency Symbol
                  </Label>
                  <Input
                    id="currencySymbol"
                    type="text"
                    value={tempRules.currencySymbol || "$"}
                    onChange={(e) =>
                      updateRule("currencySymbol", e.target.value)
                    }
                    maxLength={3}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="decimalPlaces" className="text-sm">
                    Decimal Places
                  </Label>
                  <Input
                    id="decimalPlaces"
                    type="number"
                    min={0}
                    max={5}
                    value={tempRules.decimalPlaces || 2}
                    onChange={(e) =>
                      updateRule("decimalPlaces", Number(e.target.value))
                    }
                    className="text-sm"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="highlightThreshold" className="text-sm">
                Highlight Threshold (values above this)
              </Label>
              <Input
                id="highlightThreshold"
                type="number"
                value={tempRules.highlightThreshold || ""}
                onChange={(e) =>
                  updateRule("highlightThreshold", Number(e.target.value))
                }
                placeholder="1000"
                className="text-sm"
              />
            </div>
          </div>

          {/* Filter Options */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase">
              Export Filters
            </h4>

            <div className="flex items-center gap-3">
              <Checkbox
                id="excludeBelowThreshold"
                checked={tempRules.excludeBelowThreshold || false}
                onCheckedChange={(checked) =>
                  updateRule("excludeBelowThreshold", checked as boolean)
                }
              />
              <Label
                htmlFor="excludeBelowThreshold"
                className="text-sm cursor-pointer"
              >
                Exclude items below minimum value
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button size="sm" onClick={handleApply}>
              Apply Rules
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
