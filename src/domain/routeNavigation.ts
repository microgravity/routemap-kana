export function nextStationIdOnRoute(stationIds: string[], stationId: string): string | undefined {
  const index = stationIds.indexOf(stationId)
  return index >= 0 && index < stationIds.length - 1 ? stationIds[index + 1] : undefined
}
