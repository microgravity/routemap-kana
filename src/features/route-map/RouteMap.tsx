import { useEffect, useRef } from 'react'
import { stationCodeForRoute } from '../../data/stations'
import type { Route } from '../../domain/types'
import { isStationPracticed } from '../../domain/progress'
import { useAppState } from '../../app/AppState'

interface Props {
  route: Route
  stationIds: string[]
  mode: 'all' | 'mine'
  zoom: number
  celebrateStationId?: string
  scrollResetKey: number
  onSelect: (stationId: string) => void
}

export function RouteMap({ route, stationIds, mode, zoom, celebrateStationId, scrollResetKey, onSelect }: Props) {
  const { stationById, state } = useAppState()
  const scrollRef = useRef<HTMLDivElement>(null)
  const width = Math.max(980, 140 + stationIds.length * 138)
  const y = 142
  const points = stationIds.map((id, index) => ({ id, x: 90 + index * ((width - 180) / Math.max(1, stationIds.length - 1)) }))
  const celebratedIndex = points.findIndex((point) => point.id === celebrateStationId)
  const celebratedPoint = points[celebratedIndex]
  const previousAdded = celebratedIndex > 0 && state.progress[points[celebratedIndex - 1]?.id]?.added
  const nextAdded = celebratedIndex >= 0 && celebratedIndex < points.length - 1 && state.progress[points[celebratedIndex + 1]?.id]?.added
  const trainStart = previousAdded
    ? points[celebratedIndex - 1].x
    : nextAdded
      ? points[celebratedIndex + 1].x
      : celebratedPoint
        ? Math.max(30, celebratedPoint.x - 90)
        : 0

  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0, behavior: state.settings.reduceMotion ? 'auto' : 'smooth' })
  }, [route.id, scrollResetKey, state.settings.reduceMotion])

  return (
    <div className="route-map-shell">
      <div ref={scrollRef} className="route-map-scroll" aria-label={`${route.name}の しゅうろくくかん`}>
        <div className="route-map-scale" style={{ width: `${zoom * 100}%`, minWidth: `${width * zoom}px` }}>
          <svg className="route-map" viewBox={`0 0 ${width} 310`} role="img" aria-labelledby="route-title route-desc">
          <title id="route-title">{route.name}</title>
          <desc id="route-desc">{route.segmentLabel}の模式路線図</desc>
          <line x1={points[0]?.x ?? 0} x2={points.at(-1)?.x ?? 0} y1={y} y2={y} className="route-line-shadow" />
          {points.slice(0, -1).map((point, index) => {
            const next = points[index + 1]
            const connected = Boolean(state.progress[point.id]?.added && state.progress[next.id]?.added)
            return (
              <line
                key={`${point.id}-${next.id}`}
                x1={point.x}
                x2={next.x}
                y1={y}
                y2={y}
                stroke={route.color}
                className={connected ? 'route-segment route-segment--connected' : 'route-segment'}
              />
            )
          })}
          {points.map(({ id, x }) => {
            const station = stationById.get(id)
            if (!station) return null
            const stationCode = stationCodeForRoute(route, id)
            const progress = state.progress[id]
            const added = Boolean(progress?.added)
            const practiced = isStationPracticed(progress, station.reading)
            const hidden = mode === 'mine' && !added
            return (
              <g
                key={id}
                className={`station-node ${added ? 'station-node--added' : ''} ${practiced ? 'station-node--complete' : ''} ${hidden ? 'station-node--hidden' : ''}`}
                role={hidden ? undefined : 'button'}
                tabIndex={hidden ? -1 : 0}
                aria-label={`${station.displayName}、${station.reading}${practiced ? '、ぜんぶかいた' : added ? '、いちぶかいた' : ''}`}
                onClick={() => { if (!hidden) onSelect(id) }}
                onKeyDown={(event) => {
                  if (!hidden && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault()
                    onSelect(id)
                  }
                }}
              >
                <circle cx={x} cy={y} r="38" className="station-hit" />
                <circle cx={x} cy={y} r={added ? 23 : 18} stroke={route.color} className="station-dot" />
                {added && <circle cx={x} cy={y} r="8" fill={route.color} className="station-core" />}
                {practiced && <text x={x + 26} y={y - 23} className="practice-badge">★</text>}
                {!hidden && (
                  <>
                    <text x={x} y={y + 67} className="station-label">{station.displayName}</text>
                    <text x={x} y={y + 94} className="station-reading">{station.reading}</text>
                    {stationCode && <text x={x} y={y + 119} className="station-code">{stationCode}</text>}
                  </>
                )}
              </g>
            )
          })}
          {celebratedPoint && (
            <g className="train-trip">
              <g className="train" transform={`translate(${celebratedPoint.x}, 80)`}>
                {!state.settings.reduceMotion && (
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    from={`${trainStart} 80`}
                    to={`${celebratedPoint.x} 80`}
                    dur="1.1s"
                    begin="0s"
                    fill="freeze"
                  />
                )}
                <rect x="-29" y="-20" width="58" height="36" rx="11" fill="#fffaf0" stroke={route.color} strokeWidth="5" />
                <rect x="-18" y="-11" width="15" height="12" rx="3" fill="#bce4e5" />
                <rect x="5" y="-11" width="15" height="12" rx="3" fill="#bce4e5" />
                <circle cx="-17" cy="19" r="6" fill="#34434a" />
                <circle cx="17" cy="19" r="6" fill="#34434a" />
              </g>
            </g>
          )}
          </svg>
        </div>
      </div>
      <button type="button" className="route-start-button" onClick={() => scrollRef.current?.scrollTo({ left: 0, behavior: state.settings.reduceMotion ? 'auto' : 'smooth' })}>← せんとうへ もどる</button>
    </div>
  )
}
