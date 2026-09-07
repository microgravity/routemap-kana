import type { Point } from './input'
import { evaluateTrace, type TraceGuideStroke } from './traceEvaluation'

const line = (from: Point, to: Point, steps = 12): Point[] => Array.from({ length: steps }, (_, index) => ({
  x: from.x + ((to.x - from.x) * index) / (steps - 1),
  y: from.y + ((to.y - from.y) * index) / (steps - 1),
}))

const guide: TraceGuideStroke[] = [
  { segments: [line({ x: 100, y: 120 }, { x: 420, y: 120 })] },
  { segments: [line({ x: 260, y: 180 }, { x: 260, y: 500 })] },
]

describe('なぞり補助判定', () => {
  it('少しずれた正しいなぞりを成功にする', () => {
    const input = [
      line({ x: 112, y: 132 }, { x: 410, y: 129 }),
      line({ x: 271, y: 192 }, { x: 266, y: 488 }),
    ]
    expect(evaluateTrace(input, guide).passed).toBe(true)
  })

  it('開始位置が途中の線を成功にしない', () => {
    const input = [line({ x: 240, y: 120 }, { x: 420, y: 120 }), line({ x: 260, y: 180 }, { x: 260, y: 500 })]
    expect(evaluateTrace(input, guide).passed).toBe(false)
  })

  it('逆向きの線を成功にしない', () => {
    const input = [line({ x: 420, y: 120 }, { x: 100, y: 120 }), line({ x: 260, y: 500 }, { x: 260, y: 180 })]
    expect(evaluateTrace(input, guide).passed).toBe(false)
  })

  it('画順を入れ替えた線を成功にしない', () => {
    const input = [line({ x: 260, y: 180 }, { x: 260, y: 500 }), line({ x: 100, y: 120 }, { x: 420, y: 120 })]
    expect(evaluateTrace(input, guide).passed).toBe(false)
  })

  it('お手本から大きく外れた線を成功にしない', () => {
    const input = [line({ x: 100, y: 360 }, { x: 420, y: 360 }), line({ x: 500, y: 180 }, { x: 500, y: 500 })]
    expect(evaluateTrace(input, guide).passed).toBe(false)
  })

  it('短すぎる線を成功にしない', () => {
    const input = [line({ x: 100, y: 120 }, { x: 112, y: 120 }, 3)]
    expect(evaluateTrace(input, guide).passed).toBe(false)
  })
})
