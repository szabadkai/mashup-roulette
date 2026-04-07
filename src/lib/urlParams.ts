import type { Video, TempoRate, MixState } from '../types'
import { TEMPO_RATES } from '../types'

export function encodeShareUrl(state: MixState): string {
  if (!state.lofiVideo || !state.talkVideo) return window.location.href
  const params = new URLSearchParams({
    lofi: state.lofiVideo.id,
    lofiTitle: state.lofiVideo.title,
    lofiChannel: state.lofiVideo.channel,
    talk: state.talkVideo.id,
    talkTitle: state.talkVideo.title,
    talkChannel: state.talkVideo.channel,
    blend: String(state.blend),
    tempo: String(state.tempo),
  })
  const base = window.location.origin + window.location.pathname
  return `${base}?${params.toString()}`
}

export function decodeShareUrl(): Partial<MixState> | null {
  const params = new URLSearchParams(window.location.search)
  const lofiId = params.get('lofi')
  const talkId = params.get('talk')
  if (!lofiId || !talkId) return null

  const blend = parseInt(params.get('blend') ?? '70', 10)
  const tempoRaw = parseFloat(params.get('tempo') ?? '1.0')
  const tempo: TempoRate = (TEMPO_RATES.includes(tempoRaw as TempoRate)
    ? tempoRaw
    : 1.0) as TempoRate

  const lofiVideo: Video = {
    id: lofiId,
    title: params.get('lofiTitle') ?? 'Lofi Video',
    channel: params.get('lofiChannel') ?? 'Unknown',
    tags: [],
  }
  const talkVideo: Video = {
    id: talkId,
    title: params.get('talkTitle') ?? 'Talk Video',
    channel: params.get('talkChannel') ?? 'Unknown',
    tags: [],
  }
  return {
    lofiVideo,
    talkVideo,
    blend: isNaN(blend) ? 70 : Math.max(0, Math.min(100, blend)),
    tempo,
  }
}

export function clearShareUrl(): void {
  window.history.replaceState({}, '', window.location.pathname)
}
