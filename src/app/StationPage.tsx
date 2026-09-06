import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { splitKana } from '../domain/kana'
import { reconcileProgress } from '../domain/progress'
import { KanaStrip } from '../features/practice/KanaStrip'
import { useSpeech } from '../services/speech/useSpeech'
import { useAppState } from './AppState'

export function StationPage() {
  const { stationId = '' } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { stationById, state, setCurrentPosition } = useAppState()
  const { speak, available } = useSpeech()
  const station = stationById.get(stationId)
  const routeId = params.get('route') ?? 'toyoko'
  const storedPosition = station ? reconcileProgress(state.progress[station.id], station.reading).currentPosition : 0
  const [selectedPosition, setSelectedPosition] = useState(storedPosition)

  useEffect(() => {
    setSelectedPosition(storedPosition)
  }, [stationId, storedPosition])

  if (!station) return <NotFound />
  const progress = reconcileProgress(state.progress[station.id], station.reading)

  const startAt = (index: number) => {
    setCurrentPosition(station.id, index)
    navigate(`/practice/${station.id}/${index}?route=${routeId}`)
  }

  return (
    <div className={`page-shell station-page ${state.settings.reduceMotion ? 'reduce-motion' : ''}`}>
      <AppHeader compact />
      <main className="station-main">
        <Link className="back-link" to={`/?route=${routeId === 'found' ? 'toyoko' : routeId}`}>← ろせんず</Link>
        <article className="station-card">
          <div className="station-sign" aria-hidden="true"><span /><span /></div>
          <p className="eyebrow">この えきは</p>
          <h1>{station.displayName}</h1>
          <p className="station-big-reading">{station.reading}</p>
          <KanaStrip
            reading={station.reading}
            activeIndex={selectedPosition}
            practicedPositions={progress.practicedPositions}
            onSpeak={speak}
            onChoose={setSelectedPosition}
          />
          <p className="swipe-hint">もじを おすか、ゆびで よこに なぞって きいてみよう</p>
          <div className="station-actions">
            <button type="button" className="big-action big-action--listen" onClick={() => speak(station.speechText ?? station.reading)}>
              <span aria-hidden="true">♪</span><strong>きく</strong>
              {!available && <small>このたんまつでは おとがでません</small>}
            </button>
            <button type="button" className="big-action big-action--write" onClick={() => startAt(selectedPosition)}>
              <span aria-hidden="true">✎</span><strong>かく</strong>
              <small>{progress.practicedPositions.length}/{splitKana(station.reading).length} もじ</small>
            </button>
          </div>
        </article>
      </main>
    </div>
  )
}

function NotFound() {
  return (
    <main className="simple-message">
      <h1>えきが みつかりません</h1>
      <Link to="/">ろせんずへ もどる</Link>
    </main>
  )
}
