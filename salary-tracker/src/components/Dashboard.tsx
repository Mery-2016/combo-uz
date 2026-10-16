import { useMemo, useState } from 'react'
import { usePreferences } from '../context/Preferences'
import { categoryLabel } from '../i18n/messages'
import type { Category, EntryType, Transaction, TransactionInput } from '../types'
import { currentMonthKey, formatMonthLabel, monthKey, recentMonthKeys } from '../lib/dates'
import { formatSum } from '../lib/format'
import { ExpensePie, MonthlyChart } from './Charts'
import { TransactionForm } from './TransactionForm'

interface DashboardProps {
  categories: Category[]
  transactions: Transaction[]
  onCreate: (input: TransactionInput) => string | null
}

export function Dashboard({ categories, transactions, onCreate }: DashboardProps) {
  const { locale, t, numberLocale } = usePreferences()
  const [period, setPeriod] = useState(currentMonthKey())
  const [open, setOpen] = useState(false)
  const money = (amount: number) => formatSum(amount, numberLocale, t('currency'))

  const months = useMemo(() => {
    const keys = new Set(recentMonthKeys(6))
    for (const item of transactions) keys.add(monthKey(item.date))
    return [...keys].sort()
  }, [transactions])

  const periodItems = useMemo(() => {
    if (period === 'all') return transactions
    return transactions.filter((item) => monthKey(item.date) === period)
  }, [period, transactions])

  const totals = useMemo(() => sumByType(periodItems), [periodItems])

  const monthly = useMemo(() => {
    return recentMonthKeys(6).map((key) => {
      const items = transactions.filter((item) => monthKey(item.date) === key)
      const sums = sumByType(items)
      return {
        label: formatMonthLabel(key, numberLocale).replace('.', ''),
        income: sums.income,
        expense: sums.expense,
      }
    })
  }, [numberLocale, transactions])

  const slices = useMemo(() => {
    const totalsByCategory = new Map<string, number>()
    for (const item of periodItems) {
      if (item.type !== 'expense') continue
      totalsByCategory.set(
        item.categoryId,
        (totalsByCategory.get(item.categoryId) ?? 0) + item.amount,
      )
    }
    return [...totalsByCategory.entries()]
      .map(([id, amount]) => {
        const category = categories.find((item) => item.id === id)
        return {
          name: category ? categoryLabel(category.name, locale) : t('uncategorized'),
          amount,
          color: category?.color ?? '#64748b',
        }
      })
      .sort((a, b) => b.amount - a.amount)
  }, [categories, locale, periodItems, t])

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="text-sm text-muted">
          {t('period')}
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="ml-2 rounded-xl border border-line bg-card px-3 py-2 text-ink shadow-sm"
          >
            <option value="all">{t('period.all')}</option>
            {[...months].reverse().map((key) => (
              <option key={key} value={key}>
                {formatMonthLabel(key, numberLocale)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold"
        >
          {t('addTransaction')}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Summary label={t('income')} value={money(totals.income)} tone="income" />
        <Summary label={t('expense')} value={money(totals.expense)} tone="expense" />
        <Summary label={t('balance')} value={money(totals.income - totals.expense)} tone="balance" />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <article className="panel-bars rounded-3xl p-5 shadow-lg shadow-sky-900/10 lg:col-span-3">
          <h2 className="mb-4 font-display text-xl">{t('chart.monthly')}</h2>
          <MonthlyChart data={monthly} />
        </article>
        <article className="panel-pie rounded-3xl p-5 shadow-lg shadow-blue-900/10 lg:col-span-2">
          <h2 className="mb-1 font-display text-xl">{t('chart.byCategory')}</h2>
          <p className="mb-2 text-sm text-muted">{t('chart.periodHint')}</p>
          <ExpensePie data={slices} />
          <ul className="space-y-2">
            {slices.map((slice) => (
              <li key={slice.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: slice.color }}
                  />
                  {slice.name}
                </span>
                <span className="font-medium">{money(slice.amount)}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      {open ? (
        <TransactionForm
          categories={categories}
          onSubmit={(input) => onCreate(input)}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </section>
  )
}

function Summary({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'income' | 'expense' | 'balance'
}) {
  const surface =
    tone === 'income' ? 'card-income' : tone === 'expense' ? 'card-expense' : 'card-balance'
  return (
    <article className={`rounded-3xl p-5 shadow-lg ${surface}`}>
      <p className="text-sm text-white/80">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
    </article>
  )
}

function sumByType(items: Transaction[]): Record<EntryType, number> {
  return items.reduce(
    (acc, item) => {
      acc[item.type] += item.amount
      return acc
    },
    { income: 0, expense: 0 },
  )
}
