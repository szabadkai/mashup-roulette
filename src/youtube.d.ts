// YouTube IFrame API type declarations

declare namespace YT {
  interface Player {
    playVideo(): void
    pauseVideo(): void
    stopVideo(): void
    setVolume(volume: number): void
    getVolume(): number
    setPlaybackRate(suggestedRate: number): void
    getPlaybackRate(): number
    loadVideoById(videoId: string): void
    cueVideoById(videoId: string): void
    getPlayerState(): number
    mute(): void
    unMute(): void
    isMuted(): boolean
    seekTo(seconds: number, allowSeekAhead: boolean): void
    getCurrentTime(): number
    destroy(): void
  }

  interface PlayerOptions {
    height?: string | number
    width?: string | number
    videoId?: string
    playerVars?: PlayerVars
    events?: Events
  }

  interface PlayerVars {
    autoplay?: 0 | 1
    controls?: 0 | 1
    disablekb?: 0 | 1
    fs?: 0 | 1
    modestbranding?: 0 | 1
    rel?: 0 | 1
    iv_load_policy?: 1 | 3
    mute?: 0 | 1
    playsinline?: 0 | 1
  }

  interface Events {
    onReady?: (event: PlayerEvent) => void
    onStateChange?: (event: PlayerEvent) => void
    onError?: (event: PlayerEvent) => void
  }

  interface PlayerEvent {
    target: Player
    data: number
  }

  class Player {
    constructor(elementId: string, options: PlayerOptions)
    playVideo(): void
    pauseVideo(): void
    stopVideo(): void
    setVolume(volume: number): void
    getVolume(): number
    setPlaybackRate(suggestedRate: number): void
    getPlaybackRate(): number
    loadVideoById(videoId: string): void
    cueVideoById(videoId: string): void
    getPlayerState(): number
    destroy(): void
  }
}

interface Window {
  YT: {
    Player: new (elementId: string, options: YT.PlayerOptions) => YT.Player
  }
  onYouTubeIframeAPIReady?: () => void
}
