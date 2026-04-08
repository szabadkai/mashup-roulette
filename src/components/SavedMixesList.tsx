import { useState } from 'react'
import type { SavedMix } from '../types'
import { Trash2, Play } from 'lucide-react'

interface Props {
  mixes: SavedMix[]
  onLoad: (mix: SavedMix) => void
  onDelete: (id: string) => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function SavedMixesList({ mixes, onLoad, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  if (mixes.length === 0) {
    return (
      <p className="text-xs text-muted text-center py-3 font-mono">
        No saved mixes yet
      </p>
    )
  }

  return (
    <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scroll pr-1">
      {mixes.map((mix) => (
        <div
          key={mix.id}
          className="flex items-center gap-2 px-2 py-2 rounded group"
          style={{ background: '#0F0F18', border: '1px solid #252548' }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs font-body text-cream truncate">{mix.name}</p>
            <p className="text-xs text-muted font-mono" style={{ fontSize: '0.6rem' }}>
              {mix.leftTempo}x/{mix.rightTempo}x · blend {mix.blend}% · {formatDate(mix.createdAt)}
            </p>
          </div>
          <button
            onClick={() => onLoad(mix)}
            className="p-1 rounded transition-colors opacity-60 group-hover:opacity-100"
            style={{ color: '#FF6B9D' }}
            title="Load mix"
          >
            <Play size={13} fill="currentColor" />
          </button>
          {confirmDelete === mix.id ? (
            <button
              onClick={() => { onDelete(mix.id); setConfirmDelete(null) }}
              className="p-1 rounded text-xs font-mono"
              style={{ color: '#FF4757' }}
              title="Confirm delete"
            >
              ✓
            </button>
          ) : (
            <button
              onClick={() => setConfirmDelete(mix.id)}
              onBlur={() => setConfirmDelete(null)}
              className="p-1 rounded transition-colors opacity-30 group-hover:opacity-70"
              style={{ color: '#FF4757' }}
              title="Delete mix"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
