export interface Video {
  id: string
  title: string
  channel: string
  tags: string[]
  bpm: number
  category: SongCategory
}

export const SONG_CATEGORIES = ['80s', '90s', 'rock', 'funk', 'rap', 'pop', 'reggae', 'dancehall'] as const
export type SongCategory = (typeof SONG_CATEGORIES)[number]

export const CATEGORY_LABELS: Record<SongCategory, string> = {
  '80s': '80s',
  '90s': '90s',
  rock: 'Rock',
  funk: 'Funk',
  rap: 'RAP',
  pop: 'Pop',
  reggae: 'Reggae',
  dancehall: 'Dancehall',
}

export const CATEGORY_EMOJI: Record<SongCategory, string> = {
  '80s': '🕺',
  '90s': '💿',
  rock: '🎸',
  funk: '🎷',
  rap: '🎤',
  pop: '🎵',
  reggae: '🌴',
  dancehall: '🔥',
}

export type ViewMode = 'side-by-side' | 'overlay'

export interface SavedMix {
  id: string
  name: string
  leftVideoId: string
  leftTitle: string
  leftChannel: string
  rightVideoId: string
  rightTitle: string
  rightChannel: string
  blend: number
  leftTempo: number
  rightTempo: number
  leftCategory: SongCategory | null
  rightCategory: SongCategory | null
  beatOffset: number  // seconds: positive = B delayed, negative = A delayed
  createdAt: string
}

export interface MixState {
  leftVideo: Video | null
  rightVideo: Video | null
  blend: number
  leftTempo: number
  rightTempo: number
  leftCategory: SongCategory | null
  rightCategory: SongCategory | null
  beatOffset: number  // seconds: positive = B starts later, negative = A starts later
  isPlaying: boolean
  viewMode: ViewMode
}

export const DEFAULT_MIX_STATE: MixState = {
  leftVideo: null,
  rightVideo: null,
  blend: 50,
  leftTempo: 1.0,
  rightTempo: 1.0,
  leftCategory: null,
  rightCategory: null,
  beatOffset: 0,
  isPlaying: false,
  viewMode: 'side-by-side',
}

export type MixAction =
  | { type: 'SELECT_LEFT'; video: Video }
  | { type: 'SELECT_RIGHT'; video: Video }
  | { type: 'SET_BLEND'; value: number }
  | { type: 'SET_LEFT_TEMPO'; value: number }
  | { type: 'SET_RIGHT_TEMPO'; value: number }
  | { type: 'SET_LEFT_CATEGORY'; value: SongCategory | null }
  | { type: 'SET_RIGHT_CATEGORY'; value: SongCategory | null }
  | { type: 'SET_BEAT_OFFSET'; value: number }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'SET_PLAYING'; value: boolean }
  | { type: 'SET_VIEW_MODE'; mode: ViewMode }
  | { type: 'LOAD_MIX'; state: Partial<MixState> }

export function mixerReducer(state: MixState, action: MixAction): MixState {
  switch (action.type) {
    case 'SELECT_LEFT': return { ...state, leftVideo: action.video }
    case 'SELECT_RIGHT': return { ...state, rightVideo: action.video }
    case 'SET_BLEND': return { ...state, blend: action.value }
    case 'SET_LEFT_TEMPO': return { ...state, leftTempo: action.value }
    case 'SET_RIGHT_TEMPO': return { ...state, rightTempo: action.value }
    case 'SET_LEFT_CATEGORY': return { ...state, leftCategory: action.value }
    case 'SET_RIGHT_CATEGORY': return { ...state, rightCategory: action.value }
    case 'SET_BEAT_OFFSET': return { ...state, beatOffset: action.value }
    case 'TOGGLE_PLAY': return { ...state, isPlaying: !state.isPlaying }
    case 'SET_PLAYING': return { ...state, isPlaying: action.value }
    case 'SET_VIEW_MODE': return { ...state, viewMode: action.mode }
    case 'LOAD_MIX': return { ...state, ...action.state }
    default: return state
  }
}
