import { pointDistance, type Point } from './input'
import type { TraceStrictness } from './types'

export interface TraceGuideStroke {
  segments: Point[][]
}

export interface TraceEvaluation {
  passed: boolean
  issues: TraceIssue[]
  startRatio: number
  inBoundsRatio: number
  coverageRatio: number
  directionRatio: number
  strokeCountMatches: boolean
}

export type TraceIssue = 'too-short' | 'off-path' | 'not-covered' | 'stroke-count' | 'start-position' | 'stroke-order'

export interface FreeWritingEvaluation {
  passed: boolean
  issues: FreeWritingIssue[]
  inBoundsRatio: number
  coverageRatio: number
}

export type FreeWritingIssue = 'too-short' | 'shape-mismatch' | 'not-covered'

interface TraceProfile {
  pathTolerance: number
  minInBounds: number
  minCoverage: number
  checkTechnique: boolean
}

const PROFILES: Record<TraceStrictness, TraceProfile> = {
  gentle: { pathTolerance: 112, minInBounds: .42, minCoverage: .28, checkTechnique: false },
  standard: { pathTolerance: 92, minInBounds: .54, minCoverage: .38, checkTechnique: false },
  careful: { pathTolerance: 70, minInBounds: .68, minCoverage: .52, checkTechnique: true },
}

const INPUT_SAMPLE_SPACING = 10
const GUIDE_SAMPLE_SPACING = 10
const MIN_STROKE_LENGTH = 18
const START_TOLERANCE = 82
const FREE_WRITING_TOLERANCE = 50
const FREE_WRITING_MIN_IN_BOUNDS = .56
const FREE_WRITING_MIN_COVERAGE = .48
const FREE_WRITING_MIN_LENGTH = 70
const FREE_WRITING_MIN_EXTENT = 48
const NORMALIZED_SHAPE_SIZE = 420
const NORMALIZED_SHAPE_CENTER = 300

export function polylineLength(points: Point[]): number {
  let length = 0
  for (let index = 1; index < points.length; index += 1) {
    length += pointDistance(points[index - 1], points[index])
  }
  return length
}

export function resamplePolyline(points: Point[], spacing = INPUT_SAMPLE_SPACING): Point[] {
  if (points.length < 2) return [...points]
  const total = polylineLength(points)
  if (total === 0) return [points[0]]

  const count = Math.max(2, Math.ceil(total / spacing) + 1)
  const samples: Point[] = []
  let segmentIndex = 1
  let traversed = 0

  for (let sampleIndex = 0; sampleIndex < count; sampleIndex += 1) {
    const target = (total * sampleIndex) / (count - 1)
    while (segmentIndex < points.length - 1) {
      const segmentLength = pointDistance(points[segmentIndex - 1], points[segmentIndex])
      if (traversed + segmentLength >= target) break
      traversed += segmentLength
      segmentIndex += 1
    }
    const from = points[segmentIndex - 1]
    const to = points[segmentIndex]
    const segmentLength = pointDistance(from, to)
    const ratio = segmentLength === 0 ? 0 : Math.min(1, Math.max(0, (target - traversed) / segmentLength))
    samples.push({ x: from.x + (to.x - from.x) * ratio, y: from.y + (to.y - from.y) * ratio })
  }
  return samples
}

function distanceToPoints(point: Point, candidates: Point[]): number {
  return candidates.reduce((closest, candidate) => Math.min(closest, pointDistance(point, candidate)), Number.POSITIVE_INFINITY)
}

function normalizeShape(points: Point[]): Point[] {
  const minX = Math.min(...points.map((point) => point.x))
  const maxX = Math.max(...points.map((point) => point.x))
  const minY = Math.min(...points.map((point) => point.y))
  const maxY = Math.max(...points.map((point) => point.y))
  const width = Math.max(1, maxX - minX)
  const height = Math.max(1, maxY - minY)
  const scale = NORMALIZED_SHAPE_SIZE / Math.max(width, height)
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  return points.map((point) => ({
    x: NORMALIZED_SHAPE_CENTER + (point.x - centerX) * scale,
    y: NORMALIZED_SHAPE_CENTER + (point.y - centerY) * scale,
  }))
}

function closestPointIndex(point: Point, candidates: Point[]): number {
  let closest = 0
  let distance = Number.POSITIVE_INFINITY
  candidates.forEach((candidate, index) => {
    const next = pointDistance(point, candidate)
    if (next < distance) {
      distance = next
      closest = index
    }
  })
  return closest
}

function directionScore(input: Point[], guide: TraceGuideStroke): number {
  if (guide.segments.length !== 1) return 1
  const guidePoints = resamplePolyline(guide.segments[0], GUIDE_SAMPLE_SPACING)
  if (input.length < 2 || guidePoints.length < 2) return 0
  const indices = input.map((point) => closestPointIndex(point, guidePoints))
  let forwardSteps = 0
  for (let index = 1; index < indices.length; index += 1) {
    if (indices[index] >= indices[index - 1] - 2) forwardSteps += 1
  }
  const monotonicRatio = forwardSteps / Math.max(1, indices.length - 1)
  const advance = (indices.at(-1)! - indices[0]) / Math.max(1, guidePoints.length - 1)
  return Math.min(monotonicRatio, Math.max(0, advance / .45))
}

export function evaluateTrace(
  inputStrokes: Point[][],
  guideStrokes: TraceGuideStroke[],
  strictness: TraceStrictness = 'standard',
): TraceEvaluation {
  const profile = PROFILES[strictness]
  const input = inputStrokes.filter((stroke) => polylineLength(stroke) >= MIN_STROKE_LENGTH).map((stroke) => resamplePolyline(stroke))
  const guide = guideStrokes
    .map((stroke) => ({ segments: stroke.segments.filter((segment) => segment.length >= 2) }))
    .filter((stroke) => stroke.segments.length > 0)
  const strokeCountMatches = input.length === guide.length && guide.length > 0

  if (input.length === 0 || guide.length === 0) {
    return { passed: false, issues: ['too-short'], startRatio: 0, inBoundsRatio: 0, coverageRatio: 0, directionRatio: 0, strokeCountMatches }
  }

  const allInputPoints = input.flat()
  const allGuidePoints = guide.flatMap((stroke) => stroke.segments.flatMap((segment) => resamplePolyline(segment, GUIDE_SAMPLE_SPACING)))
  const inBoundsRatio = allInputPoints.filter((point) => distanceToPoints(point, allGuidePoints) <= profile.pathTolerance).length / allInputPoints.length
  const coverageRatio = allGuidePoints.filter((point) => distanceToPoints(point, allInputPoints) <= profile.pathTolerance).length / allGuidePoints.length

  let starts = 0
  let directionTotal = 0

  guide.slice(0, input.length).forEach((guideStroke, index) => {
    const userPoints = input[index]
    const segmentSamples = guideStroke.segments.map((segment) => resamplePolyline(segment, GUIDE_SAMPLE_SPACING))
    const guideStart = segmentSamples[0][0]
    if (pointDistance(userPoints[0], guideStart) <= START_TOLERANCE) starts += 1
    directionTotal += directionScore(userPoints, guideStroke)
  })

  const startRatio = starts / guide.length
  const directionRatio = directionTotal / guide.length
  const issues: TraceIssue[] = []
  if (inBoundsRatio < profile.minInBounds) issues.push('off-path')
  if (coverageRatio < profile.minCoverage) issues.push('not-covered')
  if (!strokeCountMatches) issues.push('stroke-count')
  if (startRatio < 1) issues.push('start-position')
  if (directionRatio < .58) issues.push('stroke-order')
  const shapeMatches = !issues.includes('off-path') && !issues.includes('not-covered')
  const techniqueMatches = strokeCountMatches && startRatio === 1 && directionRatio >= .58
  const passed = shapeMatches && (!profile.checkTechnique || techniqueMatches)

  return { passed, issues, startRatio, inBoundsRatio, coverageRatio, directionRatio, strokeCountMatches }
}

export function evaluateFreeWriting(
  inputStrokes: Point[][],
  guideStrokes: TraceGuideStroke[],
): FreeWritingEvaluation {
  const meaningfulInput = inputStrokes.filter((stroke) => polylineLength(stroke) >= MIN_STROKE_LENGTH)
  const totalLength = meaningfulInput.reduce((sum, stroke) => sum + polylineLength(stroke), 0)
  const rawInputPoints = meaningfulInput.flat()
  const inputWidth = rawInputPoints.length > 0
    ? Math.max(...rawInputPoints.map((point) => point.x)) - Math.min(...rawInputPoints.map((point) => point.x))
    : 0
  const inputHeight = rawInputPoints.length > 0
    ? Math.max(...rawInputPoints.map((point) => point.y)) - Math.min(...rawInputPoints.map((point) => point.y))
    : 0
  const guidePoints = guideStrokes.flatMap((stroke) => stroke.segments
    .filter((segment) => segment.length >= 2)
    .flatMap((segment) => resamplePolyline(segment, GUIDE_SAMPLE_SPACING)))

  if (totalLength < FREE_WRITING_MIN_LENGTH || Math.max(inputWidth, inputHeight) < FREE_WRITING_MIN_EXTENT || guidePoints.length === 0) {
    return { passed: false, issues: ['too-short'], inBoundsRatio: 0, coverageRatio: 0 }
  }

  const inputPoints = normalizeShape(meaningfulInput.flatMap((stroke) => resamplePolyline(stroke)))
  const normalizedGuide = normalizeShape(guidePoints)
  const inBoundsRatio = inputPoints.filter((point) => distanceToPoints(point, normalizedGuide) <= FREE_WRITING_TOLERANCE).length / inputPoints.length
  const coverageRatio = normalizedGuide.filter((point) => distanceToPoints(point, inputPoints) <= FREE_WRITING_TOLERANCE).length / normalizedGuide.length
  const issues: FreeWritingIssue[] = []
  if (inBoundsRatio < FREE_WRITING_MIN_IN_BOUNDS) issues.push('shape-mismatch')
  if (coverageRatio < FREE_WRITING_MIN_COVERAGE) issues.push('not-covered')
  return { passed: issues.length === 0, issues, inBoundsRatio, coverageRatio }
}

export function freeWritingFeedback(evaluation: FreeWritingEvaluation): string {
  if (evaluation.issues.includes('too-short')) return 'もうすこし おおきく かいてみよう'
  if (evaluation.issues.includes('not-covered')) return 'もじの かたちが すこし たりないみたい'
  if (evaluation.issues.includes('shape-mismatch')) return 'もじの かたちが すこし ちがうみたい'
  return ''
}

export function traceFeedback(evaluation: TraceEvaluation): string {
  if (evaluation.issues.includes('too-short')) return 'もうすこし ながく かいてみよう'
  if (evaluation.issues.includes('off-path')) return 'おてほんの せんから はなれている ところが あるよ'
  if (evaluation.issues.includes('not-covered')) return 'まだ なぞれていない ところが あるよ'
  if (evaluation.issues.includes('stroke-count')) return 'かく かずが おてほんと ちがうみたい'
  if (evaluation.issues.includes('stroke-order')) return 'かきじゅんが おてほんと ちがうみたい'
  if (evaluation.issues.includes('start-position')) return 'まるの ところから かきはじめてみよう'
  return ''
}

export function traceAdvisory(evaluation: TraceEvaluation): string {
  if (evaluation.issues.includes('stroke-count') || evaluation.issues.includes('stroke-order') || evaluation.issues.includes('start-position')) {
    return 'かきじゅんが ちがっても だいじょうぶ！'
  }
  return ''
}
