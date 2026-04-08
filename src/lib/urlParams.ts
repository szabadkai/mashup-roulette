import type { Video, MixState, SongCategory } from '../types'
import { SONG_CATEGORIES } from '../types'

export function encodeShareUrl(state: MixState): string {
  if (!state.leftVideo || !state.rightVideo) return window.location.href
  const params = new URLSearchParams({
    left: state.leftVideo.id,
    leftTitle: state.leftVideo.title,
    leftChannel: state.leftVideo.channel,
    leftBpm: String(state.leftVideo.bpm),
    leftCat: state.leftVideo.category,
    right: state.rightVideo.id,
    rightTitle: state.rightVideo.title,
    rightChannel: state.rightVideo.channel,
    rightBpm: String(state.rightVideo.bpm),
    rightCat: state.rightVideo.category,
    blend: String(state.blend),
    leftTempo: String(state.leftTempo),
    rightTempo: String(state.rightTempo),
    beatOffset: String(state.beatOffset),
  })
  if (state.leftCategory) params.set('leftFilter', state.leftCategory)
  if (state.rightCategory) params.set('rightFilter', state.rightCategory)
  const base = window.location.origin + window.location.pathname
  return `${base}?${params.toString()}`
}

export function decodeShareUrl(): Partial<MixState> | null {
  const params = new URLSearchParams(window.location.search)
  const leftId = params.get('left')
  const rightId = params.get('right')
  if (!leftId || !rightId) return null

  const blend = parseInt(params.get('blend') ?? '50', 10)
  const leftTempo = parseFloat(params.get('leftTempo') ?? '1.0')
  const rightTempo = parseFloat(params.get('rightTempo') ?? '1.0')
  const beatOffset = parseFloat(params.get('beatOffset') ?? '0')

  const leftCatRaw = params.get('leftCat') ?? ''
  const rightCatRaw = params.get('rightCat') ?? ''
  const leftFilterRaw = params.get('leftFilter')
  const rightFilterRaw = params.get('rightFilter')

  const leftVideo: Video = {
    id: leftId,
    title: params.get('leftTitle') ?? 'Track A',
    channel: params.get('leftChannel') ?? 'Unknown',
    tags: [],
    bpm: parseInt(params.get('leftBpm') ?? '0', 10),
    category: (SONG_CATEGORIES.includes(leftCatRaw as SongCategory) ? leftCatRaw : 'pop') as SongCategory,
  }
  const rightVideo: Video = {
    id: rightId,
    title: params.get('rightTitle') ?? 'Track B',
    channel: params.get('rightChannel') ?? 'Unknown',
    tags: [],
    bpm: parseInt(params.get('rightBpm') ?? '0', 10),
    category: (SONG_CATEGORIES.includes(rightCatRaw as SongCategory) ? rightCatRaw : 'pop') as SongCategory,
  }

  const leftCategory = leftFilterRaw && SONG_CATEGORIES.includes(leftFilterRaw as SongCategory)
    ? leftFilterRaw as SongCategory : null
  const rightCategory = rightFilterRaw && SONG_CATEGORIES.includes(rightFilterRaw as SongCategory)
    ? rightFilterRaw as SongCategory : null

  return {
    leftVideo, rightVideo, blend,
    leftTempo: Math.max(0.25, Math.min(2.0, leftTempo)),
    rightTempo: Math.max(0.25, Math.min(2.0, rightTempo)),
    beatOffset: Math.max(-10, Math.min(10, beatOffset)),
    leftCategory, rightCategory,
  }
}

export function clearShareUrl(): void {
  window.history.replaceState({}, '', window.location.pathname)
}
