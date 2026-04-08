import { SONG_CATEGORIES, CATEGORY_LABELS, CATEGORY_EMOJI, type SongCategory } from '../types'

interface Props {
  selected: SongCategory | null
  onChange: (cat: SongCategory | null) => void
  accentColor: string
}

export default function CategoryFilter({ selected, onChange, accentColor }: Props) {
  return (
    <div className="flex gap-1 flex-wrap">
      <button
        onClick={() => onChange(null)}
        className="rounded px-2 py-0.5 text-xs font-mono transition-all duration-150"
        style={{
          background: selected === null ? accentColor : '#191926',
          color: selected === null ? '#08080E' : '#54547A',
          border: selected === null ? `1px solid ${accentColor}` : '1px solid #252548',
          fontWeight: selected === null ? 700 : 400,
        }}
      >
        ALL
      </button>
      {SONG_CATEGORIES.map((cat) => {
        const active = cat === selected
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className="rounded px-2 py-0.5 text-xs font-mono transition-all duration-150"
            style={{
              background: active ? accentColor : '#191926',
              color: active ? '#08080E' : '#54547A',
              border: active ? `1px solid ${accentColor}` : '1px solid #252548',
              fontWeight: active ? 700 : 400,
            }}
          >
            {CATEGORY_EMOJI[cat]} {CATEGORY_LABELS[cat]}
          </button>
        )
      })}
    </div>
  )
}
