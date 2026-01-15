import * as XLSX from "xlsx";

type AnyRow = Record<string, unknown>;

export function exportToExcel(rows: AnyRow[], filename: string) {
  if (!rows.length) return;

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  const finalName = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, finalName);
}
