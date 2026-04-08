interface Props {
  blend: number  // 0–100
  onChange: (blend: number) => void
}

export default function Crossfader({ blend, onChange }: Props) {
  const leftPct = Math.round(blend)
  const rightPct = 100 - leftPct

  // Background gradient tracks the slider position
  const trackBg = `linear-gradient(to right,
    rgba(255,107,157,0.5) 0%,
    rgba(255,107,157,0.3) ${blend}%,
    rgba(0,207,255,0.3) ${blend}%,
    rgba(0,207,255,0.5) 100%
  )`

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-mono" style={{ color: '#FF6B9D' }}>
          🅰 {leftPct}%
        </span>
        <span className="text-xs font-mono text-muted hidden sm:block">BLEND</span>
        <span className="text-xs font-mono" style={{ color: '#00CFFF' }}>
          {rightPct}% 🅱
        </span>
      </div>
      <div className="relative h-2 rounded-full" style={{ background: trackBg }}>
        <input
          type="range"
          min={0}
          max={100}
          value={blend}
          onChange={(e) => onChange(Number(e.target.value))}
          className="range-gold absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Audio blend"
        />
        {/* Visual thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full pointer-events-none transition-transform"
          style={{
            left: `calc(${blend}% - 10px)`,
            background: '#FFB800',
            boxShadow: '0 0 12px rgba(255,184,0,0.7)',
          }}
        />
      </div>
    </div>
  )
}
