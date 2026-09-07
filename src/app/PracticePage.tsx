import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { hasGlyph } from '../data/kana'
import type { Point } from '../domain/input'
import { splitKana, speechForKana } from '../domain/kana'
import { nextUnpracticedPosition, reconcileProgress } from '../domain/progress'
import { evaluateTrace, type TraceGuideStroke } from '../domain/traceEvaluation'
import { KanaStrip } from '../features/practice/KanaStrip'
import { sampleGlyphGuide } from '../features/practice/sampleGlyphGuide'
import { WritingPad } from '../features/practice/WritingPad'
import { useSpeech } from '../services/speech/useSpeech'
import { useAppState } from './AppState'

export function PracticePage() {
  const { stationId = '', position = '0' } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { stationById, state, setCurrentPosition, markPositionComplete } = useAppState()
  const { speak } = useSpeech()
  const station = stationById.get(stationId)
  const characters = useMemo(() => splitKana(station?.reading ?? ''), [station?.reading])
  const parsed = Number(position)
  const index = Number.isInteger(parsed) && parsed >= 0 && parsed < characters.length ? parsed : 0
  const routeId = params.get('route') ?? 'toyoko'
  const [mode, setMode] = useState<'trace' | 'free'>('trace')
  const [showGuide, setShowGuide] = useState(true)
  const [hasInk, setHasInk] = useState(false)
  const [inputStrokes, setInputStrokes] = useState<Point[][]>([])
  const [traceMessage, setTraceMessage] = useState('')
  const [resetKey, setResetKey] = useState(0)
  const [replayKey, setReplayKey] = useState(0)
  const [reward, setReward] = useState<{ firstAdd: boolean; allComplete: boolean } | null>(null)
  const kana = characters[index] ?? ''
  const traceAvailable = hasGlyph(kana)
  const activeMode = mode === 'trace' && traceAvailable ? 'trace' : 'free'
  const [traceGuide, setTraceGuide] = useState<TraceGuideStroke[] | null>(null)

  useEffect(() => {
    if (station) setCurrentPosition(station.id, index)
  }, [index, setCurrentPosition, station])

  useEffect(() => {
    setTraceGuide(activeMode === 'trace' ? sampleGlyphGuide(kana) : null)
  }, [activeMode, kana])

  if (!station || characters.length === 0) {
    return <main className="simple-message"><h1>えきが みつかりません</h1><Link to="/">ろせんずへ</Link></main>
  }

  const progress = reconcileProgress(state.progress[station.id], station.reading)

  const goTo = (nextIndex: number) => {
    setReward(null)
    setHasInk(false)
    setInputStrokes([])
    setTraceMessage('')
    setTraceGuide(null)
    setResetKey((value) => value + 1)
    navigate(`/practice/${station.id}/${nextIndex}?route=${routeId}`, { replace: true })
  }

  const done = () => {
    if (!hasInk) return
    if (activeMode === 'trace' && (!traceGuide || !evaluateTrace(inputStrokes, traceGuide).passed)) {
      setTraceMessage('もういちど なぞってみよう')
      return
    }
    const result = markPositionComplete(station.id, index)
    setTraceMessage('')
    setReward(result)
  }

  const next = () => goTo(nextUnpracticedPosition(progress, station.reading, index))

  return (
    <div className={`page-shell practice-page practice-page--${state.settings.handedness} ${state.settings.reduceMotion ? 'reduce-motion' : ''}`}>
      <AppHeader compact />
      <main className="practice-main">
        <div className="practice-topbar">
          <Link className="back-link" to={`/station/${station.id}?route=${routeId}`}>← {station.reading}</Link>
          <div className="mode-switch" aria-label="かきかた">
            <button type="button" className={activeMode === 'trace' ? 'selected' : ''} disabled={!traceAvailable} onClick={() => { setMode('trace'); setShowGuide(true); setTraceMessage('') }}>なぞる</button>
            <button type="button" className={activeMode === 'free' ? 'selected' : ''} onClick={() => { setMode('free'); setTraceMessage('') }}>じぶんで かく</button>
          </div>
        </div>

        <section className="practice-layout">
          <div className="practice-copy">
            <p className="eyebrow">{station.displayName}</p>
            <KanaStrip
              reading={station.reading}
              activeIndex={index}
              practicedPositions={progress.practicedPositions}
              onSpeak={speak}
              onChoose={goTo}
            />
            <div className="current-kana"><span>{index + 1}</span>{kana}</div>
            {!hasGlyph(kana) && <p className="notice notice--small">このもじは フォントのおてほんです。じぶんで かいてみよう。</p>}
          </div>

          <WritingPad
            kana={kana}
            showGuide={showGuide}
            animateGuide={activeMode === 'trace' && !state.settings.reduceMotion}
            replayKey={replayKey}
            resetKey={resetKey}
            onInkChange={setHasInk}
            onStrokesChange={(strokes) => { setInputStrokes(strokes); setTraceMessage('') }}
          />

          <aside className="practice-tools" aria-label="れんしゅうの そうさ">
            <button type="button" className="tool-button" onClick={() => speak(speechForKana(kana))}><span>♪</span>きく</button>
            <button type="button" className="tool-button" onClick={() => { setShowGuide(true); setReplayKey((value) => value + 1) }}><span>▶</span>おてほん</button>
            <button type="button" className="tool-button" onClick={() => setShowGuide((value) => !value)}><span>◉</span>{showGuide ? 'かくす' : 'みる'}</button>
            <button type="button" className="done-button" disabled={!hasInk} onClick={done}><span>✓</span>できた</button>
            <button type="button" className="tool-button" onClick={next}><span>→</span>つぎ</button>
          </aside>
        </section>
        {traceMessage
          ? <p className="trace-feedback" role="status">{traceMessage}</p>
          : !hasInk && <p className="ink-hint">せんを ひとつ かくと「できた」を おせるよ</p>}
      </main>

      {reward && (
        <div className="reward-backdrop" role="dialog" aria-modal="true" aria-labelledby="reward-title">
          <div className="reward-card">
            <div className="haniwa" aria-hidden="true"><span className="haniwa-eye" /><span className="haniwa-eye" /><i /><b /></div>
            <p className="eyebrow">{kana} が かけたね！</p>
            <h2 id="reward-title">{reward.firstAdd ? 'えきが ふえた！' : 'また かけたね！'}</h2>
            <div className="reward-actions">
              <button type="button" className="soft-button" onClick={reward.allComplete ? () => goTo(0) : next}>
                {reward.allComplete ? 'もういちど かく' : 'つぎの もじ'}
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => navigate(`/?route=${routeId === 'found' ? 'toyoko' : routeId}`, { state: { celebrateStationId: station.id, firstAdd: reward.firstAdd } })}
              >
                ろせんずを みる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
