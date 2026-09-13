import { nextStationIdOnRoute } from './routeNavigation'

describe('次駅への移動', () => {
  it('路線順で直後の駅を返す', () => {
    expect(nextStationIdOnRoute(['one', 'two', 'three'], 'two')).toBe('three')
  })

  it('終点と路線外の駅では次駅を返さない', () => {
    expect(nextStationIdOnRoute(['one', 'two'], 'two')).toBeUndefined()
    expect(nextStationIdOnRoute(['one', 'two'], 'other')).toBeUndefined()
  })
})
