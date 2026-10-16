import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePreferences } from '../context/Preferences'
import { repository, STORAGE_KEY } from '../storage/repository'
import type { MessageKey } from '../i18n/messages'
import type {
  Category,
  CategoryInput,
  MutationResult,
  Store,
  Transaction,
  TransactionInput,
} from '../types'

function nowIso(): string {
  return new Date().toISOString()
}

export function useFinance() {
  const { t } = usePreferences()
  const [store, setStore] = useState<Store>(() => repository.load())

  const commit = useCallback((change: (current: Store) => Store | MutationResult) => {
    const current = repository.load()
    const result = change(current)
    if ('ok' in result) return result
    repository.save(result)
    setStore(result)
    return { ok: true } as const
  }, [])

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setStore(repository.load())
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  const createCategory = useCallback(
    (input: CategoryInput): MutationResult => {
      const name = input.name.trim()
      if (!name) return { ok: false, message: t('errors.name') }
      return commit((current) => ({
        ...current,
        categories: [
          ...current.categories,
          {
            id: crypto.randomUUID(),
            name,
            type: input.type,
            color: input.color,
          },
        ],
      }))
    },
    [commit, t],
  )

  const updateCategory = useCallback(
    (id: string, input: CategoryInput): MutationResult => {
      const name = input.name.trim()
      if (!name) return { ok: false, message: t('errors.name') }
      return commit((current) => {
        const category = current.categories.find((item) => item.id === id)
        if (!category) return { ok: false, message: t('errors.categoryMissing') }
        if (input.type !== category.type) {
          const used = current.transactions.some((item) => item.categoryId === id)
          if (used) {
            return {
              ok: false,
              message: t('errors.typeLocked'),
            }
          }
        }
        return {
          ...current,
          categories: current.categories.map((item) =>
            item.id === id
              ? { ...item, name, type: input.type, color: input.color }
              : item,
          ),
        }
      })
    },
    [commit, t],
  )

  const deleteCategory = useCallback(
    (id: string): MutationResult => {
      return commit((current) => {
        const used = current.transactions.some((item) => item.categoryId === id)
        if (used) {
          return {
            ok: false,
            message: t('errors.categoryUsed'),
          }
        }
        return {
          ...current,
          categories: current.categories.filter((category) => category.id !== id),
        }
      })
    },
    [commit, t],
  )

  const createTransaction = useCallback(
    (input: TransactionInput): MutationResult => {
      return commit((current) => {
        const error = validateTransaction(input, current.categories)
        if (error) return { ok: false, message: t(error) }
        const timestamp = nowIso()
        const transaction: Transaction = {
          id: crypto.randomUUID(),
          type: input.type,
          amount: input.amount,
          categoryId: input.categoryId,
          date: input.date,
          note: input.note.trim(),
          createdAt: timestamp,
          updatedAt: timestamp,
        }
        return {
          ...current,
          transactions: [...current.transactions, transaction],
        }
      })
    },
    [commit, t],
  )

  const updateTransaction = useCallback(
    (id: string, input: TransactionInput): MutationResult => {
      return commit((current) => {
        const error = validateTransaction(input, current.categories)
        if (error) return { ok: false, message: t(error) }
        const existing = current.transactions.find((item) => item.id === id)
        if (!existing) return { ok: false, message: t('errors.transactionMissing') }
        return {
          ...current,
          transactions: current.transactions.map((item) =>
            item.id === id
              ? {
                  ...item,
                  type: input.type,
                  amount: input.amount,
                  categoryId: input.categoryId,
                  date: input.date,
                  note: input.note.trim(),
                  updatedAt: nowIso(),
                }
              : item,
          ),
        }
      })
    },
    [commit, t],
  )

  const deleteTransaction = useCallback(
    (id: string): MutationResult => {
      return commit((current) => ({
        ...current,
        transactions: current.transactions.filter((item) => item.id !== id),
      }))
    },
    [commit],
  )

  const categoriesById = useMemo(() => {
    return new Map(store.categories.map((category) => [category.id, category]))
  }, [store.categories])

  return {
    categories: store.categories,
    transactions: store.transactions,
    categoriesById,
    createCategory,
    updateCategory,
    deleteCategory,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  }
}

function validateTransaction(
  input: TransactionInput,
  categories: Category[],
): MessageKey | null {
  if (!Number.isInteger(input.amount) || input.amount <= 0) return 'errors.amount'
  if (!input.date) return 'errors.date'
  const category = categories.find((item) => item.id === input.categoryId)
  if (!category) return 'errors.pickCategory'
  if (category.type !== input.type) return 'errors.categoryType'
  return null
}
