import { useState, type FormEvent } from 'react'
import { usePreferences } from '../context/Preferences'
import { categoryLabel } from '../i18n/messages'
import type { Category, CategoryInput, EntryType } from '../types'

const PALETTE = ['#38bdf8', '#0284c7', '#2563eb', '#1d4ed8', '#1e3a8a', '#0ea5e9', '#0369a1', '#0b1220']

interface CategoriesViewProps {
  categories: Category[]
  onCreate: (input: CategoryInput) => string | null
  onUpdate: (id: string, input: CategoryInput) => string | null
  onDelete: (id: string) => string | null
}

export function CategoriesView({
  categories,
  onCreate,
  onUpdate,
  onDelete,
}: CategoriesViewProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<EntryType>('expense')
  const [color, setColor] = useState(PALETTE[2])
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftType, setDraftType] = useState<EntryType>('expense')
  const [draftColor, setDraftColor] = useState(PALETTE[0])
  const { locale, t } = usePreferences()

  function handleCreate(event: FormEvent) {
    event.preventDefault()
    const message = onCreate({ name, type, color })
    setError(message)
    if (!message) setName('')
  }

  function startEdit(category: Category) {
    setEditingId(category.id)
    setDraftName(categoryLabel(category.name, locale))
    setDraftType(category.type)
    setDraftColor(category.color)
    setError(null)
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <form onSubmit={handleCreate} className="h-fit rounded-3xl border border-line bg-card p-5">
        <h2 className="font-display text-xl">{t('newCategory')}</h2>
        <label className="mt-4 block text-sm">
          <span className="mb-1 block text-muted">{t('name')}</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-xl border border-line bg-card px-3 py-2 text-ink outline-none focus:border-sky-500"
          />
        </label>
        <label className="mt-3 block text-sm">
          <span className="mb-1 block text-muted">{t('kind')}</span>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as EntryType)}
            className="w-full rounded-xl border border-line bg-card px-3 py-2 text-ink"
          >
            <option value="income">{t('type.income')}</option>
            <option value="expense">{t('type.expense')}</option>
          </select>
        </label>
        <div className="mt-3">
          <p className="mb-2 text-sm text-muted">{t('color')}</p>
          <div className="flex flex-wrap gap-2">
            {PALETTE.map((swatch) => (
              <button
                key={swatch}
                type="button"
                aria-label={swatch}
                onClick={() => setColor(swatch)}
                className={`h-7 w-7 rounded-full ${color === swatch ? 'ring-2 ring-ink ring-offset-2' : ''}`}
                style={{ backgroundColor: swatch }}
              />
            ))}
          </div>
        </div>
        {error && !editingId ? <p className="mt-3 text-sm text-expense">{error}</p> : null}
        <button
          type="submit"
          className="btn-primary mt-4 w-full rounded-xl px-4 py-2 text-sm font-semibold"
        >
          {t('add')}
        </button>
      </form>

      <div className="space-y-6">
        {(['income', 'expense'] as const).map((entryType) => (
          <div key={entryType}>
            <h2 className="mb-2 font-display text-xl">
              {entryType === 'income' ? t('income') : t('expense')}
            </h2>
            <ul className="space-y-2">
              {categories
                .filter((category) => category.type === entryType)
                .map((category) => (
                  <li
                    key={category.id}
                    className="rounded-2xl border border-white bg-white/80 px-4 py-3 shadow-sm"
                    style={{ boxShadow: `inset 4px 0 0 ${category.color}` }}
                  >
                    {editingId === category.id ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          value={draftName}
                          onChange={(event) => setDraftName(event.target.value)}
                          className="min-w-40 flex-1 rounded-xl border border-line bg-card px-3 py-2 text-sm text-ink"
                        />
                        <select
                          value={draftType}
                          onChange={(event) =>
                            setDraftType(event.target.value as EntryType)
                          }
                          className="rounded-xl border border-line bg-card px-2 py-2 text-sm text-ink"
                        >
                          <option value="income">{t('type.income')}</option>
                          <option value="expense">{t('type.expense')}</option>
                        </select>
                        <input
                          type="color"
                          value={draftColor}
                          onChange={(event) => setDraftColor(event.target.value)}
                          aria-label="Цвет"
                          className="h-9 w-12 cursor-pointer rounded-lg border border-line bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const unchanged = draftName === categoryLabel(category.name, locale)
                            const message = onUpdate(category.id, {
                              name: unchanged ? category.name : draftName,
                              type: draftType,
                              color: draftColor,
                            })
                            setError(message)
                            if (!message) setEditingId(null)
                          }}
                          className="btn-primary rounded-lg px-3 py-2 text-sm"
                        >
                          {t('save')}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="flex-1 font-medium">
                          {categoryLabel(category.name, locale)}
                        </span>
                        <button
                          type="button"
                          onClick={() => startEdit(category)}
                          className="rounded-lg px-2 py-1 text-sm text-muted hover:bg-paper"
                        >
                          {t('edit')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setError(onDelete(category.id))}
                          className="rounded-lg px-2 py-1 text-sm text-expense hover:bg-paper"
                        >
                          {t('delete')}
                        </button>
                      </div>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        ))}
        {error && editingId ? <p className="text-sm text-expense">{error}</p> : null}
      </div>
    </section>
  )
}
