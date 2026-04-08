import { useReducer, useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { Save, Share2, Play, Pause } from 'lucide-react'
import allSongs from './data/songs.json'
import type { Video, MixState, SongCategory } from './types'
import { DEFAULT_MIX_STATE, mixerReducer } from './types'
import { useSavedMixes } from './hooks/useSavedMixes'
import { useToast } from './hooks/useToast'
import { encodeShareUrl, decodeShareUrl } from './lib/urlParams'
import SlotMachine from './components/SlotMachine'
import DualPlayer, { type DualPlayerHandle } from './components/DualPlayer'
import Crossfader from './components/Crossfader'
import TempoControl from './components/TempoControl'
import BpmDisplay from './components/BpmDisplay'
import BeatOffsetControl from './components/BeatOffsetControl'
import CategoryFilter from './components/CategoryFilter'
import ToastContainer from './components/ToastContainer'

const ALL_SONGS = allSongs as Video[]

export default function App() {
  const [state, dispatch] = useReducer(mixerReducer, DEFAULT_MIX_STATE)
  const playerRef = useRef<DualPlayerHandle>(null)
  const { saveMix } = useSavedMixes()
  const { toasts, showToast, dismiss } = useToast()
  const [leftIdx, setLeftIdx] = useState(0)
  const [rightIdx, setRightIdx] = useState(0)
  const [savePrompt, setSavePrompt] = useState(false)
  const [saveName, setSaveName] = useState('')

  // Filter songs by category
  const leftSongs = useMemo(() =>
    state.leftCategory ? ALL_SONGS.filter(s => s.category === state.leftCategory) : ALL_SONGS,
    [state.leftCategory]
  )
  const rightSongs = useMemo(() =>
    state.rightCategory ? ALL_SONGS.filter(s => s.category === state.rightCategory) : ALL_SONGS,
    [state.rightCategory]
  )

  useEffect(() => {
    const restored = decodeShareUrl()
    if (restored?.leftVideo && restored.rightVideo) {
      dispatch({ type: 'LOAD_MIX', state: restored })
      const li = leftSongs.findIndex((v) => v.id === restored.leftVideo!.id)
      const ri = rightSongs.findIndex((v) => v.id === restored.rightVideo!.id)
      if (li !== -1) setLeftIdx(li)
      if (ri !== -1) setRightIdx(ri)
      showToast('Mix loaded from shared link! 🔗', 'info')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (state.isPlaying) {
      playerRef.current?.play()
    } else {
      playerRef.current?.pause()
    }
  }, [state.isPlaying])

  useEffect(() => { playerRef.current?.setBlend(state.blend) }, [state.blend])
  useEffect(() => { playerRef.current?.setLeftTempo(state.leftTempo) }, [state.leftTempo])
  useEffect(() => { playerRef.current?.setRightTempo(state.rightTempo) }, [state.rightTempo])
  useEffect(() => { playerRef.current?.applyOffset(state.beatOffset) }, [state.beatOffset])

  // Reset index when category changes
  useEffect(() => { setLeftIdx(0) }, [state.leftCategory])
  useEffect(() => { setRightIdx(0) }, [state.rightCategory])

  const handleLeftSelect = useCallback((idx: number) => {
    setLeftIdx(idx)
    dispatch({ type: 'SELECT_LEFT', video: leftSongs[idx] })
  }, [leftSongs])

  const handleRightSelect = useCallback((idx: number) => {
    setRightIdx(idx)
    dispatch({ type: 'SELECT_RIGHT', video: rightSongs[idx] })
  }, [rightSongs])

  const handleSpinComplete = useCallback((left: Video, right: Video) => {
    dispatch({ type: 'SELECT_LEFT', video: left })
    dispatch({ type: 'SELECT_RIGHT', video: right })
    dispatch({ type: 'SET_PLAYING', value: true })
    playerRef.current?.unmute()
    setLeftIdx(leftSongs.findIndex((v) => v.id === left.id))
    setRightIdx(rightSongs.findIndex((v) => v.id === right.id))
  }, [leftSongs, rightSongs])

  const handleSaveMix = useCallback(() => {
    if (!state.leftVideo || !state.rightVideo) { showToast('Select videos first', 'error'); return }
    setSaveName('Mix ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    setSavePrompt(true)
  }, [state.leftVideo, state.rightVideo, showToast])

  const confirmSave = useCallback(() => {
    if (!state.leftVideo || !state.rightVideo) return
    saveMix({
      name: saveName || 'Untitled Mix',
      leftVideoId: state.leftVideo.id, leftTitle: state.leftVideo.title, leftChannel: state.leftVideo.channel,
      rightVideoId: state.rightVideo.id, rightTitle: state.rightVideo.title, rightChannel: state.rightVideo.channel,
      blend: state.blend, leftTempo: state.leftTempo, rightTempo: state.rightTempo,
      leftCategory: state.leftCategory, rightCategory: state.rightCategory,
      beatOffset: state.beatOffset,
    })
    setSavePrompt(false)
    showToast('Mix saved! 💾', 'success')
  }, [state, saveName, saveMix, showToast])

  const handleShare = useCallback(() => {
    const url = encodeShareUrl(state as MixState)
    navigator.clipboard.writeText(url)
      .then(() => showToast('Link copied to clipboard! 🔗', 'success'))
      .catch(() => showToast('Copy failed — check permissions', 'error'))
  }, [state, showToast])

  const handleLeftError = useCallback(() => {
    const nextIdx = (leftIdx + 1) % leftSongs.length
    setLeftIdx(nextIdx)
    dispatch({ type: 'SELECT_LEFT', video: leftSongs[nextIdx] })
    playerRef.current?.loadLeft(leftSongs[nextIdx].id)
  }, [leftIdx, leftSongs])

  const handleRightError = useCallback(() => {
    const nextIdx = (rightIdx + 1) % rightSongs.length
    setRightIdx(nextIdx)
    dispatch({ type: 'SELECT_RIGHT', video: rightSongs[nextIdx] })
    playerRef.current?.loadRight(rightSongs[nextIdx].id)
  }, [rightIdx, rightSongs])

  const handleApplyOffset = useCallback(() => {
    playerRef.current?.applyOffset(state.beatOffset)
  }, [state.beatOffset])

  const canAct = !!(state.leftVideo && state.rightVideo)

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#06060A' }}>
      <header className="flex items-center justify-between px-3 md:px-4 py-1.5 border-b flex-shrink-0" style={{ borderColor: '#252548', background: '#0A0A14' }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">🎰</span>
          <h1 className="font-display tracking-widest" style={{ fontSize: '1rem', background: 'linear-gradient(90deg, #FF6B9D, #FFB800, #00CFFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            MASHUP ROULETTE
          </h1>
        </div>
        <p className="text-xs text-muted font-mono hidden md:block">⚡ BPM-matched mashups · client-side only</p>
      </header>

      <main className="flex-1 flex flex-col min-h-0 p-2 md:p-3 gap-2 overflow-y-auto custom-scroll">
        {/* Category filters row */}
        <div className="flex-shrink-0 flex flex-col md:flex-row gap-2">
          <div className="flex-1">
            <span className="text-[10px] font-mono tracking-widest text-muted mb-1 block">DECK A GENRE</span>
            <CategoryFilter
              selected={state.leftCategory}
              onChange={(cat: SongCategory | null) => dispatch({ type: 'SET_LEFT_CATEGORY', value: cat })}
              accentColor="#FF6B9D"
            />
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-mono tracking-widest text-muted mb-1 block">DECK B GENRE</span>
            <CategoryFilter
              selected={state.rightCategory}
              onChange={(cat: SongCategory | null) => dispatch({ type: 'SET_RIGHT_CATEGORY', value: cat })}
              accentColor="#00CFFF"
            />
          </div>
        </div>

        {/* Top section: Slot Machine + Video Players */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-3 md:min-h-0">
          <div className="flex-shrink-0 self-center md:self-auto">
            <SlotMachine
              leftVideos={leftSongs} rightVideos={rightSongs}
              leftIdx={leftIdx} rightIdx={rightIdx}
              onLeftSelect={handleLeftSelect} onRightSelect={handleRightSelect}
              onSpinComplete={handleSpinComplete} />
          </div>

          <section className="rounded-lg p-2 flex flex-col min-h-0 md:flex-1 overflow-hidden" style={{ background: '#0F0F18', border: '1px solid #252548', maxHeight: '35vh' }}>
            <div className="relative w-full h-full min-h-0" style={{ aspectRatio: '16/9' }}>
              <div className="absolute inset-0">
                <DualPlayer ref={playerRef}
                  leftVideo={state.leftVideo} rightVideo={state.rightVideo}
                  blend={state.blend} isPlaying={state.isPlaying}
                  onLeftError={handleLeftError} onRightError={handleRightError} />
              </div>
            </div>
          </section>
        </div>

        {/* Bottom bar: Controls */}
        <div className="flex-shrink-0 rounded-lg p-2 md:p-3 flex flex-col gap-2" style={{ background: '#0F0F18', border: '1px solid #252548' }}>
          {/* Row 1: Play + Crossfader */}
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => { dispatch({ type: 'TOGGLE_PLAY' }); if (!state.isPlaying) playerRef.current?.unmute() }} disabled={!canAct}
              className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg font-display tracking-widest text-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              style={{ background: state.isPlaying ? 'linear-gradient(135deg,#191926,#252540)' : 'linear-gradient(135deg,#FF6B9D,#FF8C00)', color: state.isPlaying ? '#FF6B9D' : '#0A0800', border: state.isPlaying ? '1px solid #FF6B9D' : 'none', boxShadow: state.isPlaying ? '0 0 15px rgba(255,107,157,0.2)' : '0 4px 20px rgba(255,107,157,0.4)' }}>
              {state.isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
              {state.isPlaying ? 'PAUSE' : 'PLAY'}
            </button>
            <div className="flex-1 min-w-0">
              <Crossfader blend={state.blend} onChange={(v) => dispatch({ type: 'SET_BLEND', value: v })} />
            </div>
          </div>

          {/* Row 2: BPM Display */}
          <BpmDisplay
            leftVideo={state.leftVideo} rightVideo={state.rightVideo}
            leftTempo={state.leftTempo} rightTempo={state.rightTempo}
            onSyncLeft={(rate) => dispatch({ type: 'SET_LEFT_TEMPO', value: rate })}
            onSyncRight={(rate) => dispatch({ type: 'SET_RIGHT_TEMPO', value: rate })}
          />

          {/* Row 3: Beat Offset */}
          <BeatOffsetControl
            offset={state.beatOffset}
            onChange={(v) => dispatch({ type: 'SET_BEAT_OFFSET', value: v })}
            onApply={handleApplyOffset}
          />

          {/* Row 4: Per-deck Tempo Controls + Save/Share */}
          <div className="flex flex-col md:flex-row items-stretch gap-2 md:gap-4">
            <div className="flex-1 min-w-0">
              <TempoControl
                tempo={state.leftTempo}
                onChange={(v) => dispatch({ type: 'SET_LEFT_TEMPO', value: v })}
                label="Deck A Speed"
                accentColor="#FF6B9D"
                bpm={state.leftVideo?.bpm}
              />
            </div>
            <div className="flex-1 min-w-0">
              <TempoControl
                tempo={state.rightTempo}
                onChange={(v) => dispatch({ type: 'SET_RIGHT_TEMPO', value: v })}
                label="Deck B Speed"
                accentColor="#00CFFF"
                bpm={state.rightVideo?.bpm}
              />
            </div>
            <div className="flex items-end gap-1.5 flex-shrink-0">
              <button onClick={handleSaveMix} disabled={!canAct}
                className="flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-lg text-xs font-mono transition-all active:scale-95 disabled:opacity-40"
                style={{ background: '#191926', border: '1px solid #252548', color: '#9090B0' }}>
                <Save size={12} /> Save
              </button>
              <button onClick={handleShare} disabled={!canAct}
                className="flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-lg text-xs font-mono transition-all active:scale-95 disabled:opacity-40"
                style={{ background: '#191926', border: '1px solid #252548', color: '#9090B0' }}>
                <Share2 size={12} /> Share
              </button>
            </div>
          </div>
        </div>
      </main>

      {savePrompt && (
        <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setSavePrompt(false)}>
          <div className="rounded-xl p-6 w-80" style={{ background: '#191926', border: '1px solid #252548' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display tracking-widest text-lg mb-4" style={{ background: 'linear-gradient(90deg, #FF6B9D, #00CFFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SAVE MIX</h3>
            <input type="text" value={saveName} onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirmSave()}
              placeholder="Name your mix..." autoFocus
              className="w-full px-3 py-2 rounded text-sm font-mono outline-none mb-4"
              style={{ background: '#0F0F18', border: '1px solid #252548', color: '#E8E4DC' }} />
            <div className="flex gap-2">
              <button onClick={confirmSave} className="flex-1 py-2 rounded font-display tracking-widest text-sm" style={{ background: 'linear-gradient(135deg,#FF6B9D,#FF8C00)', color: '#0A0800' }}>SAVE</button>
              <button onClick={() => setSavePrompt(false)} className="flex-1 py-2 rounded text-sm font-mono" style={{ background: '#252548', color: '#9090B0' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
