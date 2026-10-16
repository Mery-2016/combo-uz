import { useMemo, useState } from 'react'
import { usePreferences } from '../context/Preferences'
import { categoryLabel } from '../i18n/messages'
import type { Category, Transaction, TransactionInput } from '../types'
import { currentMonthKey, formatDate, formatMonthLabel, monthKey } from '../lib/dates'
import { formatSum } from '../lib/format'
import { TransactionForm } from './TransactionForm'

interface TransactionsViewProps {
  categories: Category[]
  transactions: Transaction[]
  onCreate: (input: TransactionInput) => string | null
  onUpdate: (id: string, input: TransactionInput) => string | null
  onDelete: (id: string) => void
}

export function TransactionsView({
  categories,
  transactions,
  onCreate,
  onUpdate,
  onDelete,
}: TransactionsViewProps) {
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [month, setMonth] = useState(currentMonthKey())
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [creating, setCreating] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const { locale, t, numberLocale } = usePreferences()
  const money = (amount: number) => formatSum(amount, numberLocale, t('currency'))

  const months = useMemo(() => {
    const keys = new Set<string>([currentMonthKey()])
    for (const item of transactions) keys.add(monthKey(item.date))
    return [...keys].sort().reverse()
  }, [transactions])

  const visible = useMemo(() => {
    return transactions
      .filter((item) => (month === 'all' ? true : monthKey(item.date) === month))
      .filter((item) => (typeFilter === 'all' ? true : item.type === typeFilter))
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
  }, [month, transactions, typeFilter])

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(event.target.value as 'all' | 'income' | 'expense')
          }
          className="rounded-xl border border-line bg-card px-3 py-2 text-sm text-ink"
        >
          <option value="all">{t('filter.allTypes')}</option>
          <option value="income">{t('type.income')}</option>
          <option value="expense">{t('type.expense')}</option>
        </select>
        <select
          value={month}
          onChange={(event) => setMonth(event.target.value)}
          className="rounded-xl border border-line bg-card px-3 py-2 text-sm text-ink"
        >
          <option value="all">{t('filter.allMonths')}</option>
          {months.map((key) => (
            <option key={key} value={key}>
              {formatMonthLabel(key, numberLocale)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="btn-primary ml-auto rounded-xl px-4 py-2 text-sm font-semibold"
        >
          {t('add')}
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-line bg-card px-5 py-10 text-center text-sm text-muted">
          {t('emptyTransactions')}
        </p>
      ) : (
        <ul className="space-y-2">
          {visible.map((item) => {
            const category = categories.find((entry) => entry.id === item.categoryId)
            const income = item.type === 'income'
            return (
              <li
                key={item.id}
                className={`flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 shadow-sm ${
                  income ? 'row-income' : 'row-expense'
                }`}
              >
                <span
                  className="h-9 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: category?.color ?? '#64748b' }}
                />
                <div className="min-w-40 flex-1">
                  <p className="font-medium">
                    {category ? categoryLabel(category.name, locale) : t('uncategorized')}
                  </p>
                  <p className="text-sm text-muted">
                    {formatDate(item.date, numberLocale)}
                    {item.note ? ` · ${item.note}` : ''}
                  </p>
                </div>
                <p
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    income ? 'pill-income' : 'pill-expense'
                  }`}
                >
                  {income ? '+' : '−'}
                  {money(item.amount)}
                </p>
                <button
                  type="button"
                  onClick={() => setEditing(item)}
                  className="rounded-lg px-2 py-1 text-sm text-muted hover:bg-paper"
                >
                  {t('edit')}
                </button>
                {pendingDelete === item.id ? (
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(item.id)
                      setPendingDelete(null)
                    }}
                    className="rounded-lg bg-expense px-2 py-1 text-sm text-white"
                  >
                    {t('confirm')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPendingDelete(item.id)}
                    className="rounded-lg px-2 py-1 text-sm text-expense hover:bg-paper"
                  >
                    {t('delete')}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {creating ? (
        <TransactionForm
          categories={categories}
          onSubmit={(input) => onCreate(input)}
          onClose={() => setCreating(false)}
        />
      ) : null}
      {editing ? (
        <TransactionForm
          categories={categories}
          initial={editing}
          onSubmit={(input) => onUpdate(editing.id, input)}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </section>
  )
}
