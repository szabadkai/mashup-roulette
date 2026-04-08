import { roundRate } from '../lib/bpm'

interface Props {
  tempo: number
  onChange: (rate: number) => void
  label: string
  accentColor: string
  bpm?: number
}

export default function TempoControl({ tempo, onChange, label, accentColor, bpm }: Props) {
  const effectiveBpmVal = bpm ? Math.round(bpm * tempo) : null

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-mono text-muted tracking-widest uppercase">{label}</span>
        <div className="flex items-center gap-2">
          {effectiveBpmVal && (
            <span className="text-[10px] font-mono text-muted">
              {effectiveBpmVal} BPM
            </span>
          )}
          <span className="text-xs font-mono font-bold" style={{ color: accentColor }}>
            {tempo.toFixed(2)}x
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(roundRate(Math.max(0.25, tempo - 0.05)))}
          className="text-xs font-mono px-1.5 py-0.5 rounded"
          style={{ background: '#191926', color: '#54547A', border: '1px solid #252548' }}
        >
          −
        </button>
        <div className="relative flex-1 h-2 rounded-full" style={{ background: '#191926', border: '1px solid #252548' }}>
          <input
            type="range"
            min={25}
            max={200}
            value={Math.round(tempo * 100)}
            onChange={(e) => onChange(roundRate(Number(e.target.value) / 100))}
            className="range-gold absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label={`${label} speed`}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full pointer-events-none transition-transform"
            style={{
              left: `calc(${((tempo - 0.25) / 1.75) * 100}% - 8px)`,
              background: accentColor,
              boxShadow: `0 0 10px ${accentColor}80`,
            }}
          />
        </div>
        <button
          onClick={() => onChange(roundRate(Math.min(2.0, tempo + 0.05)))}
          className="text-xs font-mono px-1.5 py-0.5 rounded"
          style={{ background: '#191926', color: '#54547A', border: '1px solid #252548' }}
        >
          +
        </button>
        <button
          onClick={() => onChange(1.0)}
          className="text-[10px] font-mono px-1.5 py-0.5 rounded"
          style={{
            background: tempo === 1.0 ? accentColor : '#191926',
            color: tempo === 1.0 ? '#08080E' : '#54547A',
            border: `1px solid ${tempo === 1.0 ? accentColor : '#252548'}`,
          }}
        >
          1×
        </button>
      </div>
    </div>
  )
}
