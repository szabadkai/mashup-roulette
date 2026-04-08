import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { loadYouTubeAPI } from '../lib/youtube'

export interface YouTubePlayerHandle {
  play: () => void
  pause: () => void
  setVolume: (volume: number) => void
  setPlaybackRate: (rate: number) => void
  loadVideo: (videoId: string) => void
  unmute: () => void
  seekTo: (seconds: number) => void
  getCurrentTime: () => number
}

interface Props {
  videoId: string | null
  className?: string
  onError?: () => void
}

const YouTubePlayer = forwardRef<YouTubePlayerHandle, Props>(
  ({ videoId, className = '', onError }, ref) => {
    const uid = useId()
    const containerId = `yt-${uid.replace(/:/g, '')}`
    const playerRef = useRef<YT.Player | null>(null)
    const pendingVideo = useRef<string | null>(null)
    const onErrorRef = useRef(onError)
    const [ready, setReady] = useState(false)

    // Keep ref in sync so the closure inside the YT player always calls latest
    useEffect(() => { onErrorRef.current = onError }, [onError])

    useImperativeHandle(
      ref,
      () => ({
        play: () => playerRef.current?.playVideo(),
        pause: () => playerRef.current?.pauseVideo(),
        setVolume: (v) => playerRef.current?.setVolume(v),
        setPlaybackRate: (r) => playerRef.current?.setPlaybackRate(r),
        unmute: () => playerRef.current?.unMute(),
        seekTo: (s) => playerRef.current?.seekTo(s, true),
        getCurrentTime: () => playerRef.current?.getCurrentTime?.() ?? 0,
        loadVideo: (id) => {
          if (playerRef.current && ready) {
            playerRef.current.loadVideoById(id)
          } else {
            pendingVideo.current = id
          }
        },
      }),
      [ready]
    )

    useEffect(() => {
      let active = true
      let player: YT.Player | null = null

      loadYouTubeAPI(() => {
        if (!active) return
        player = new window.YT.Player(containerId, {
          height: '100%',
          width: '100%',
          ...(videoId ? { videoId } : {}),
          playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            iv_load_policy: 3,
            fs: 0,
          } as YT.PlayerVars,
          events: {
            onReady: () => {
              if (!active) {
                player?.destroy()
                return
              }
              playerRef.current = player
              setReady(true)
              if (pendingVideo.current) {
                player?.loadVideoById(pendingVideo.current)
                pendingVideo.current = null
              }
            },
            onError: () => {
              if (active) onErrorRef.current?.()
            },
            onStateChange: (event: YT.PlayerEvent) => {
              // YT error codes: 2=invalid param, 5=HTML5 error, 100=not found, 101/150=embed blocked
              if (active && event.data === -1) {
                // Unstarted after load attempt — check if it's stuck
                setTimeout(() => {
                  if (active && player?.getPlayerState?.() === -1) {
                    onErrorRef.current?.()
                  }
                }, 5000)
              }
            },
          },
        })
      })

      return () => {
        active = false
        player?.destroy()
        playerRef.current = null
        setReady(false)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Sync videoId prop changes
    useEffect(() => {
      if (videoId && playerRef.current && ready) {
        playerRef.current.loadVideoById(videoId)
      }
    }, [videoId, ready])

    return (
      <div className={`relative overflow-hidden bg-void ${className}`}>
        <div id={containerId} className="absolute inset-0 w-full h-full" />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-void">
            <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    )
  }
)

YouTubePlayer.displayName = 'YouTubePlayer'
export default YouTubePlayer
