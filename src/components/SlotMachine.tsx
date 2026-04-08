import { useRef, useState } from 'react'
import SlotReel, { type SlotReelHandle } from './SlotReel'
import type { Video } from '../types'

interface Props {
  leftVideos: Video[]
  rightVideos: Video[]
  leftIdx: number
  rightIdx: number
  onLeftSelect: (idx: number) => void
  onRightSelect: (idx: number) => void
  onSpinComplete: (left: Video, right: Video) => void
}

export default function SlotMachine({
  leftVideos,
  rightVideos,
  leftIdx,
  rightIdx,
  onLeftSelect,
  onRightSelect,
  onSpinComplete,
}: Props) {
  const leftReelRef = useRef<SlotReelHandle>(null)
  const rightReelRef = useRef<SlotReelHandle>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'left-done' | 'done'>('idle')

  const handleSpin = () => {
    if (isSpinning || leftVideos.length === 0 || rightVideos.length === 0) return

    const newLeftIdx = Math.floor(Math.random() * leftVideos.length)
    const newRightIdx = Math.floor(Math.random() * rightVideos.length)

    setIsSpinning(true)
    setPhase('spinning')

    // Left reel stops first at 2s
    leftReelRef.current?.spin(newLeftIdx, 2000, () => {
      setPhase('left-done')
    })

    // Right reel stops second at 3s
    rightReelRef.current?.spin(newRightIdx, 3000, () => {
      setPhase('done')
      setIsSpinning(false)
      // Auto-play after brief celebrate moment
      setTimeout(() => {
        onSpinComplete(leftVideos[newLeftIdx], rightVideos[newRightIdx])
        setPhase('idle')
      }, 400)
    })
  }

  const spinLabel =
    phase === 'idle' ? 'SPIN' :
    phase === 'spinning' ? 'SPINNING...' :
    phase === 'left-done' ? 'LOADING...' :
    phase === 'done' ? 'NICE!' : 'SPIN'

  return (
    <div
      className="relative rounded-xl p-2 pb-2 scanlines"
      style={{
        background: 'linear-gradient(160deg, #15152A 0%, #0D0D1C 100%)',
        border: '2px solid #252548',
        boxShadow: '0 0 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* Corner screws */}
      {[
        'top-2 left-2', 'top-2 right-2',
        'bottom-2 left-2', 'bottom-2 right-2',
      ].map((pos) => (
        <div
          key={pos}
          className={`absolute ${pos} w-2.5 h-2.5 rounded-full`}
          style={{ background: '#2A2A45', border: '1px solid #353560', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }}
        />
      ))}

      {/* Machine title */}
      <div className="text-center mb-2">
        <span
          className="font-display tracking-widest text-xs"
          style={{
            background: 'linear-gradient(90deg, #FFB800, #FFD060, #FFB800)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          ✦ MASHUP ROULETTE ✦
        </span>
      </div>

      {/* Reels row */}
      <div className="flex items-start justify-center gap-2">
        <SlotReel
          ref={leftReelRef}
          items={leftVideos}
          selectedIdx={leftIdx}
          onSelect={onLeftSelect}
          accentColor="pink"
          label="🅰 Deck A"
          isSpinning={isSpinning}
        />

        {/* Divider with animated dot */}
        <div className="flex flex-col items-center self-center gap-2 pt-4">
          <div className="w-1.5 h-1.5 rounded-full bg-muted" />
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: isSpinning ? '#FFB800' : '#252548',
              boxShadow: isSpinning ? '0 0 10px rgba(255,184,0,0.8)' : 'none',
              transition: 'background 0.3s, box-shadow 0.3s',
            }}
          />
          <div className="w-1.5 h-1.5 rounded-full bg-muted" />
        </div>

        <SlotReel
          ref={rightReelRef}
          items={rightVideos}
          selectedIdx={rightIdx}
          onSelect={onRightSelect}
          accentColor="cyan"
          label="🅱 Deck B"
          isSpinning={isSpinning}
        />
      </div>

      {/* SPIN button */}
      <div className="flex justify-center mt-2">
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className="relative font-display tracking-widest text-sm px-6 py-1.5 rounded-lg transition-all duration-150 active:scale-95 disabled:cursor-not-allowed"
          style={{
            background: isSpinning
              ? 'linear-gradient(135deg, #5A4000, #3A2800)'
              : 'linear-gradient(135deg, #FFB800, #FF8C00)',
            color: isSpinning ? '#7A6030' : '#0A0800',
            boxShadow: isSpinning
              ? 'none'
              : '0 4px 20px rgba(255,140,0,0.5), 0 1px 0 rgba(255,255,255,0.2) inset',
            textShadow: 'none',
          }}
        >
          {spinLabel}
        </button>
      </div>
    </div>
  )
}
