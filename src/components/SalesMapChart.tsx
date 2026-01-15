import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { exportToExcel } from "@/lib/exportExcel";
import html2canvas from "html2canvas";
import type { GeoPoint } from "@/lib/aggregateGeo";

interface SalesMapChartProps {
  points: GeoPoint[];
}

export const SalesMapChart = ({ points }: SalesMapChartProps) => {
  const mapRef = useRef<HTMLDivElement | null>(null);

  const handleExportCSV = () => {
    // Transform to include readable columns with sales data
    const exportData = points.map((p) => ({
      City: p.city,
      Country: p.country,
      "Total Sales": p.totalSales.toFixed(2),
      Latitude: p.lat,
      Longitude: p.lng,
    }));
    exportToExcel(exportData, "sales-map.xlsx");
  };

  const handleExportPNG = async () => {
    if (!mapRef.current) return;
    const canvas = await html2canvas(mapRef.current);
    const link = document.createElement("a");
    link.download = "sales-map.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  const maxValue = Math.max(...points.map((p) => p.totalSales));

  const radiusScale = (value: number) => 5 + (30 * value) / maxValue;

  return (
    <Card className="p-6 shadow-lg border-border/50">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Sales Heatmap</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPNG}>
            Export PNG
          </Button>
        </div>
      </div>

      <div ref={mapRef} className="h-[500px] w-full rounded overflow-hidden">
        <MapContainer
          center={[50, 10]}
          zoom={4}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {points.map((p) => (
            <CircleMarker
              key={p.city}
              center={[p.lat, p.lng]}
              radius={radiusScale(p.totalSales)}
              pathOptions={{ color: "red", fillColor: "red", fillOpacity: 0.6 }}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{p.city} ({p.country})</strong>
                  <br />
                  Total sales: {p.totalSales.toLocaleString()}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </Card>
  );
};
