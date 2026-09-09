import { useEffect } from 'react'
import { useAppState } from '../../app/AppState'
import { disableAnalytics, enableAnalytics } from './analytics'

export function AnalyticsGate() {
  const { state } = useAppState()

  useEffect(() => {
    if (state.settings.analyticsEnabled) {
      enableAnalytics()
    } else {
      disableAnalytics()
    }
  }, [state.settings.analyticsEnabled])

  return null
}
