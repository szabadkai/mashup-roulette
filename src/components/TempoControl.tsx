import { TEMPO_RATES, type TempoRate } from '../types'

interface Props {
  tempo: TempoRate
  onChange: (rate: TempoRate) => void
}

export default function TempoControl({ tempo, onChange }: Props) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-mono text-muted tracking-widest uppercase">Tempo</span>
        <span
          className="text-xs font-mono font-bold"
          style={{ color: '#FFD060' }}
        >
          {tempo.toFixed(2)}x
        </span>
      </div>
      <div className="flex gap-1 flex-wrap">
        {TEMPO_RATES.map((rate) => {
          const active = rate === tempo
          return (
            <button
              key={rate}
              onClick={() => onChange(rate)}
              className="rounded px-1.5 md:px-2.5 py-0.5 md:py-1 text-xs font-mono transition-all duration-150"
              style={{
                background: active ? '#FFB800' : '#191926',
                color: active ? '#08080E' : '#54547A',
                border: active ? '1px solid #FFB800' : '1px solid #252548',
                boxShadow: active ? '0 0 10px rgba(255,184,0,0.5)' : 'none',
                fontWeight: active ? 700 : 400,
              }}
            >
              {rate}x
            </button>
          )
        })}
      </div>
    </div>
  )
}
