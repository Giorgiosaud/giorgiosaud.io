// biome-ignore lint/correctness/noUnusedVariables: This extends the global Window type for analytics
interface Window {
  gtag?: (...args: any[]) => void
  dataLayer?: any[]
}
