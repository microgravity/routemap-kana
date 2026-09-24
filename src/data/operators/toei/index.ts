import { TOEI_SUBWAY_UNLOCK_MILESTONE_ID } from '../../../config/unlockCampaigns.ts'
import { defineRailwayDataset, nationwideRailwayId } from '../../railwayCatalogTypes.ts'
import { toeiRoutes } from './routes.ts'
import { TOEI_SOURCE, toeiStations } from './stations.ts'

export const TOEI_SUBWAY_ROUTE_COUNT = 4
export const TOEI_SUBWAY_OFFICIAL_STATION_COUNT = 106

export const toeiDataset = defineRailwayDataset({
  datasetId: nationwideRailwayId.dataset('toei'),
  idScheme: 'jp-v2',
  operator: {
    id: nationwideRailwayId.operator('toei'),
    name: 'とえいちかてつ',
    displayName: '東京都交通局',
    shortName: 'とえい',
    color: '#137c91',
    sourceUrl: TOEI_SOURCE,
    unlockMilestoneId: TOEI_SUBWAY_UNLOCK_MILESTONE_ID,
  },
  stations: toeiStations,
  routes: toeiRoutes,
  officialStationCount: TOEI_SUBWAY_OFFICIAL_STATION_COUNT,
})

export const toeiOperator = toeiDataset.operator
export { toeiRoutes, toeiStations }
