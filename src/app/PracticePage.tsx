import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { hasGlyph } from '../data/kana'
import type { Point } from '../domain/input'
import { splitKana, speechForKana } from '../domain/kana'
import { nextUnpracticedPosition, reconcileProgress } from '../domain/progress'
import { evaluateTrace, traceAdvisory, traceFeedback, type TraceGuideStroke } from '../domain/traceEvaluation'
import { KanaStrip } from '../features/practice/KanaStrip'
import { sampleGlyphGuide } from '../features/practice/sampleGlyphGuide'
import { WritingPad } from '../features/practice/WritingPad'
import { useSpeech } from '../services/speech/useSpeech'
import { useAppState } from './AppState'

const strictnessNames = { gentle: 'やさしい', standard: 'ふつう', careful: 'しっかり' } as const

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
  const [allowTraceOverride, setAllowTraceOverride] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [replayKey, setReplayKey] = useState(0)
  const [reward, setReward] = useState<{ firstAdd: boolean; allComplete: boolean; traceNotice?: string } | null>(null)
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
    setAllowTraceOverride(false)
    setTraceGuide(null)
    setResetKey((value) => value + 1)
    navigate(`/practice/${station.id}/${nextIndex}?route=${routeId}`, { replace: true })
  }

  const done = (force = false) => {
    if (!hasInk) return
    let traceNotice = ''
    if (activeMode === 'trace' && !force) {
      if (!traceGuide) {
        setTraceMessage('おてほんを よみこめなかったよ')
        setAllowTraceOverride(true)
        return
      }
      const evaluation = evaluateTrace(inputStrokes, traceGuide, state.settings.traceStrictness)
      if (!evaluation.passed) {
        setTraceMessage(traceFeedback(evaluation))
        setAllowTraceOverride(true)
        return
      }
      traceNotice = traceAdvisory(evaluation)
    }
    const result = markPositionComplete(station.id, index)
    setTraceMessage('')
    setAllowTraceOverride(false)
    setReward({ ...result, traceNotice })
  }

  const next = () => goTo(nextUnpracticedPosition(progress, station.reading, index))

  return (
    <div className={`page-shell practice-page practice-page--${state.settings.handedness} ${state.settings.reduceMotion ? 'reduce-motion' : ''}`}>
      <AppHeader compact />
      <main className="practice-main">
        <div className="practice-topbar">
          <Link className="back-link" to={`/station/${station.id}?route=${routeId}`}>← {station.reading}</Link>
          <div className="practice-mode-area">
            {activeMode === 'trace' && <span className="trace-level">はんてい：{strictnessNames[state.settings.traceStrictness]}</span>}
            <div className="mode-switch" aria-label="かきかた">
              <button type="button" className={activeMode === 'trace' ? 'selected' : ''} disabled={!traceAvailable} onClick={() => { setMode('trace'); setShowGuide(true); setTraceMessage(''); setAllowTraceOverride(false) }}>なぞる</button>
              <button type="button" className={activeMode === 'free' ? 'selected' : ''} onClick={() => { setMode('free'); setTraceMessage(''); setAllowTraceOverride(false) }}>じぶんで かく</button>
            </div>
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
            onStrokesChange={(strokes) => { setInputStrokes(strokes); setTraceMessage(''); setAllowTraceOverride(false) }}
          />

          <aside className="practice-tools" aria-label="れんしゅうの そうさ">
            <button type="button" className="tool-button" onClick={() => speak(speechForKana(kana))}><span>♪</span>きく</button>
            <button type="button" className="tool-button" onClick={() => { setShowGuide(true); setReplayKey((value) => value + 1) }}><span>▶</span>おてほん</button>
            <button type="button" className="tool-button" onClick={() => setShowGuide((value) => !value)}><span>◉</span>{showGuide ? 'かくす' : 'みる'}</button>
            <button type="button" className={`done-button ${allowTraceOverride ? 'done-button--override' : ''}`} disabled={!hasInk} onClick={() => done(allowTraceOverride)}>
              <span>✓</span>{allowTraceOverride ? 'このまま できた' : 'できた'}
            </button>
            <button type="button" className="tool-button" onClick={next}><span>→</span>つぎ</button>
          </aside>
        </section>
        {traceMessage
          ? <div className="trace-feedback" role="status"><strong>{traceMessage}</strong><span>なおしても、このままでも だいじょうぶ</span></div>
          : !hasInk && <p className="ink-hint">せんを ひとつ かくと「できた」を おせるよ</p>}
      </main>

      {reward && (
        <div className="reward-backdrop" role="dialog" aria-modal="true" aria-labelledby="reward-title">
          <div className="reward-card">
            <div className="haniwa" aria-hidden="true"><span className="haniwa-eye" /><span className="haniwa-eye" /><i /><b /></div>
            <p className="eyebrow">{kana} が かけたね！</p>
            <h2 id="reward-title">{reward.firstAdd ? 'えきが ふえた！' : 'また かけたね！'}</h2>
            {reward.traceNotice && <p className="reward-notice">{reward.traceNotice}</p>}
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
