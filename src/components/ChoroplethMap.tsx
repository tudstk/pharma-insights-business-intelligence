import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { exportToExcel } from "@/lib/exportExcel";
import type { GeoPoint } from "@/lib/aggregateGeo";
import countries from "@/data/countries.geo.json";
import html2canvas from "html2canvas";

interface ChoroplethMapProps {
  points: GeoPoint[];
}

export const ChoroplethMap = ({ points }: ChoroplethMapProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const countrySales: Record<string, number> = {};

  points.forEach((p) => {
    countrySales[p.country] = (countrySales[p.country] || 0) + p.totalSales;
  });

  const handleExportPNG = async () => {
    if (!containerRef.current) return;
    const canvas = await html2canvas(containerRef.current, {
      useCORS: true,
    });
    const link = document.createElement("a");
    link.download = "choropleth-map.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleExportCSV = () => {
    const exportArr = Object.entries(countrySales).map(([country, sales]) => ({
      country,
      totalSales: sales,
    }));
    exportToExcel(exportArr, "choropleth-data.csv");
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [10, 50],
      zoom: 3,
    });

    countries.features.forEach((feature: any) => {
      const countryName = feature.properties.ADMIN;
      feature.properties.sales = countrySales[countryName] || 0;
    });

    map.on("load", () => {
      map.addSource("countries", {
        type: "geojson",
        data: countries as any,
      });

      map.addLayer({
        id: "country-fills",
        type: "fill",
        source: "countries",
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "sales"],
            0, "#d9ecff",
            50000, "#66b3ff",
            200000, "#007fff",
            500000, "#003d80"
          ],
          "fill-outline-color": "#333",
          "fill-opacity": 0.8,
        },
      });
    });

    return () => map.remove();
  }, []);

  return (
    <Card className="p-6 shadow-lg border-border/50">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Sales Choropleth Map</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>Export CSV</Button>
          <Button variant="outline" size="sm" onClick={handleExportPNG}>Export PNG</Button>
        </div>
      </div>
      <div ref={containerRef} className="h-[500px] w-full rounded overflow-hidden" />
    </Card>
  );
};
