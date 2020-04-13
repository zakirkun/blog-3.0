import { trackCustomEvent } from 'gatsby-plugin-google-analytics'

export function trackOutbond (href: string): void {
  // @ts-ignore
  if (trackCustomEvent) {
    // @ts-ignore
    trackCustomEvent({
      category: 'Outbond Link',
      action: 'click',
      label: href,
      transport: 'beacon',
    })
  }
}

export function trackEvent ({ eventCategory, eventAction, eventLabel }: EventProps): void {
  // @ts-ignore
  if (trackCustomEvent) {
    // @ts-ignore
    trackCustomEvent({
      category: eventCategory,
      action: eventAction,
      label: eventLabel,
    })
  }
}

export function trackTiming (): void {
  if (window.performance) {
    // @ts-ignore
    if (trackCustomEvent) {
      // @ts-ignore
      trackCustomEvent({
        category: 'Timing',
        action: 'load',
        label: 'JS Deps',
        value: `${Math.round(performance.now())}`
      })
    }
  }
}

// @ts-ignore
export function trackClick ({ eventCategory, eventLabel }): void {
  // @ts-ignore
  if (trackCustomEvent) {
    // @ts-ignore
    trackCustomEvent({
      category: eventCategory,
      action: 'click',
      label: eventLabel,
    })
  }
}

export function trackView (pageGroup: string): void {
  // @ts-ignore
  if (trackCustomEvent) {
    // @ts-ignore
    trackCustomEvent({
      category: pageGroup,
      action: 'view',
      label: typeof window !== 'undefined' ? window.location.pathname : '',
    })
  }
}
