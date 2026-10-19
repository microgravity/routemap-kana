import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { MaterialIcon } from '../components/MaterialIcon'
import { railwayOperators, routes, stationCodeForRoute } from '../data/stations'
import { readingForMode, splitKana } from '../domain/kana'
import { reconcileProgress } from '../domain/progress'
import { isRouteUnlocked } from '../domain/unlocks'
import { KanaStrip } from '../features/practice/KanaStrip'
import { useSpeech } from '../services/speech/useSpeech'
import { useAppState } from './AppState'

export function StationPage() {
  const { stationId = '' } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { stationById, state, routeStationIds, setCurrentPosition, learningMode, progress: modeProgress, setLearningMode } = useAppState()
  const { speak, available } = useSpeech()
  const station = stationById.get(stationId)
  const requestedRouteId = params.get('route') ?? 'toyoko'
  const requestedLearningMode = params.get('learning') === 'katakana' ? 'katakana' : params.get('learning') === 'hiragana' ? 'hiragana' : learningMode
  useEffect(() => { setLearningMode(requestedLearningMode) }, [requestedLearningMode, setLearningMode])
  const targetReading = station ? readingForMode(station.reading, learningMode) : ''
  const storedPosition = station ? reconcileProgress(modeProgress[station.id], targetReading).currentPosition : 0
  const focusParam = params.get('focus')
  const focusValue = focusParam === null ? Number.NaN : Number(focusParam)
  const focusedPosition = station && Number.isInteger(focusValue) && focusValue >= 0 && focusValue < splitKana(targetReading).length ? focusValue : null
  const [selectedPosition, setSelectedPosition] = useState(focusedPosition ?? storedPosition)

  useEffect(() => {
    setSelectedPosition(focusedPosition ?? storedPosition)
  }, [focusedPosition, stationId, storedPosition])

  if (!station) return <NotFound />
  const progress = reconcileProgress(modeProgress[station.id], targetReading)
  const unlockedRoutes = routes.filter((route) => isRouteUnlocked(route, railwayOperators, state.unlockedMilestones))
  const stationRoutes = unlockedRoutes.filter((route) => routeStationIds(route.id).includes(station.id))
  if (station.builtIn && stationRoutes.length === 0) return <LockedStation />
  const routeId = stationRoutes.some((route) => route.id === requestedRouteId)
    ? requestedRouteId
    : stationRoutes[0]?.id ?? 'found'
  const activeRoute = stationRoutes.find((route) => route.id === routeId)
  const activeRouteStationIds = activeRoute ? routeStationIds(activeRoute.id) : []
  const stationIndex = activeRouteStationIds.indexOf(station.id)
  const previousStation = stationIndex > 0 ? stationById.get(activeRouteStationIds[stationIndex - 1]) : undefined
  const nextStation = stationIndex >= 0 && stationIndex < activeRouteStationIds.length - 1
    ? stationById.get(activeRouteStationIds[stationIndex + 1])
    : undefined
  const stationCode = activeRoute ? stationCodeForRoute(activeRoute, station.id) : undefined
  const stationNameLength = Array.from(station.displayName).length
  const backToKana = params.get('from') === 'kana' && params.get('kana')
  const modeQuery = `learning=${learningMode}`
  const backUrl = backToKana ? `/kana/${encodeURIComponent(params.get('kana')!)}?${modeQuery}` : `/?route=${routeId === 'found' ? 'toyoko' : routeId}&${modeQuery}`

  const startAt = (index: number) => {
    setCurrentPosition(station.id, index)
    navigate(`/practice/${station.id}/${index}?route=${routeId}&${modeQuery}`)
  }

  return (
    <div className={`page-shell station-page ${state.settings.reduceMotion ? 'reduce-motion' : ''}`}>
      <AppHeader compact />
      <main className="station-main">
        <Link className="back-link" to={backUrl}><MaterialIcon name="arrow_back" />{backToKana ? 'もじの えき' : 'ろせんず'}</Link>
        <article className="station-card">
          <section
            className={`station-name-board ${stationNameLength >= 8 ? 'station-name-board--long' : ''}`}
            style={{ '--station-route-color': activeRoute?.color ?? '#66bbb1' } as React.CSSProperties}
            aria-label={`${station.displayName}の えきめいひょう`}
          >
            <div className="station-sign" aria-hidden="true"><span /><span /></div>
            <div className="station-board-name">
              <p className="eyebrow">この えきは</p>
              <h1>{station.displayName}</h1>
              <p className="station-big-reading">{targetReading}</p>
            </div>
            <div className="station-board-neighbors">
              <BoardNeighbor station={previousStation} direction="まえの えき" routeId={routeId} learningMode={learningMode} />
              <div className="station-board-route">
                <small>{activeRoute?.name ?? 'みつけた えき'}</small>
                {stationCode && <strong>{stationCode}</strong>}
              </div>
              <BoardNeighbor station={nextStation} direction="つぎの えき" routeId={routeId} learningMode={learningMode} next />
            </div>
          </section>
          <div className="route-badges route-badges--center" aria-label="この えきの ろせん">
            {stationRoutes.map((route) => (
              <span key={route.id} className="route-badge" style={{ '--route-color': route.color } as React.CSSProperties}>
                <i aria-hidden="true" />{route.name}{stationCodeForRoute(route, station.id) && <small>{stationCodeForRoute(route, station.id)}</small>}
              </span>
            ))}
          </div>
          <KanaStrip
            reading={targetReading}
            activeIndex={selectedPosition}
            practicedPositions={progress.practicedPositions}
            freeWrittenPositions={progress.freeWrittenPositions}
            onSpeak={speak}
            onChoose={setSelectedPosition}
          />
          <p className="swipe-hint">もじを おすか、ゆびで よこに なぞって きいてみよう</p>
          <div className="station-actions">
            <button type="button" className="big-action big-action--listen" onClick={() => speak(station.speechText ?? station.reading)}>
              <MaterialIcon name="volume_up" filled /><strong>きく</strong>
              {!available && <small>このたんまつでは おとがでません</small>}
            </button>
            <button type="button" className="big-action big-action--write" onClick={() => startAt(selectedPosition)}>
              <MaterialIcon name="draw" filled /><strong>かく</strong>
              <small>{progress.practicedPositions.length}/{splitKana(targetReading).length} もじ</small>
            </button>
          </div>
        </article>
      </main>
    </div>
  )
}

function BoardNeighbor({ station, direction, routeId, learningMode, next = false }: { station?: { id: string; displayName: string; reading: string }; direction: string; routeId: string; learningMode: 'hiragana' | 'katakana'; next?: boolean }) {
  const className = `station-board-neighbor ${next ? 'station-board-neighbor--next' : ''}`
  const content = (
    <>
      {station && <><small>{next ? `${direction} →` : `← ${direction}`}</small><strong>{station.displayName}</strong><span>{readingForMode(station.reading, learningMode)}</span></>}
    </>
  )
  return station
    ? <Link className={className} to={`/station/${station.id}?route=${routeId}&learning=${learningMode}`} aria-label={`${direction}、${station.displayName}、${readingForMode(station.reading, learningMode)}`}>{content}</Link>
    : <div className={className} aria-hidden="true" />
}

function NotFound() {
  return (
    <main className="simple-message">
      <h1>えきが みつかりません</h1>
      <Link to="/">ろせんずへ もどる</Link>
    </main>
  )
}

function LockedStation() {
  return (
    <main className="simple-message">
      <MaterialIcon name="lock" filled />
      <h1>まだ はいれない えきだよ</h1>
      <Link to="/">ろせんずへ もどる</Link>
    </main>
  )
}
