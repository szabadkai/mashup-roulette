import { useState } from 'react'
import type { Video } from '../types'

interface Props {
  videos: Video[]
  onSelect: (video: Video) => void
  selectedId: string | null
  accentColor: 'gold' | 'cyan'
  label: string
  customUrlHandler?: (url: string) => void
}

function thumbUrl(id: string) {
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`
}

function extractVideoId(input: string): string | null {
  try {
    // Plain video ID (11 chars, alphanumeric + - _)
    if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) return input.trim()
    const url = new URL(input)
    // youtu.be short links
    if (url.hostname === 'youtu.be') return url.pathname.slice(1).split('?')[0]
    // youtube.com/watch?v=
    const v = url.searchParams.get('v')
    if (v) return v
    // youtube.com/embed/
    const embedMatch = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/)
    if (embedMatch) return embedMatch[1]
  } catch {
    // not a URL, not a valid ID
  }
  return null
}

export default function VideoList({
  videos,
  onSelect,
  selectedId,
  accentColor,
  label,
  customUrlHandler,
}: Props) {
  const [query, setQuery] = useState('')
  const [customUrl, setCustomUrl] = useState('')
  const [urlError, setUrlError] = useState('')

  const accent = accentColor === 'gold' ? '#FFB800' : '#00CFFF'
  const accentBg = accentColor === 'gold' ? 'rgba(255,184,0,0.08)' : 'rgba(0,207,255,0.08)'

  const filtered = videos.filter(
    (v) =>
      v.title.toLowerCase().includes(query.toLowerCase()) ||
      v.channel.toLowerCase().includes(query.toLowerCase())
  )

  const handleCustomUrl = () => {
    const id = extractVideoId(customUrl.trim())
    if (!id) {
      setUrlError('Invalid YouTube URL or video ID')
      return
    }
    setUrlError('')
    customUrlHandler?.(id)
    setCustomUrl('')
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-mono tracking-widest uppercase" style={{ color: accent }}>
        {label}
      </span>

      {/* Search */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="w-full px-2.5 py-1.5 text-xs font-mono rounded outline-none"
        style={{
          background: '#0F0F18',
          border: '1px solid #252548',
          color: '#E8E4DC',
        }}
      />

      {/* List */}
      <div className="space-y-1 max-h-40 overflow-y-auto custom-scroll pr-1">
        {filtered.map((video) => {
          const active = video.id === selectedId
          return (
            <button
              key={video.id}
              onClick={() => onSelect(video)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-all"
              style={{
                background: active ? accentBg : 'transparent',
                border: active ? `1px solid ${accent}40` : '1px solid transparent',
              }}
            >
              <img
                src={thumbUrl(video.id)}
                alt=""
                className="flex-shrink-0 rounded object-cover"
                style={{ width: 36, height: 24 }}
                loading="lazy"
              />
              <div className="min-w-0">
                <p
                  className="text-xs leading-tight truncate"
                  style={{ color: active ? accent : '#9090B0', fontSize: '0.65rem' }}
                >
                  {video.title}
                </p>
                <p className="text-xs text-muted" style={{ fontSize: '0.6rem' }}>
                  {video.channel}
                </p>
              </div>
            </button>
          )
        })}
        {filtered.length === 0 && (
          <p className="text-xs text-muted text-center py-2">No results</p>
        )}
      </div>

      {/* Custom URL */}
      {customUrlHandler && (
        <div>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={customUrl}
              onChange={(e) => { setCustomUrl(e.target.value); setUrlError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomUrl()}
              placeholder="Paste YouTube URL..."
              className="flex-1 px-2 py-1 text-xs font-mono rounded outline-none min-w-0"
              style={{ background: '#0F0F18', border: '1px solid #252548', color: '#E8E4DC' }}
            />
            <button
              onClick={handleCustomUrl}
              className="px-2 py-1 rounded text-xs font-mono transition-colors"
              style={{ background: accent, color: '#08080E', fontWeight: 700 }}
            >
              +
            </button>
          </div>
          {urlError && (
            <p className="text-xs mt-1" style={{ color: '#FF4757' }}>{urlError}</p>
          )}
        </div>
      )}
    </div>
  )
}
