import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { usePreferences } from '../context/Preferences'
import { categoryLabel } from '../i18n/messages'
import type { Category, EntryType, Transaction, TransactionInput } from '../types'
import { todayIso } from '../lib/dates'

interface TransactionFormProps {
  categories: Category[]
  initial?: Transaction | null
  presetType?: EntryType
  onSubmit: (input: TransactionInput) => string | null
  onClose: () => void
}

export function TransactionForm({
  categories,
  initial,
  presetType = 'expense',
  onSubmit,
  onClose,
}: TransactionFormProps) {
  const [type, setType] = useState<EntryType>(initial?.type ?? presetType)
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '')
  const [date, setDate] = useState(initial?.date ?? todayIso())
  const [note, setNote] = useState(initial?.note ?? '')
  const [error, setError] = useState<string | null>(null)
  const { locale, t } = usePreferences()

  const options = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type],
  )

  useEffect(() => {
    if (!options.some((category) => category.id === categoryId)) {
      setCategoryId(options[0]?.id ?? '')
    }
  }, [options, categoryId])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const parsed = Number(amount.replace(/\s/g, ''))
    const message = onSubmit({
      type,
      amount: parsed,
      categoryId,
      date,
      note,
    })
    setError(message)
    if (!message) onClose()
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-card p-6 shadow-xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-sky-600 uppercase">
              {t('operation')}
            </p>
            <h2 className="font-display text-2xl">
              {initial ? t('edit') : t('newEntry')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm text-muted hover:bg-paper"
          >
            {t('close')}
          </button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-paper p-1">
          {(['income', 'expense'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setType(value)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                type === value
                  ? value === 'income'
                    ? 'bg-income text-white'
                    : 'bg-expense text-white'
                  : 'text-muted'
              }`}
            >
              {value === 'income' ? t('type.income') : t('type.expense')}
            </button>
          ))}
        </div>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-muted">{t('amount')}</span>
          <input
            inputMode="numeric"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0"
            className="w-full rounded-xl border border-line bg-card px-3 py-2 text-ink outline-none focus:border-sky-500"
          />
        </label>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-muted">{t('category')}</span>
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="w-full rounded-xl border border-line bg-card px-3 py-2 text-ink outline-none focus:border-sky-500"
          >
            {options.length === 0 ? (
              <option value="">{t('noCategories')}</option>
            ) : (
              options.map((category) => (
                <option key={category.id} value={category.id}>
                  {categoryLabel(category.name, locale)}
                </option>
              ))
            )}
          </select>
        </label>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-muted">{t('date')}</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full rounded-xl border border-line bg-card px-3 py-2 text-ink outline-none focus:border-sky-500"
          />
        </label>

        <label className="mb-4 block text-sm">
          <span className="mb-1 block text-muted">{t('note')}</span>
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t('notePlaceholder')}
            className="w-full rounded-xl border border-line bg-card px-3 py-2 text-ink outline-none focus:border-sky-500"
          />
        </label>

        {error ? <p className="mb-3 text-sm text-expense">{error}</p> : null}

        <button
          type="submit"
          className="btn-primary w-full rounded-xl px-4 py-2.5 text-sm font-semibold"
        >
          {initial ? t('save') : t('add')}
        </button>
      </form>
    </div>
  )
}
