interface Window {
  gtag: (...args: unknown[]) => void
  dataLayer: unknown[]
  __trackShare?: (
    noteId: string,
    method: 'copy' | 'native',
    lang: 'en' | 'es',
  ) => void
  __openCookieSettings?: () => void
}
