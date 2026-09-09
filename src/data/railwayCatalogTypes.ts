import type { RailwayOperator, Route, Station } from '../domain/types'

export type RailwayIdScheme = 'legacy-v1' | 'jp-v2'

export interface RailwayDataset {
  datasetId: string
  idScheme: RailwayIdScheme
  operator: RailwayOperator
  stations: readonly Station[]
  routes: readonly Route[]
  officialStationCount: number
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u

function requireSlug(value: string, label: string): string {
  if (!slugPattern.test(value)) throw new Error(`${label}は半角英小文字・数字・ハイフンで指定してください: ${value}`)
  return value
}

/**
 * 全国追加用の不変ID。既存公開IDは変更せず、新規データだけこの形式を使う。
 * 駅は事業者ではなく実在地点を表すため、都道府県JISコードと地点slugで共有する。
 */
export const nationwideRailwayId = {
  dataset(operatorSlug: string): string {
    return `jp.dataset.${requireSlug(operatorSlug, '事業者slug')}`
  },
  operator(operatorSlug: string): string {
    return `jp.operator.${requireSlug(operatorSlug, '事業者slug')}`
  },
  route(operatorSlug: string, routeSlug: string): string {
    return `jp.route.${requireSlug(operatorSlug, '事業者slug')}.${requireSlug(routeSlug, '路線slug')}`
  },
  station(prefectureJisCode: string, placeSlug: string): string {
    if (!/^\d{2}$/u.test(prefectureJisCode)) throw new Error(`都道府県JISコードは2桁で指定してください: ${prefectureJisCode}`)
    return `jp.station.${prefectureJisCode}.${requireSlug(placeSlug, '駅地点slug')}`
  },
}

function duplicates(values: readonly string[]): string[] {
  const seen = new Set<string>()
  const duplicateIds = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) duplicateIds.add(value)
    seen.add(value)
  }
  return [...duplicateIds]
}

export function validateRailwayCatalog(datasets: readonly RailwayDataset[]): string[] {
  const errors: string[] = []
  const datasetIds = datasets.map((dataset) => dataset.datasetId)
  const operators = datasets.map((dataset) => dataset.operator)
  const stations = datasets.flatMap((dataset) => dataset.stations)
  const routes = datasets.flatMap((dataset) => dataset.routes)
  const stationIds = stations.map((station) => station.id)
  const routeIds = routes.map((route) => route.id)

  for (const id of duplicates(datasetIds)) errors.push(`dataset IDが重複しています: ${id}`)
  for (const id of duplicates(operators.map((operator) => operator.id))) errors.push(`operator IDが重複しています: ${id}`)
  for (const id of duplicates(stationIds)) errors.push(`station IDが重複しています: ${id}`)
  for (const id of duplicates(routeIds)) errors.push(`route IDが重複しています: ${id}`)

  const knownStationIds = new Set(stationIds)
  for (const dataset of datasets) {
    const { operator } = dataset
    const ownedRouteIds = dataset.routes.map((route) => route.id)
    if (new Set(operator.routeIds).size !== operator.routeIds.length) errors.push(`${operator.id}のrouteIdsが重複しています`)
    if (operator.routeIds.length !== ownedRouteIds.length || operator.routeIds.some((id) => !ownedRouteIds.includes(id))) {
      errors.push(`${operator.id}のrouteIdsとデータセットの路線が一致しません`)
    }

    if (dataset.idScheme === 'jp-v2') {
      const datasetMatch = /^jp\.dataset\.([a-z0-9]+(?:-[a-z0-9]+)*)$/u.exec(dataset.datasetId)
      const operatorMatch = /^jp\.operator\.([a-z0-9]+(?:-[a-z0-9]+)*)$/u.exec(operator.id)
      if (!datasetMatch) errors.push(`全国版dataset ID形式が不正です: ${dataset.datasetId}`)
      if (!operatorMatch) errors.push(`全国版operator ID形式が不正です: ${operator.id}`)
      if (datasetMatch && operatorMatch && datasetMatch[1] !== operatorMatch[1]) {
        errors.push(`${dataset.datasetId}と${operator.id}の事業者slugが一致しません`)
      }
      for (const route of dataset.routes) {
        if (!operatorMatch || !new RegExp(`^jp\\.route\\.${operatorMatch[1]}\\.[a-z0-9]+(?:-[a-z0-9]+)*$`, 'u').test(route.id)) {
          errors.push(`全国版route ID形式が不正です: ${route.id}`)
        }
      }
      for (const station of dataset.stations) {
        if (!/^jp\.station\.\d{2}\.[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(station.id)) errors.push(`全国版station ID形式が不正です: ${station.id}`)
      }
    }

    for (const route of dataset.routes) {
      if (route.operatorId !== operator.id) errors.push(`${route.id}のoperatorIdが${operator.id}と一致しません`)
      if (route.orderedStationIds.length !== route.stationCodes.length) errors.push(`${route.id}の駅IDと駅番号の件数が一致しません`)
      for (const stationId of route.orderedStationIds) {
        if (!knownStationIds.has(stationId)) errors.push(`${route.id}が未登録station IDを参照しています: ${stationId}`)
      }
    }
  }

  return errors
}

export function assertValidRailwayCatalog(datasets: readonly RailwayDataset[]): void {
  const errors = validateRailwayCatalog(datasets)
  if (errors.length > 0) throw new Error(`鉄道データカタログが不正です:\n${errors.join('\n')}`)
}
