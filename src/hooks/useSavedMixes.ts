import { useState, useCallback } from 'react'
import type { SavedMix } from '../types'

const STORAGE_KEY = 'lofi-mixer-v1-mixes'

function loadFromStorage(): SavedMix[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavedMix[]) : []
  } catch {
    return []
  }
}

function persist(mixes: SavedMix[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mixes))
  } catch {
    // storage full or unavailable
  }
}

export function useSavedMixes() {
  const [mixes, setMixes] = useState<SavedMix[]>(loadFromStorage)

  const saveMix = useCallback((data: Omit<SavedMix, 'id' | 'createdAt'>): SavedMix => {
    const mix: SavedMix = {
      ...data,
      id: `mix-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    }
    setMixes((prev) => {
      const updated = [mix, ...prev]
      persist(updated)
      return updated
    })
    return mix
  }, [])

  const deleteMix = useCallback((id: string) => {
    setMixes((prev) => {
      const updated = prev.filter((m) => m.id !== id)
      persist(updated)
      return updated
    })
  }, [])

  const renameMix = useCallback((id: string, name: string) => {
    setMixes((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, name } : m))
      persist(updated)
      return updated
    })
  }, [])

  return { mixes, saveMix, deleteMix, renameMix }
}
