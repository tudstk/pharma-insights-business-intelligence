import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KpiRules, defaultKpiRules } from "@/lib/kpiConfig";

interface Props {
  rules: KpiRules;
  onApply: (rules: KpiRules) => void;
  onExport: () => void;
}

export const KpiSidebar = ({ rules, onApply, onExport }: Props) => {
  const [localRules, setLocalRules] = useState<KpiRules>(rules);

  const update = (key: keyof KpiRules, value: number) => {
    setLocalRules((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="p-4 w-72 shadow-md h-fit sticky top-6">
      <h2 className="text-xl font-semibold mb-3">KPI Rules</h2>

      <label className="text-sm">Min Value</label>
      <input
        type="number"
        className="input"
        defaultValue={localRules.minValue}
        onChange={(e) => update("minValue", Number(e.target.value))}
      />

      <label className="text-sm mt-2">Max Value</label>
      <input
        type="number"
        className="input"
        defaultValue={localRules.maxValue}
        onChange={(e) => update("maxValue", Number(e.target.value))}
      />

      <label className="text-sm mt-2">Min Growth (%)</label>
      <input
        type="number"
        className="input"
        defaultValue={localRules.minGrowth}
        onChange={(e) => update("minGrowth", Number(e.target.value))}
      />

      <label className="text-sm mt-2">Min Peak</label>
      <input
        type="number"
        className="input"
        defaultValue={localRules.minPeak}
        onChange={(e) => update("minPeak", Number(e.target.value))}
      />

      <Button onClick={() => onApply(localRules)} className="mt-4 w-full">
        Apply Rules
      </Button>

      <Button variant="outline" onClick={onExport} className="mt-2 w-full">
        Export Excel
      </Button>
    </Card>
  );
};
