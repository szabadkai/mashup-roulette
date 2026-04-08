import type { Video } from '../types'

/** Returns the effective BPM after applying a playback rate */
export function effectiveBpm(baseBpm: number, rate: number): number {
  return baseBpm * rate
}

/** Calculates the playback rate needed on trackB to match trackA's effective BPM */
export function calcSyncRate(anchorBpm: number, anchorRate: number, targetBpm: number): number {
  const targetEffective = anchorBpm * anchorRate
  return clampRate(targetEffective / targetBpm)
}

/** Returns the BPM mismatch percentage between two tracks */
export function bpmMismatchPct(
  bpmA: number, rateA: number,
  bpmB: number, rateB: number,
): number {
  const effA = effectiveBpm(bpmA, rateA)
  const effB = effectiveBpm(bpmB, rateB)
  if (effA === 0 && effB === 0) return 0
  const avg = (effA + effB) / 2
  return Math.abs(effA - effB) / avg * 100
}

/** Filter songs to those within ±tolerance BPM of a target */
export function filterByBpmRange(songs: Video[], targetBpm: number, tolerance: number): Video[] {
  return songs.filter(s => Math.abs(s.bpm - targetBpm) <= tolerance)
}

/** Clamp a playback rate to YouTube's supported range */
export function clampRate(rate: number): number {
  return Math.max(0.25, Math.min(2.0, rate))
}

/** Round rate to nearest 0.01 for display */
export function roundRate(rate: number): number {
  return Math.round(rate * 100) / 100
}

/** Get a human-readable sync status label */
export function syncStatus(mismatch: number): 'synced' | 'close' | 'off' {
  if (mismatch < 1) return 'synced'
  if (mismatch < 5) return 'close'
  return 'off'
}

/** Color for sync status indicator */
export function syncColor(status: 'synced' | 'close' | 'off'): string {
  switch (status) {
    case 'synced': return '#00D4AA'
    case 'close': return '#FFB800'
    case 'off': return '#FF4757'
  }
}
