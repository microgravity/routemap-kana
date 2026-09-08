import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { routes } from '../data/stations'
import { completedStationCount } from '../domain/progress'
import { RouteMap } from '../features/route-map/RouteMap'
import { useAppState } from './AppState'

interface CelebrationState {
  celebrateStationId?: string
  firstAdd?: boolean
  allFreeWritten?: boolean
}

export function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const { state, stationById, routeStationIds, storageWarning } = useAppState()
  const [mode, setMode] = useState<'all' | 'mine'>('all')
  const [zoom, setZoom] = useState(1)
  const [mapResetKey, setMapResetKey] = useState(0)
  const selectedRoute = routes.find((route) => route.id === params.get('route')) ?? routes[0]
  const routeProgress = useMemo(() => new Map(routes.map((route) => {
    const stationIds = routeStationIds(route.id)
    return [route.id, {
      stationIds,
      completed: completedStationCount(stationIds, stationById, state.progress),
    }]
  })), [routeStationIds, state.progress, stationById])
  const selectedProgress = routeProgress.get(selectedRoute.id) ?? { stationIds: [], completed: 0 }
  const selectedSegment = selectedRoute.segmentLabel.replace(/（\d+えき）$/u, '')
  const celebration = (location.state ?? {}) as CelebrationState
  const customUnplaced = useMemo(
    () => [...stationById.values()].filter((station) => !station.builtIn && !state.customStations.find((item) => item.id === station.id)?.routeId),
    [state.customStations, stationById],
  )

  const chooseRoute = (routeId: string) => {
    setParams({ route: routeId })
    setZoom(1)
    setMapResetKey((value) => value + 1)
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
              <strong>{celebration.allFreeWritten ? 'おてほんなしで ぜんぶ かけた！' : celebration.firstAdd ? 'えきが ふえた！' : 'また かけたね！'}</strong>
              <span>{stationById.get(celebration.celebrateStationId)?.reading}</span>
            </div>
          </div>
        )}

        <Link className="kana-search-link" to="/kana">
          <span className="kana-search-sample" aria-hidden="true">あ</span>
          <span><strong>ひらがなから さがす</strong><small>もじを おして、えきを みつけよう</small></span>
          <i aria-hidden="true">→</i>
        </Link>

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
                <button type="button" onClick={() => { setZoom(.85); setMapResetKey((value) => value + 1) }}>ぜんたいを みる</button>
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
                aria-pressed={route.id === selectedRoute.id}
                onClick={() => chooseRoute(route.id)}
              >
                <span aria-hidden="true" />
                <strong>{route.name}</strong>
                <small>{routeProgress.get(route.id)?.completed ?? 0}/{routeProgress.get(route.id)?.stationIds.length ?? 0}</small>
              </button>
            ))}
          </nav>
          <div className="route-progress" style={{ '--route-color': selectedRoute.color } as React.CSSProperties}>
            <div className="route-progress-copy">
              <strong>{selectedRoute.name}</strong>
              <span>{selectedProgress.completed} / {selectedProgress.stationIds.length} えき かけた</span>
            </div>
            <progress
              value={selectedProgress.completed}
              max={Math.max(1, selectedProgress.stationIds.length)}
              aria-label={`${selectedRoute.name}、${selectedProgress.completed}/${selectedProgress.stationIds.length}えき かけた`}
            />
          </div>
          <div className="segment-label">しゅうろくくかん：{selectedSegment}（{selectedProgress.stationIds.length}えき）</div>
          {selectedRoute.note && <p className="route-note">{selectedRoute.note}</p>}
          <RouteMap
            route={selectedRoute}
            stationIds={selectedProgress.stationIds}
            mode={mode}
            zoom={zoom}
            celebrateStationId={celebration.celebrateStationId}
            scrollResetKey={mapResetKey}
            onSelect={(stationId) => navigate(`/station/${stationId}?route=${selectedRoute.id}`)}
          />
          <div className="map-legend" aria-label="えきの しるし">
            <span><i className="legend-dot" />まだの えき</span>
            <span><i className="legend-dot legend-dot--added" />いちぶ かいた</span>
            <span><i className="legend-star">★</i>ぜんぶ かいた</span>
            <span><i className="legend-star legend-star--free-written">★★</i>おてほんなしで かいた</span>
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
