import type { RailwayDataset } from './railwayCatalogTypes'
import { defineRailwayDataset, defineRoute, nationwideRailwayId, numberedStops, validateRailwayCatalog } from './railwayCatalogTypes'
import { railwayCatalogErrors, railwayDatasets } from './stations'

describe('全国版の鉄道データカタログ', () => {
  it('4社を会社別データセットとして矛盾なく統合する', () => {
    expect(railwayDatasets.map((dataset) => dataset.datasetId)).toEqual([
      'jp.dataset.tokyu',
      'jp.dataset.sotetsu',
      'jp.dataset.tokyo-metro',
      'jp.dataset.toei',
    ])
    expect(railwayDatasets.slice(0, 3).every((dataset) => dataset.idScheme === 'legacy-v1')).toBe(true)
    expect(railwayDatasets[3].idScheme).toBe('jp-v2')
    expect(railwayCatalogErrors).toEqual([])
  })

  it('JR西日本の姫新線を追加するときの全国固有IDを生成できる', () => {
    expect(nationwideRailwayId.dataset('jr-west')).toBe('jp.dataset.jr-west')
    expect(nationwideRailwayId.operator('jr-west')).toBe('jp.operator.jr-west')
    expect(nationwideRailwayId.route('jr-west', 'kishin')).toBe('jp.route.jr-west.kishin')
    expect(nationwideRailwayId.station('28', 'himeji')).toBe('jp.station.28.himeji')
    expect(nationwideRailwayId.station('33', 'niimi')).toBe('jp.station.33.niimi')
  })

  it('全国版IDを使った単独路線データセットを検証できる', () => {
    const operatorId = nationwideRailwayId.operator('jr-west')
    const routeId = nationwideRailwayId.route('jr-west', 'kishin')
    const himejiId = nationwideRailwayId.station('28', 'himeji')
    const niimiId = nationwideRailwayId.station('33', 'niimi')
    const route = defineRoute({
      id: routeId,
      operatorId,
      name: 'きしんせん',
      color: '#b267aa',
      segmentLabel: 'ひめじ 〜 にいみ',
      stops: numberedStops([himejiId, niimiId], 'JRK'),
      sourceUrl: 'https://www.jr-odekake.net/',
    })
    const dataset = defineRailwayDataset({
      datasetId: nationwideRailwayId.dataset('jr-west'),
      idScheme: 'jp-v2',
      officialStationCount: 2,
      operator: {
        id: operatorId,
        name: 'じぇいあーるにしにほん',
        displayName: '西日本旅客鉄道',
        shortName: 'じぇいあーるにしにほん',
        color: '#2870b8',
        sourceUrl: 'https://www.jr-odekake.net/',
      },
      stations: [
        { id: himejiId, displayName: '姫路', reading: 'ひめじ', builtIn: true },
        { id: niimiId, displayName: '新見', reading: 'にいみ', builtIn: true },
      ],
      routes: [route],
    })

    expect(route.orderedStationIds).toEqual([himejiId, niimiId])
    expect(route.stationCodes).toEqual(['JRK01', 'JRK02'])
    expect(dataset.operator.routeIds).toEqual([routeId])
    expect(validateRailwayCatalog([dataset])).toEqual([])
  })

  it('重複IDと未登録駅参照を検出する', () => {
    const invalid = railwayDatasets[0]
    const duplicateDataset: RailwayDataset = {
      ...invalid,
      routes: [{
        ...invalid.routes[0],
        orderedStationIds: [...invalid.routes[0].orderedStationIds, 'missing-station'],
      }],
      operator: { ...invalid.operator, routeIds: [invalid.routes[0].id] },
    }
    const errors = validateRailwayCatalog([invalid, duplicateDataset])

    expect(errors.some((error) => error.includes('dataset IDが重複'))).toBe(true)
    expect(errors.some((error) => error.includes('station IDが重複'))).toBe(true)
    expect(errors.some((error) => error.includes('未登録station ID'))).toBe(true)
  })

  it('不正な都道府県コードやslugを拒否する', () => {
    expect(() => nationwideRailwayId.station('兵庫', 'himeji')).toThrow()
    expect(() => nationwideRailwayId.route('JR-West', 'kishin')).toThrow()
    expect(() => nationwideRailwayId.station('28', '姫路')).toThrow()
  })

  it('路線内の重複と非NFCの読み、HTTP出典を検出する', () => {
    const original = railwayDatasets[0]
    const firstStation = original.stations[0]
    const invalid: RailwayDataset = {
      ...original,
      operator: { ...original.operator, sourceUrl: 'http://example.com/' },
      stations: [{ ...firstStation, reading: 'か\u3099' }],
      routes: [{
        ...original.routes[0],
        orderedStationIds: [firstStation.id, firstStation.id],
        stationCodes: ['X01', 'X01'],
        sourceUrl: 'http://example.com/route',
      }],
    }
    invalid.operator.routeIds = [invalid.routes[0].id]
    const errors = validateRailwayCatalog([invalid])

    expect(errors.some((error) => error.includes('出典URLはHTTPS'))).toBe(true)
    expect(errors.some((error) => error.includes('Unicode NFC'))).toBe(true)
    expect(errors.some((error) => error.includes('駅IDが重複'))).toBe(true)
    expect(errors.some((error) => error.includes('駅番号が重複'))).toBe(true)
  })
})
