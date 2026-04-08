import { effectiveBpm, bpmMismatchPct, syncStatus, syncColor, calcSyncRate, roundRate } from '../lib/bpm'
import type { Video } from '../types'

interface Props {
  leftVideo: Video | null
  rightVideo: Video | null
  leftTempo: number
  rightTempo: number
  onSyncLeft: (rate: number) => void
  onSyncRight: (rate: number) => void
}

export default function BpmDisplay({
  leftVideo, rightVideo, leftTempo, rightTempo, onSyncLeft, onSyncRight,
}: Props) {
  const leftBpm = leftVideo?.bpm ?? 0
  const rightBpm = rightVideo?.bpm ?? 0
  const leftEff = effectiveBpm(leftBpm, leftTempo)
  const rightEff = effectiveBpm(rightBpm, rightTempo)

  const hasBoth = leftBpm > 0 && rightBpm > 0
  const mismatch = hasBoth ? bpmMismatchPct(leftBpm, leftTempo, rightBpm, rightTempo) : 0
  const status = hasBoth ? syncStatus(mismatch) : 'off'
  const color = syncColor(status)

  const handleSyncRight = () => {
    if (!leftVideo || !rightVideo) return
    const rate = calcSyncRate(leftBpm, leftTempo, rightBpm)
    onSyncRight(roundRate(rate))
  }

  const handleSyncLeft = () => {
    if (!leftVideo || !rightVideo) return
    const rate = calcSyncRate(rightBpm, rightTempo, leftBpm)
    onSyncLeft(roundRate(rate))
  }

  return (
    <div className="flex items-center justify-between gap-2">
      {/* Left deck BPM */}
      <div className="flex flex-col items-center min-w-0">
        <span className="text-xs font-mono" style={{ color: '#FF6B9D' }}>
          {leftBpm > 0 ? `${leftBpm} BPM` : '— BPM'}
        </span>
        {leftBpm > 0 && leftTempo !== 1.0 && (
          <span className="text-[10px] font-mono text-muted">
            → {Math.round(leftEff)} eff
          </span>
        )}
      </div>

      {/* Center sync status */}
      {hasBoth ? (
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSyncLeft}
            className="text-[10px] font-mono px-1.5 py-0.5 rounded transition-all hover:opacity-80"
            style={{ background: 'rgba(255,107,157,0.15)', color: '#FF6B9D', border: '1px solid rgba(255,107,157,0.3)' }}
            title="Sync Deck A to match Deck B's BPM"
          >
            ← SYNC
          </button>
          <div className="flex flex-col items-center">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: color, boxShadow: `0 0 8px ${color}` }}
            />
            <span className="text-[10px] font-mono mt-0.5" style={{ color }}>
              {mismatch < 1 ? 'MATCHED' : `${mismatch.toFixed(1)}%`}
            </span>
          </div>
          <button
            onClick={handleSyncRight}
            className="text-[10px] font-mono px-1.5 py-0.5 rounded transition-all hover:opacity-80"
            style={{ background: 'rgba(0,207,255,0.15)', color: '#00CFFF', border: '1px solid rgba(0,207,255,0.3)' }}
            title="Sync Deck B to match Deck A's BPM"
          >
            SYNC →
          </button>
        </div>
      ) : (
        <span className="text-[10px] font-mono text-muted">SELECT BOTH TRACKS</span>
      )}

      {/* Right deck BPM */}
      <div className="flex flex-col items-center min-w-0">
        <span className="text-xs font-mono" style={{ color: '#00CFFF' }}>
          {rightBpm > 0 ? `${rightBpm} BPM` : '— BPM'}
        </span>
        {rightBpm > 0 && rightTempo !== 1.0 && (
          <span className="text-[10px] font-mono text-muted">
            → {Math.round(rightEff)} eff
          </span>
        )}
      </div>
    </div>
  )
}
