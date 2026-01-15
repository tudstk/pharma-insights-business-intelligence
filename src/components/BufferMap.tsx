import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
// import * as turf from "@turf/turf";

export const BufferMap = ({ points }) => {
  // Buffer functionality requires @turf/turf package
  // TODO: Install @turf/turf and uncomment the buffer logic below
  
  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-2">Geospatial Buffer Map</h2>

      <MapContainer
        center={[48, 10]}
        zoom={5}
        style={{ height: "480px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {/* Buffers will render here once @turf/turf is installed */}
      </MapContainer>
    </div>
  );
};
