import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { routes } from '../data/stations'
import { RouteMap } from '../features/route-map/RouteMap'
import { useAppState } from './AppState'

interface CelebrationState {
  celebrateStationId?: string
  firstAdd?: boolean
}

export function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const { state, stationById, routeStationIds, storageWarning } = useAppState()
  const [mode, setMode] = useState<'all' | 'mine'>('all')
  const [zoom, setZoom] = useState(1)
  const selectedRoute = routes.find((route) => route.id === params.get('route')) ?? routes[0]
  const celebration = (location.state ?? {}) as CelebrationState
  const customUnplaced = useMemo(
    () => [...stationById.values()].filter((station) => !station.builtIn && !state.customStations.find((item) => item.id === station.id)?.routeId),
    [state.customStations, stationById],
  )

  const chooseRoute = (routeId: string) => {
    setParams({ route: routeId })
    setZoom(1)
  }

  return (
    <div className={`page-shell ${state.settings.reduceMotion ? 'reduce-motion' : ''}`}>
      <AppHeader />
      <main className="home-main">
        {storageWarning && <div className="notice notice--warning">{storageWarning}</div>}
        {celebration.celebrateStationId && (
          <div className="celebration" role="status">
            <span className="celebration-spark" aria-hidden="true">✦</span>
            <div>
              <strong>{celebration.firstAdd ? 'えきが ふえた！' : 'また かけたね！'}</strong>
              <span>{stationById.get(celebration.celebrateStationId)?.reading}</span>
            </div>
          </div>
        )}

        <section className="map-card" aria-labelledby="map-heading">
          <div className="map-heading-row">
            <div>
              <p className="eyebrow">きょうは どこへ いこう？</p>
              <h1 id="map-heading">ろせんず</h1>
            </div>
            <div className="map-controls">
              <div className="segmented" aria-label="えきの ひょうじ">
                <button type="button" className={mode === 'all' ? 'selected' : ''} onClick={() => setMode('all')}>ぜんぶ</button>
                <button type="button" className={mode === 'mine' ? 'selected' : ''} onClick={() => setMode('mine')}>じぶんの えき</button>
              </div>
              <div className="zoom-controls" aria-label="ろせんずの おおきさ">
                <button type="button" aria-label="ちいさくする" onClick={() => setZoom((value) => Math.max(.85, value - .15))}>−</button>
                <button type="button" onClick={() => setZoom(1)}>ぜんたい</button>
                <button type="button" aria-label="おおきくする" onClick={() => setZoom((value) => Math.min(1.45, value + .15))}>＋</button>
              </div>
            </div>
          </div>

          <nav className="route-tabs" aria-label="ろせんを えらぶ">
            {routes.map((route) => (
              <button
                key={route.id}
                type="button"
                className={route.id === selectedRoute.id ? 'route-tab route-tab--active' : 'route-tab'}
                style={{ '--route-color': route.color } as React.CSSProperties}
                onClick={() => chooseRoute(route.id)}
              >
                <span aria-hidden="true" />{route.name}
              </button>
            ))}
          </nav>
          <div className="segment-label">しゅうろくくかん：{selectedRoute.segmentLabel}</div>
          <RouteMap
            route={selectedRoute}
            stationIds={routeStationIds(selectedRoute.id)}
            mode={mode}
            zoom={zoom}
            celebrateStationId={celebration.celebrateStationId}
            onSelect={(stationId) => navigate(`/station/${stationId}?route=${selectedRoute.id}`)}
          />
          <div className="map-legend" aria-label="えきの しるし">
            <span><i className="legend-dot" />まだの えき</span>
            <span><i className="legend-dot legend-dot--added" />じぶんの えき</span>
            <span><i className="legend-star">★</i>ぜんぶの もじを れんしゅう</span>
          </div>
        </section>

        {customUnplaced.length > 0 && (
          <section className="found-stations" aria-labelledby="found-heading">
            <div>
              <p className="eyebrow">おうちのひとが いれた</p>
              <h2 id="found-heading">みつけた えき</h2>
            </div>
            <div className="found-list">
              {customUnplaced.map((station) => (
                <button key={station.id} type="button" onClick={() => navigate(`/station/${station.id}?route=found`)}>
                  <strong>{station.displayName}</strong><span>{station.reading}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
