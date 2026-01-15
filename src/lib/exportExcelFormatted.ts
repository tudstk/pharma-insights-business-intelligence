import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { KpiRules } from "./kpiConfig";

export function exportExcelFormatted(data: any[], rules: KpiRules) {
  const worksheetData = data.map((row) => {
    const valid =
      row.value >= (rules.minValue ?? 0) &&
      row.value <= (rules.maxValue ?? 999999) &&
      row.growth >= (rules.minGrowth ?? 0) &&
      row.peak >= (rules.minPeak ?? 0);

    return {
      ...row,
      _style: {
        fill: {
          fgColor: { rgb: valid ? "C6EFCE" : "FFC7CE" },
        },
      },
    };
  });

  const ws = XLSX.utils.json_to_sheet(worksheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "KPI Export");

  const excel = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([excel]), "kpi-export.xlsx");
}
