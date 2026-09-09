import type { Route } from '../domain/types'
import { assertValidRailwayCatalog, validateRailwayCatalog, type RailwayDataset } from './railwayCatalogTypes'
import { sotetsuDataset, SOTETSU_OFFICIAL_STATION_COUNT, SOTETSU_ROUTE_COUNT } from './sotetsu'
import { tokyoMetroDataset, TOKYO_METRO_OFFICIAL_STATION_COUNT, TOKYO_METRO_ROUTE_COUNT } from './tokyoMetro'
import { tokyuDataset, TOKYU_OFFICIAL_STATION_COUNT, TOKYU_ROUTE_COUNT } from './tokyu'

export {
  SOTETSU_OFFICIAL_STATION_COUNT,
  SOTETSU_ROUTE_COUNT,
  TOKYO_METRO_OFFICIAL_STATION_COUNT,
  TOKYO_METRO_ROUTE_COUNT,
  TOKYU_OFFICIAL_STATION_COUNT,
  TOKYU_ROUTE_COUNT,
}

/**
 * 画面・保存処理が参照する唯一の統合地点。
 * 新しい会社は会社別データセットを作り、この配列へ追加する。
 */
export const railwayDatasets: readonly RailwayDataset[] = [
  tokyuDataset,
  sotetsuDataset,
  tokyoMetroDataset,
]

assertValidRailwayCatalog(railwayDatasets)

export const builtInStations = railwayDatasets.flatMap((dataset) => dataset.stations)
export const routes = railwayDatasets.flatMap((dataset) => dataset.routes)
export const railwayOperators = railwayDatasets.map((dataset) => dataset.operator)

export const OFFICIAL_ROUTE_COUNT = routes.length
export const OFFICIAL_STATION_COUNT = railwayDatasets.reduce((total, dataset) => total + dataset.officialStationCount, 0)
export const NORMALIZED_STATION_COUNT = builtInStations.length

export const railwayOperatorById = new Map(
  railwayOperators.map((operator) => [operator.id, operator]),
)

export function stationCodeForRoute(route: Route, stationId: string): string | undefined {
  const index = route.orderedStationIds.indexOf(stationId)
  return index >= 0 ? route.stationCodes[index] : undefined
}

export const builtInStationById = new Map(builtInStations.map((station) => [station.id, station]))

export const railwayCatalogErrors = validateRailwayCatalog(railwayDatasets)
