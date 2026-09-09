export const GOOGLE_TAG_MANAGER_ID = 'GTM-MXG5B2NT'
export const GOOGLE_ANALYTICS_MEASUREMENT_ID = 'G-CVGD2ZHNYD'
export const GOOGLE_TAG_MANAGER_SCRIPT_ID = 'google-tag-manager-script'

declare global {
  interface Window {
    dataLayer?: unknown[]
  }
}

const deniedConsent = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
} as const

function pushGoogleTagCommand(...command: unknown[]): void {
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push(command)
}

export function googleTagManagerScriptUrl(): string {
  return `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GOOGLE_TAG_MANAGER_ID)}`
}

export function enableAnalytics(): void {
  if (!import.meta.env.PROD || typeof document === 'undefined') return

  window.dataLayer = window.dataLayer ?? []
  if (!document.getElementById(GOOGLE_TAG_MANAGER_SCRIPT_ID)) {
    pushGoogleTagCommand('consent', 'default', deniedConsent)
  }
  pushGoogleTagCommand('consent', 'update', {
    ...deniedConsent,
    analytics_storage: 'granted',
  })

  if (document.getElementById(GOOGLE_TAG_MANAGER_SCRIPT_ID)) return
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })

  const script = document.createElement('script')
  script.id = GOOGLE_TAG_MANAGER_SCRIPT_ID
  script.async = true
  script.src = googleTagManagerScriptUrl()
  document.head.append(script)
}

export function disableAnalytics(): void {
  if (typeof document === 'undefined') return
  if (window.dataLayer) {
    pushGoogleTagCommand('consent', 'update', deniedConsent)
  }
}
