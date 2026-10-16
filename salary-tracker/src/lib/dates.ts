export function todayIso(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function monthKey(date: string): string {
  return date.slice(0, 7)
}

export function currentMonthKey(): string {
  return monthKey(todayIso())
}

const UZ_MONTHS = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
]

const UZ_MONTHS_SHORT = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek']

export function formatMonthLabel(key: string, numberLocale: string): string {
  const [year, month] = key.split('-').map(Number)
  if (numberLocale.startsWith('uz')) return `${UZ_MONTHS_SHORT[month - 1]} ${year}`
  return new Intl.DateTimeFormat(numberLocale, {
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1))
}

export function formatDate(date: string, numberLocale: string): string {
  const [year, month, day] = date.split('-').map(Number)
  if (numberLocale.startsWith('uz')) return `${day} ${UZ_MONTHS[month - 1]} ${year}`
  return new Intl.DateTimeFormat(numberLocale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

export function recentMonthKeys(count: number, from = new Date()): string[] {
  const keys: string[] = []
  const cursor = new Date(from.getFullYear(), from.getMonth(), 1)
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    keys.push(`${date.getFullYear()}-${month}`)
  }
  return keys
}

export function shiftMonth(key: string, delta: number): string {
  const [year, month] = key.split('-').map(Number)
  const date = new Date(year, month - 1 + delta, 1)
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0')
  return `${date.getFullYear()}-${nextMonth}`
}
