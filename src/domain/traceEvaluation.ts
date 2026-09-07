import { pointDistance, type Point } from './input'

export interface TraceGuideStroke {
  segments: Point[][]
}

export interface TraceEvaluation {
  passed: boolean
  startRatio: number
  inBoundsRatio: number
  coverageRatio: number
  directionRatio: number
  strokeCountMatches: boolean
}

const INPUT_SAMPLE_SPACING = 10
const GUIDE_SAMPLE_SPACING = 10
const MIN_STROKE_LENGTH = 18
const START_TOLERANCE = 82
const PATH_TOLERANCE = 70

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

export function evaluateTrace(inputStrokes: Point[][], guideStrokes: TraceGuideStroke[]): TraceEvaluation {
  const input = inputStrokes.filter((stroke) => polylineLength(stroke) >= MIN_STROKE_LENGTH).map((stroke) => resamplePolyline(stroke))
  const guide = guideStrokes
    .map((stroke) => ({ segments: stroke.segments.filter((segment) => segment.length >= 2) }))
    .filter((stroke) => stroke.segments.length > 0)
  const strokeCountMatches = input.length === guide.length && guide.length > 0

  if (!strokeCountMatches) {
    return { passed: false, startRatio: 0, inBoundsRatio: 0, coverageRatio: 0, directionRatio: 0, strokeCountMatches }
  }

  let starts = 0
  let inputSamples = 0
  let inputSamplesInBounds = 0
  let guideSamples = 0
  let guideSamplesCovered = 0
  let directionTotal = 0

  guide.forEach((guideStroke, index) => {
    const userPoints = input[index]
    const segmentSamples = guideStroke.segments.map((segment) => resamplePolyline(segment, GUIDE_SAMPLE_SPACING))
    const allGuidePoints = segmentSamples.flat()
    const guideStart = segmentSamples[0][0]
    if (pointDistance(userPoints[0], guideStart) <= START_TOLERANCE) starts += 1

    inputSamples += userPoints.length
    inputSamplesInBounds += userPoints.filter((point) => distanceToPoints(point, allGuidePoints) <= PATH_TOLERANCE).length
    guideSamples += allGuidePoints.length
    guideSamplesCovered += allGuidePoints.filter((point) => distanceToPoints(point, userPoints) <= PATH_TOLERANCE).length
    directionTotal += directionScore(userPoints, guideStroke)
  })

  const startRatio = starts / guide.length
  const inBoundsRatio = inputSamplesInBounds / Math.max(1, inputSamples)
  const coverageRatio = guideSamplesCovered / Math.max(1, guideSamples)
  const directionRatio = directionTotal / guide.length
  const passed = startRatio === 1 && inBoundsRatio >= .68 && coverageRatio >= .52 && directionRatio >= .58

  return { passed, startRatio, inBoundsRatio, coverageRatio, directionRatio, strokeCountMatches }
}
