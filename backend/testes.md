POST /api/flights

{
  "tripId": 1,
  "flightNumber": "TAP555",
  "airline": "TAP Portugal",
  "departureAirport": "LIS",
  "arrivalAirport": "OPO",
  "departureDatetime": "2026-06-02T10:00:00.000Z",
  "arrivalDatetime": "2026-06-02T11:00:00.000Z"
}

Resultado esperado: Código 211 Created e os dados normalizados em camelCase
