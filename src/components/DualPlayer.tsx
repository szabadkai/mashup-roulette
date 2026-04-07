import { forwardRef, useImperativeHandle, useRef } from 'react'
import YouTubePlayer, { type YouTubePlayerHandle } from './YouTubePlayer'
import type { Video } from '../types'

export interface DualPlayerHandle {
  play: () => void
  pause: () => void
  setBlend: (blend: number) => void
  setTempo: (rate: number) => void
  loadLofi: (videoId: string) => void
  loadTalk: (videoId: string) => void
  unmute: () => void
}

interface Props {
  lofiVideo: Video | null
  talkVideo: Video | null
  blend: number      // 0–100: 100 = all lofi, 0 = all talk
  isPlaying: boolean
  onLofiError?: () => void
  onTalkError?: () => void
}

/** Maps blend (0–100) to volumes: [lofiVol, talkVol] */
function blendToVolumes(blend: number): [number, number] {
  return [blend, 100 - blend]
}

/** Maps blend to opacity multipliers: min 0.2 so both always slightly visible */
function blendToOpacity(blend: number): [number, number] {
  const lofi = 0.2 + 0.8 * (blend / 100)
  const talk = 0.2 + 0.8 * ((100 - blend) / 100)
  return [lofi, talk]
}

const DualPlayer = forwardRef<DualPlayerHandle, Props>(
  ({ lofiVideo, talkVideo, blend, onLofiError, onTalkError }, ref) => {
    const lofiRef = useRef<YouTubePlayerHandle>(null)
    const talkRef = useRef<YouTubePlayerHandle>(null)

    useImperativeHandle(ref, () => ({
      play: () => {
        lofiRef.current?.play()
        talkRef.current?.play()
      },
      pause: () => {
        lofiRef.current?.pause()
        talkRef.current?.pause()
      },
      setBlend: (b: number) => {
        const [lv, tv] = blendToVolumes(b)
        lofiRef.current?.setVolume(lv)
        talkRef.current?.setVolume(tv)
      },
      setTempo: (rate: number) => {
        lofiRef.current?.setPlaybackRate(rate)
        talkRef.current?.setPlaybackRate(rate)
      },
      loadLofi: (id) => lofiRef.current?.loadVideo(id),
      loadTalk: (id) => talkRef.current?.loadVideo(id),
      unmute: () => {
        lofiRef.current?.unmute()
        talkRef.current?.unmute()
      },
    }))

    const [lofiOpacity, talkOpacity] = blendToOpacity(blend)

    return (
      <div className="relative w-full h-full">
        {/* Label row */}
        <div className="absolute top-2 left-0 right-0 z-20 px-2 flex gap-2">
          <span
            className="text-xs font-mono px-2 py-0.5 rounded"
            style={{ background: 'rgba(255,184,0,0.15)', color: '#FFB800', border: '1px solid rgba(255,184,0,0.3)' }}
          >
            🎵 LOFI {Math.round(blend)}%
          </span>
          <span
            className="text-xs font-mono px-2 py-0.5 rounded"
            style={{ background: 'rgba(0,207,255,0.15)', color: '#00CFFF', border: '1px solid rgba(0,207,255,0.3)' }}
          >
            🎤 TALK {Math.round(100 - blend)}%
          </span>
        </div>

        <div className="absolute inset-0">
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{ opacity: lofiOpacity, zIndex: 1 }}
          >
            <YouTubePlayer
              ref={lofiRef}
              videoId={lofiVideo?.id ?? null}
              className="w-full h-full"
              onError={onLofiError}
            />
          </div>
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{ opacity: talkOpacity, zIndex: 2 }}
          >
            <YouTubePlayer
              ref={talkRef}
              videoId={talkVideo?.id ?? null}
              className="w-full h-full"
              onError={onTalkError}
            />
          </div>
        </div>
      </div>
    )
  }
)

DualPlayer.displayName = 'DualPlayer'
export default DualPlayer
