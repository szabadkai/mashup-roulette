import { forwardRef, useImperativeHandle, useRef } from 'react'
import YouTubePlayer, { type YouTubePlayerHandle } from './YouTubePlayer'
import type { Video } from '../types'

export interface DualPlayerHandle {
  play: () => void
  pause: () => void
  setBlend: (blend: number) => void
  setLeftTempo: (rate: number) => void
  setRightTempo: (rate: number) => void
  loadLeft: (videoId: string) => void
  loadRight: (videoId: string) => void
  unmute: () => void
  applyOffset: (offsetSec: number) => void
}

interface Props {
  leftVideo: Video | null
  rightVideo: Video | null
  blend: number      // 0–100: 100 = all left, 0 = all right
  isPlaying: boolean
  onLeftError?: () => void
  onRightError?: () => void
}

/** Maps blend (0–100) to volumes: [leftVol, rightVol] */
function blendToVolumes(blend: number): [number, number] {
  return [blend, 100 - blend]
}

/** Maps blend to opacity multipliers: min 0.2 so both always slightly visible */
function blendToOpacity(blend: number): [number, number] {
  const left = 0.2 + 0.8 * (blend / 100)
  const right = 0.2 + 0.8 * ((100 - blend) / 100)
  return [left, right]
}

const DualPlayer = forwardRef<DualPlayerHandle, Props>(
  ({ leftVideo, rightVideo, blend, onLeftError, onRightError }, ref) => {
    const leftRef = useRef<YouTubePlayerHandle>(null)
    const rightRef = useRef<YouTubePlayerHandle>(null)

    useImperativeHandle(ref, () => ({
      play: () => {
        leftRef.current?.play()
        rightRef.current?.play()
      },
      pause: () => {
        leftRef.current?.pause()
        rightRef.current?.pause()
      },
      setBlend: (b: number) => {
        const [lv, rv] = blendToVolumes(b)
        leftRef.current?.setVolume(lv)
        rightRef.current?.setVolume(rv)
      },
      setLeftTempo: (rate: number) => {
        leftRef.current?.setPlaybackRate(rate)
      },
      setRightTempo: (rate: number) => {
        rightRef.current?.setPlaybackRate(rate)
      },
      loadLeft: (id) => leftRef.current?.loadVideo(id),
      loadRight: (id) => rightRef.current?.loadVideo(id),
      unmute: () => {
        leftRef.current?.unmute()
        rightRef.current?.unmute()
      },
      applyOffset: (offsetSec: number) => {
        // positive offset = Deck B starts later → seek Deck A forward by |offset|
        // negative offset = Deck A starts later → seek Deck B forward by |offset|
        const leftTime = leftRef.current?.getCurrentTime() ?? 0
        const rightTime = rightRef.current?.getCurrentTime() ?? 0
        if (offsetSec >= 0) {
          // Keep B where it is, move A so it's `offset` seconds ahead
          leftRef.current?.seekTo(rightTime + offsetSec)
        } else {
          // Keep A where it is, move B so it's `|offset|` seconds ahead
          rightRef.current?.seekTo(leftTime + Math.abs(offsetSec))
        }
      },
    }))

    const [leftOpacity, rightOpacity] = blendToOpacity(blend)

    return (
      <div className="relative w-full h-full">
        {/* Label row */}
        <div className="absolute top-2 left-0 right-0 z-20 px-2 flex gap-2">
          <span
            className="text-xs font-mono px-2 py-0.5 rounded"
            style={{ background: 'rgba(255,107,157,0.15)', color: '#FF6B9D', border: '1px solid rgba(255,107,157,0.3)' }}
          >
            🅰 DECK A {Math.round(blend)}%
          </span>
          <span
            className="text-xs font-mono px-2 py-0.5 rounded"
            style={{ background: 'rgba(0,207,255,0.15)', color: '#00CFFF', border: '1px solid rgba(0,207,255,0.3)' }}
          >
            🅱 DECK B {Math.round(100 - blend)}%
          </span>
        </div>

        <div className="absolute inset-0">
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{ opacity: leftOpacity, zIndex: 1 }}
          >
            <YouTubePlayer
              ref={leftRef}
              videoId={leftVideo?.id ?? null}
              className="w-full h-full"
              onError={onLeftError}
            />
          </div>
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{ opacity: rightOpacity, zIndex: 2 }}
          >
            <YouTubePlayer
              ref={rightRef}
              videoId={rightVideo?.id ?? null}
              className="w-full h-full"
              onError={onRightError}
            />
          </div>
        </div>
      </div>
    )
  }
)

DualPlayer.displayName = 'DualPlayer'
export default DualPlayer
