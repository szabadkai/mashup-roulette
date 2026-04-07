export interface Video {
  id: string
  title: string
  channel: string
  tags: string[]
}

export type TempoRate = 0.25 | 0.5 | 0.75 | 1.0 | 1.25 | 1.5 | 1.75 | 2.0
export const TEMPO_RATES: TempoRate[] = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]

export type ViewMode = 'side-by-side' | 'overlay'

export interface SavedMix {
  id: string
  name: string
  lofiVideoId: string
  lofiTitle: string
  lofiChannel: string
  talkVideoId: string
  talkTitle: string
  talkChannel: string
  blend: number
  tempo: TempoRate
  createdAt: string
}

export interface MixState {
  lofiVideo: Video | null
  talkVideo: Video | null
  blend: number
  tempo: TempoRate
  isPlaying: boolean
  viewMode: ViewMode
}

export const DEFAULT_MIX_STATE: MixState = {
  lofiVideo: null,
  talkVideo: null,
  blend: 70,
  tempo: 1.0,
  isPlaying: false,
  viewMode: 'side-by-side',
}

export type MixAction =
  | { type: 'SELECT_LOFI'; video: Video }
  | { type: 'SELECT_TALK'; video: Video }
  | { type: 'SET_BLEND'; value: number }
  | { type: 'SET_TEMPO'; value: TempoRate }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'SET_PLAYING'; value: boolean }
  | { type: 'SET_VIEW_MODE'; mode: ViewMode }
  | { type: 'LOAD_MIX'; state: Partial<MixState> }

export function mixerReducer(state: MixState, action: MixAction): MixState {
  switch (action.type) {
    case 'SELECT_LOFI': return { ...state, lofiVideo: action.video }
    case 'SELECT_TALK': return { ...state, talkVideo: action.video }
    case 'SET_BLEND': return { ...state, blend: action.value }
    case 'SET_TEMPO': return { ...state, tempo: action.value }
    case 'TOGGLE_PLAY': return { ...state, isPlaying: !state.isPlaying }
    case 'SET_PLAYING': return { ...state, isPlaying: action.value }
    case 'SET_VIEW_MODE': return { ...state, viewMode: action.mode }
    case 'LOAD_MIX': return { ...state, ...action.state }
    default: return state
  }
}
