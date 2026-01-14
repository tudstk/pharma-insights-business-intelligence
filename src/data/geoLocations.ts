export const CITY_COORDS: Record<
  string,
  { lat: number; lng: number; country: string }
> = {
  Berlin: { lat: 52.52, lng: 13.405, country: "Germany" },
  Munich: { lat: 48.1351, lng: 11.582, country: "Germany" },
  Hamburg: { lat: 53.5511, lng: 9.9937, country: "Germany" },
  Frankfurt: { lat: 50.1109, lng: 8.6821, country: "Germany" },

  Vienna: { lat: 48.2082, lng: 16.3738, country: "Austria" },
  Salzburg: { lat: 47.8095, lng: 13.055, country: "Austria" },

  Zurich: { lat: 47.3769, lng: 8.5417, country: "Switzerland" },
  Geneva: { lat: 46.2044, lng: 6.1432, country: "Switzerland" },

  Paris: { lat: 48.8566, lng: 2.3522, country: "France" },
  Lyon: { lat: 45.764, lng: 4.8357, country: "France" },

  Madrid: { lat: 40.4168, lng: -3.7038, country: "Spain" },
  Barcelona: { lat: 41.3851, lng: 2.1734, country: "Spain" },

  Rome: { lat: 41.9028, lng: 12.4964, country: "Italy" },
  Milan: { lat: 45.4642, lng: 9.19, country: "Italy" },
  Turin: { lat: 45.0703, lng: 7.6869, country: "Italy" },

  Warsaw: { lat: 52.2297, lng: 21.0122, country: "Poland" },
  Krakow: { lat: 50.0647, lng: 19.945, country: "Poland" },

  Prague: { lat: 50.0755, lng: 14.4378, country: "Czech Republic" },
  Brno: { lat: 49.1951, lng: 16.6068, country: "Czech Republic" },

  Budapest: { lat: 47.4979, lng: 19.0402, country: "Hungary" },

  Bucharest: { lat: 44.4268, lng: 26.1025, country: "Romania" },
  Cluj: { lat: 46.7712, lng: 23.6236, country: "Romania" },
  Timisoara: { lat: 45.7489, lng: 21.2087, country: "Romania" },

  Sofia: { lat: 42.6977, lng: 23.3219, country: "Bulgaria" },

  Copenhagen: { lat: 55.6761, lng: 12.5683, country: "Denmark" },

  Stockholm: { lat: 59.3293, lng: 18.0686, country: "Sweden" },
};
