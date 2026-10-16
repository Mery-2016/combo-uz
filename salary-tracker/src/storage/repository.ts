import type { Category, Store } from '../types'

export const STORAGE_KEY = 'salary-tracker.v1'

const SEED_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Зарплата', type: 'income', color: '#0284c7' },
  { name: 'Подработка', type: 'income', color: '#38bdf8' },
  { name: 'Продукты', type: 'expense', color: '#1d4ed8' },
  { name: 'Транспорт', type: 'expense', color: '#2563eb' },
  { name: 'Жильё', type: 'expense', color: '#0ea5e9' },
  { name: 'Прочее', type: 'expense', color: '#1e3a8a' },
]

function seedStore(): Store {
  return {
    categories: SEED_CATEGORIES.map((category) => ({
      ...category,
      id: crypto.randomUUID(),
    })),
    transactions: [],
  }
}

const BRIGHTER_COLORS: Record<string, string> = {
  '#1f7a4d': '#0284c7',
  '#0f766e': '#38bdf8',
  '#c45c26': '#1d4ed8',
  '#1d4e89': '#2563eb',
  '#6d28d9': '#0ea5e9',
  '#64748b': '#1e3a8a',
  '#10b981': '#0284c7',
  '#14b8a6': '#38bdf8',
  '#f97316': '#1d4ed8',
  '#3b82f6': '#2563eb',
  '#8b5cf6': '#0ea5e9',
  '#ec4899': '#1e3a8a',
}

function brightenSeedColors(store: Store): Store {
  let changed = false
  const categories = store.categories.map((category) => {
    const next = BRIGHTER_COLORS[category.color.toLowerCase()]
    if (!next) return category
    changed = true
    return { ...category, color: next }
  })
  return changed ? { ...store, categories } : store
}

function isStore(value: unknown): value is Store {
  if (!value || typeof value !== 'object') return false
  const record = value as Store
  return Array.isArray(record.categories) && Array.isArray(record.transactions)
}

export const repository = {
  load(): Store {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        const seeded = seedStore()
        this.save(seeded)
        return seeded
      }
      const parsed: unknown = JSON.parse(raw)
      if (!isStore(parsed)) {
        const seeded = seedStore()
        this.save(seeded)
        return seeded
      }
      const brightened = brightenSeedColors(parsed)
      if (brightened !== parsed) this.save(brightened)
      return brightened
    } catch {
      const seeded = seedStore()
      this.save(seeded)
      return seeded
    }
  },

  save(store: Store): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  },
}
