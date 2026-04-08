import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
} from 'react'
import type { Video } from '../types'
import { ChevronUp, ChevronDown } from 'lucide-react'

export interface SlotReelHandle {
  spin: (targetIdx: number, duration: number, onDone?: () => void) => void
}

interface Props {
  items: Video[]
  selectedIdx: number
  onSelect: (idx: number) => void
  accentColor: string  // 'gold' | 'cyan'
  label: string
  isSpinning: boolean
}

const ITEM_HEIGHT = 48   // px, each reel item
const VISIBLE = 3        // number of items visible in window
const REPEATS = 6        // how many times to repeat list in the strip
const REEL_WIDTH = 110   // px width of the reel
const THUMB_W = 42
const THUMB_H = 28

function thumbUrl(id: string) {
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`
}

const SlotReel = forwardRef<SlotReelHandle, Props>(
  ({ items, selectedIdx, onSelect, accentColor, label, isSpinning }, ref) => {
    const stripRef = useRef<HTMLDivElement>(null)
    const [celebrating, setCelebrating] = useState(false)
    const currentIdx = useRef(selectedIdx)
    currentIdx.current = selectedIdx

    const goToIndex = useCallback(
      (idx: number, animate: boolean, duration = 300) => {
        const strip = stripRef.current
        if (!strip) return
        if (animate) {
          strip.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
        } else {
          strip.style.transition = 'none'
        }
        strip.style.transform = `translateY(-${idx * ITEM_HEIGHT}px)`
      },
      []
    )

    useImperativeHandle(ref, () => ({
      spin: (targetIdx: number, duration: number, onDone?: () => void) => {
        const strip = stripRef.current
        if (!strip || items.length === 0) return

        const n = items.length
        // Step 1: Jump (no transition) to same visual at repetition 1
        const startOffset = n * 1 + currentIdx.current
        strip.style.transition = 'none'
        strip.style.transform = `translateY(-${startOffset * ITEM_HEIGHT}px)`

        // Step 2: After two frames, animate to landing zone at repetition 3-4
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const endOffset = n * 3 + targetIdx
            strip.style.transition = `transform ${duration}ms cubic-bezier(0.05, 0.92, 0.2, 1.0)`
            strip.style.transform = `translateY(-${endOffset * ITEM_HEIGHT}px)`

            // Step 3: After spin — celebrate, then reset to canonical position
            setTimeout(() => {
              // Reset to canonical position (no transition)
              strip.style.transition = 'none'
              strip.style.transform = `translateY(-${targetIdx * ITEM_HEIGHT}px)`
              onSelect(targetIdx)
              setCelebrating(true)
              setTimeout(() => {
                setCelebrating(false)
                onDone?.()
              }, 700)
            }, duration + 50)
          })
        })
      },
    }))

    const nudge = (dir: -1 | 1) => {
      if (isSpinning) return
      const next = (selectedIdx + dir + items.length) % items.length
      onSelect(next)
      goToIndex(next, true, 200)
    }

    // Sync strip to selectedIdx when it changes externally (non-spin)
    const prevSpinning = useRef(isSpinning)
    if (!isSpinning && prevSpinning.current !== isSpinning) {
      // just became not-spinning, strip is already correct from spin()
    }
    prevSpinning.current = isSpinning

    const isGold = accentColor === 'gold'
    const isPink = accentColor === 'pink'
    const glowColor = isPink ? 'rgba(255,107,157,0.6)' : isGold ? 'rgba(255,184,0,0.6)' : 'rgba(0,207,255,0.6)'
    const borderColor = isPink ? '#FF6B9D' : isGold ? '#FFB800' : '#00CFFF'
    const textColor = isPink ? '#FF6B9D' : isGold ? '#FFB800' : '#00CFFF'

    // Build the strip: items repeated REPEATS times
    const strip = Array(REPEATS).fill(items).flat() as Video[]

    return (
      <div className="flex flex-col items-center gap-2">
        {/* Label */}
        <span
          className="text-xs font-mono tracking-widest uppercase"
          style={{ color: textColor }}
        >
          {label}
        </span>

        {/* Reel frame */}
        <div
          className="relative rounded-lg overflow-hidden scanlines"
          style={{
            width: REEL_WIDTH,
            height: ITEM_HEIGHT * VISIBLE,
            background: '#0D0D1A',
            border: celebrating
              ? `2px solid ${borderColor}`
              : '2px solid #252548',
            boxShadow: celebrating
              ? `0 0 30px 6px ${glowColor}, inset 0 0 20px rgba(0,0,0,0.5)`
              : 'inset 0 0 20px rgba(0,0,0,0.5)',
            transition: 'box-shadow 0.15s, border-color 0.15s',
          }}
        >
          {/* Center highlight bar */}
          <div
            className="absolute inset-x-0 z-10 pointer-events-none"
            style={{
              top: ITEM_HEIGHT,
              height: ITEM_HEIGHT,
              background: isPink
                ? 'rgba(255,107,157,0.06)'
                : isGold
                ? 'rgba(255,184,0,0.06)'
                : 'rgba(0,207,255,0.06)',
              borderTop: `1px solid ${borderColor}30`,
              borderBottom: `1px solid ${borderColor}30`,
            }}
          />

          {/* Gradient mask */}
          <div className="absolute inset-0 z-20 pointer-events-none reel-mask" />

          {/* Scrolling strip */}
          <div
            ref={stripRef}
            style={{ transform: `translateY(-${selectedIdx * ITEM_HEIGHT}px)` }}
          >
            {strip.map((video, i) => {
              const localIdx = i % items.length
              const isSelected =
                localIdx === selectedIdx &&
                Math.floor(i / items.length) === 0
              return (
                <div
                  key={`${video.id}-${i}`}
                  className="flex items-center gap-2 px-2"
                  style={{ height: ITEM_HEIGHT }}
                >
                  <img
                    src={thumbUrl(video.id)}
                    alt=""
                    className="rounded flex-shrink-0 object-cover"
                    style={{ width: THUMB_W, height: THUMB_H }}
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs leading-tight font-body line-clamp-2"
                      style={{
                        color: isSelected && !isSpinning ? textColor : '#9090B0',
                        fontSize: '0.6rem',
                      }}
                    >
                      {video.title}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <p className="text-xs" style={{ color: '#54547A', fontSize: '0.55rem' }}>
                        {video.channel}
                      </p>
                      {'bpm' in video && (video as Video & { bpm: number }).bpm > 0 && (
                        <span className="text-xs font-mono" style={{ color: '#54547A', fontSize: '0.5rem' }}>
                          · {(video as Video & { bpm: number }).bpm}bpm
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Nudge buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => nudge(-1)}
            disabled={isSpinning}
            className="p-1 rounded transition-colors disabled:opacity-30"
            style={{ color: textColor }}
            title="Previous"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={() => nudge(1)}
            disabled={isSpinning}
            className="p-1 rounded transition-colors disabled:opacity-30"
            style={{ color: textColor }}
            title="Next"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
    )
  }
)

SlotReel.displayName = 'SlotReel'
export default SlotReel
