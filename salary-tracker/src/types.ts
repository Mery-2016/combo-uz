export type EntryType = 'income' | 'expense'

export interface Category {
  id: string
  name: string
  type: EntryType
  color: string
}

export interface Transaction {
  id: string
  type: EntryType
  amount: number
  categoryId: string
  date: string
  note: string
  createdAt: string
  updatedAt: string
}

export interface Store {
  categories: Category[]
  transactions: Transaction[]
}

export interface CategoryInput {
  name: string
  type: EntryType
  color: string
}

export interface TransactionInput {
  type: EntryType
  amount: number
  categoryId: string
  date: string
  note: string
}

export type MutationResult = { ok: true } | { ok: false; message: string }
