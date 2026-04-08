interface Props {
  offset: number // seconds
  onChange: (offset: number) => void
  onApply: () => void
}

const NUDGES = [
  { label: '−500', delta: -0.5 },
  { label: '−100', delta: -0.1 },
  { label: '−50', delta: -0.05 },
  { label: '+50', delta: 0.05 },
  { label: '+100', delta: 0.1 },
  { label: '+500', delta: 0.5 },
] as const

export default function BeatOffsetControl({ offset, onChange, onApply }: Props) {
  const displayMs = Math.round(offset * 1000)
  const sign = displayMs > 0 ? '+' : displayMs < 0 ? '−' : ''
  const label =
    displayMs === 0
      ? 'ALIGNED'
      : `${sign}${Math.abs(displayMs)}ms ${displayMs > 0 ? '(B late)' : '(A late)'}`

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span
        className="text-[10px] font-mono tracking-widest flex-shrink-0"
        style={{ color: '#9090B0' }}
      >
        BEAT OFFSET
      </span>

      <div className="flex items-center gap-0.5">
        {NUDGES.map(({ label: lbl, delta }) => (
          <button
            key={lbl}
            onClick={() => {
              onChange(Math.round((offset + delta) * 1000) / 1000)
              // auto-apply after nudge
              setTimeout(onApply, 0)
            }}
            className="px-1.5 py-0.5 rounded text-[10px] font-mono transition-all active:scale-95"
            style={{
              background: '#191926',
              border: '1px solid #252548',
              color: delta < 0 ? '#FF6B9D' : '#00CFFF',
            }}
          >
            {lbl}
          </button>
        ))}
      </div>

      <span
        className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded min-w-[90px] text-center"
        style={{
          background: offset === 0 ? 'rgba(0,255,136,0.1)' : 'rgba(255,184,0,0.1)',
          color: offset === 0 ? '#00FF88' : '#FFB800',
          border: `1px solid ${offset === 0 ? 'rgba(0,255,136,0.2)' : 'rgba(255,184,0,0.2)'}`,
        }}
      >
        {label}
      </span>

      <button
        onClick={() => {
          onChange(0)
          setTimeout(onApply, 0)
        }}
        className="px-1.5 py-0.5 rounded text-[10px] font-mono transition-all active:scale-95"
        style={{ background: '#191926', border: '1px solid #252548', color: '#9090B0' }}
      >
        RESET
      </button>

      <button
        onClick={onApply}
        className="px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #FF6B9D, #00CFFF)',
          color: '#0A0800',
        }}
      >
        SYNC ↻
      </button>
    </div>
  )
}
