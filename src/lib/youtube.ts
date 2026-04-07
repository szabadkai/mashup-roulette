// YouTube IFrame API singleton loader
type ReadyCallback = () => void

const callbacks: ReadyCallback[] = []
let isLoaded = false
let isLoading = false

export function loadYouTubeAPI(onReady: ReadyCallback): void {
  if (isLoaded) {
    onReady()
    return
  }
  callbacks.push(onReady)
  if (!isLoading) {
    isLoading = true
    ;(window as Window & { onYouTubeIframeAPIReady?: () => void }).onYouTubeIframeAPIReady = () => {
      isLoaded = true
      callbacks.forEach((cb) => cb())
      callbacks.length = 0
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  }
}
