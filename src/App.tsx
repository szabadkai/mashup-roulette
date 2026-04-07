import { useReducer, useRef, useEffect, useState, useCallback } from 'react'
import { Save, Share2, Play, Pause } from 'lucide-react'
import lofiVideos from './data/lofi.json'
import talkVideos from './data/talks.json'
import type { Video, MixState } from './types'
import { DEFAULT_MIX_STATE, mixerReducer } from './types'
import { useSavedMixes } from './hooks/useSavedMixes'
import { useToast } from './hooks/useToast'
import { encodeShareUrl, decodeShareUrl } from './lib/urlParams'
import SlotMachine from './components/SlotMachine'
import DualPlayer, { type DualPlayerHandle } from './components/DualPlayer'
import Crossfader from './components/Crossfader'
import TempoControl from './components/TempoControl'
import ToastContainer from './components/ToastContainer'

const ALL_LOFI = lofiVideos as Video[]
const ALL_TALKS = talkVideos as Video[]

export default function App() {
  const [state, dispatch] = useReducer(mixerReducer, DEFAULT_MIX_STATE)
  const playerRef = useRef<DualPlayerHandle>(null)
  const { saveMix } = useSavedMixes()
  const { toasts, showToast, dismiss } = useToast()
  const [lofiIdx, setLofiIdx] = useState(0)
  const [talkIdx, setTalkIdx] = useState(0)
  const [savePrompt, setSavePrompt] = useState(false)
  const [saveName, setSaveName] = useState('')
  const allLofi = ALL_LOFI
  const allTalks = ALL_TALKS

  useEffect(() => {
    const restored = decodeShareUrl()
    if (restored?.lofiVideo && restored.talkVideo) {
      dispatch({ type: 'LOAD_MIX', state: restored })
      const li = allLofi.findIndex((v) => v.id === restored.lofiVideo!.id)
      const ti = allTalks.findIndex((v) => v.id === restored.talkVideo!.id)
      if (li !== -1) setLofiIdx(li)
      if (ti !== -1) setTalkIdx(ti)
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
  useEffect(() => { playerRef.current?.setTempo(state.tempo) }, [state.tempo])

  const handleLofiSelect = useCallback((idx: number) => {
    setLofiIdx(idx)
    dispatch({ type: 'SELECT_LOFI', video: allLofi[idx] })
  }, [allLofi])

  const handleTalkSelect = useCallback((idx: number) => {
    setTalkIdx(idx)
    dispatch({ type: 'SELECT_TALK', video: allTalks[idx] })
  }, [allTalks])

  const handleSpinComplete = useCallback((lofi: Video, talk: Video) => {
    dispatch({ type: 'SELECT_LOFI', video: lofi })
    dispatch({ type: 'SELECT_TALK', video: talk })
    dispatch({ type: 'SET_PLAYING', value: true })
    playerRef.current?.unmute()
    setLofiIdx(allLofi.findIndex((v) => v.id === lofi.id))
    setTalkIdx(allTalks.findIndex((v) => v.id === talk.id))
  }, [allLofi, allTalks])

  const handleSaveMix = useCallback(() => {
    if (!state.lofiVideo || !state.talkVideo) { showToast('Select videos first', 'error'); return }
    setSaveName('Mix ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    setSavePrompt(true)
  }, [state.lofiVideo, state.talkVideo, showToast])

  const confirmSave = useCallback(() => {
    if (!state.lofiVideo || !state.talkVideo) return
    saveMix({
      name: saveName || 'Untitled Mix',
      lofiVideoId: state.lofiVideo.id, lofiTitle: state.lofiVideo.title, lofiChannel: state.lofiVideo.channel,
      talkVideoId: state.talkVideo.id, talkTitle: state.talkVideo.title, talkChannel: state.talkVideo.channel,
      blend: state.blend, tempo: state.tempo,
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

  const handleLofiError = useCallback(() => {
    const nextIdx = (lofiIdx + 1) % allLofi.length
    setLofiIdx(nextIdx)
    dispatch({ type: 'SELECT_LOFI', video: allLofi[nextIdx] })
    playerRef.current?.loadLofi(allLofi[nextIdx].id)
  }, [lofiIdx, allLofi])

  const handleTalkError = useCallback(() => {
    const nextIdx = (talkIdx + 1) % allTalks.length
    setTalkIdx(nextIdx)
    dispatch({ type: 'SELECT_TALK', video: allTalks[nextIdx] })
    playerRef.current?.loadTalk(allTalks[nextIdx].id)
  }, [talkIdx, allTalks])

  const canAct = !!(state.lofiVideo && state.talkVideo)

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#06060A' }}>
      <header className="flex items-center justify-between px-3 md:px-4 py-1.5 border-b flex-shrink-0" style={{ borderColor: '#252548', background: '#0A0A14' }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">🎰</span>
          <h1 className="font-display tracking-widest" style={{ fontSize: '1rem', background: 'linear-gradient(90deg, #FFB800, #FFD060)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            LOFI CHILLHOP ROULETTE
          </h1>
        </div>
        <p className="text-xs text-muted font-mono hidden md:block">⚡ client-side only · no account needed</p>
      </header>

      <main className="flex-1 flex flex-col min-h-0 p-2 md:p-3 gap-2 overflow-y-auto custom-scroll">
        {/* Top section: Slot Machine + Video Players */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-3 md:flex-1 md:min-h-0">
          <div className="flex-shrink-0 self-center md:self-auto">
            <SlotMachine
              lofiVideos={allLofi} talkVideos={allTalks}
              lofiIdx={lofiIdx} talkIdx={talkIdx}
              onLofiSelect={handleLofiSelect} onTalkSelect={handleTalkSelect}
              onSpinComplete={handleSpinComplete} />
          </div>

          <section className="rounded-lg p-2 flex flex-col min-h-0 md:flex-1" style={{ background: '#0F0F18', border: '1px solid #252548' }}>
            <div className="relative w-full" style={{ paddingBottom: '56.25%', maxHeight: '35vh' }}>
              <div className="absolute inset-0">
                <DualPlayer ref={playerRef}
                  lofiVideo={state.lofiVideo} talkVideo={state.talkVideo}
                  blend={state.blend} isPlaying={state.isPlaying}
                  onLofiError={handleLofiError} onTalkError={handleTalkError} />
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
              style={{ background: state.isPlaying ? 'linear-gradient(135deg,#191926,#252540)' : 'linear-gradient(135deg,#FFB800,#FF8C00)', color: state.isPlaying ? '#FFB800' : '#0A0800', border: state.isPlaying ? '1px solid #FFB800' : 'none', boxShadow: state.isPlaying ? '0 0 15px rgba(255,184,0,0.2)' : '0 4px 20px rgba(255,140,0,0.4)' }}>
              {state.isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
              {state.isPlaying ? 'PAUSE' : 'PLAY'}
            </button>
            <div className="flex-1 min-w-0">
              <Crossfader blend={state.blend} onChange={(v) => dispatch({ type: 'SET_BLEND', value: v })} />
            </div>
          </div>
          {/* Row 2: Tempo + Save/Share */}
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex-1 min-w-0">
              <TempoControl tempo={state.tempo} onChange={(v) => dispatch({ type: 'SET_TEMPO', value: v })} />
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
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
            <h3 className="font-display tracking-widest text-gold mb-4 text-lg">SAVE MIX</h3>
            <input type="text" value={saveName} onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirmSave()}
              placeholder="Name your mix..." autoFocus
              className="w-full px-3 py-2 rounded text-sm font-mono outline-none mb-4"
              style={{ background: '#0F0F18', border: '1px solid #252548', color: '#E8E4DC' }} />
            <div className="flex gap-2">
              <button onClick={confirmSave} className="flex-1 py-2 rounded font-display tracking-widest text-sm" style={{ background: 'linear-gradient(135deg,#FFB800,#FF8C00)', color: '#0A0800' }}>SAVE</button>
              <button onClick={() => setSavePrompt(false)} className="flex-1 py-2 rounded text-sm font-mono" style={{ background: '#252548', color: '#9090B0' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
