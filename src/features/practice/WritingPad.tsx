import { useRef, useState, type PointerEvent } from 'react'
import { hasMeaningfulInk, pointDistance, pointInViewBox, type Point } from '../../domain/input'
import { GlyphGuide } from './GlyphGuide'

interface Props {
  kana: string
  showGuide: boolean
  animateGuide: boolean
  replayKey: number
  onInkChange: (hasInk: boolean) => void
  resetKey: number
}

export function WritingPad({ kana, showGuide, animateGuide, replayKey, onInkChange, resetKey }: Props) {
  const [strokes, setStrokes] = useState<Point[][]>([])
  const [seenResetKey, setSeenResetKey] = useState(resetKey)
  const activePointer = useRef<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  if (seenResetKey !== resetKey) {
    setSeenResetKey(resetKey)
    setStrokes([])
  }

  const update = (next: Point[][]) => {
    setStrokes(next)
    onInkChange(hasMeaningfulInk(next))
  }

  const pointFor = (event: PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect()
    return rect ? pointInViewBox(event.clientX, event.clientY, rect) : { x: 0, y: 0 }
  }

  const pointerDown = (event: PointerEvent<SVGSVGElement>) => {
    if (activePointer.current !== null) return
    activePointer.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
    update([...strokes, [pointFor(event)]])
  }

  const pointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (activePointer.current !== event.pointerId) return
    const point = pointFor(event)
    const currentStroke = strokes.at(-1)
    const last = currentStroke?.at(-1)
    if (!last || pointDistance(last, point) < 2.5) return
    const next = strokes.map((stroke, index) => index === strokes.length - 1 ? [...stroke, point] : stroke)
    update(next)
  }

  const pointerEnd = (event: PointerEvent<SVGSVGElement>) => {
    if (activePointer.current !== event.pointerId) return
    activePointer.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  return (
    <div className="writing-pad-wrap">
      <div className="writing-pad" data-kana={kana}>
        <span className="grid-line grid-line--horizontal" />
        <span className="grid-line grid-line--vertical" />
        {showGuide && <GlyphGuide key={`${kana}-${replayKey}`} kana={kana} animate={animateGuide} replayKey={replayKey} />}
        <svg
          ref={svgRef}
          className="ink-layer"
          viewBox="0 0 600 600"
          aria-label={`${kana}を かくところ`}
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerEnd}
          onPointerCancel={pointerEnd}
        >
          {strokes.map((stroke, index) => (
            <polyline
              key={index}
              points={stroke.map((point) => `${point.x},${point.y}`).join(' ')}
              className="ink-stroke"
            />
          ))}
        </svg>
      </div>
      <div className="pad-tools" aria-label="かいたせんの そうさ">
        <button type="button" className="soft-button" onClick={() => update(strokes.slice(0, -1))} disabled={strokes.length === 0}>
          <span aria-hidden="true">↶</span> ひとつ もどす
        </button>
        <button type="button" className="soft-button" onClick={() => update([])} disabled={strokes.length === 0}>
          <span aria-hidden="true">⌫</span> けす
        </button>
      </div>
    </div>
  )
}
