import { useState } from 'react'
import { CategoriesView } from './components/CategoriesView'
import { Dashboard } from './components/Dashboard'
import { TransactionsView } from './components/TransactionsView'
import { usePreferences, type Theme } from './context/Preferences'
import { useFinance } from './hooks/useFinance'
import type { Locale } from './i18n/messages'

type Tab = 'dashboard' | 'transactions' | 'categories'

const TABS: { id: Tab; label: 'tab.dashboard' | 'tab.transactions' | 'tab.categories' }[] = [
  { id: 'dashboard', label: 'tab.dashboard' },
  { id: 'transactions', label: 'tab.transactions' },
  { id: 'categories', label: 'tab.categories' },
]

export default function App() {
  const finance = useFinance()
  const { locale, theme, setLocale, toggleTheme, t } = usePreferences()
  const [tab, setTab] = useState<Tab>('dashboard')

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-sky-600 uppercase">
            {t('app.kicker')}
          </p>
          <h1 className="title-gradient font-display text-4xl leading-tight">{t('app.title')}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-2xl bg-card p-1 ring-1 ring-line">
            {(['ru', 'uz'] as Locale[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLocale(code)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                  locale === code ? 'bg-sky-600 text-white' : 'text-muted'
                }`}
              >
                {t(code === 'ru' ? 'lang.ru' : 'lang.uz')}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-2xl border border-sky-500 bg-card px-3 py-2 text-sm font-semibold text-ink"
          >
            {themeLabel(theme, t)}
          </button>
          <nav className="flex gap-1 rounded-2xl bg-card p-1 shadow-lg shadow-sky-900/10 ring-1 ring-line">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                  tab === item.id ? 'tab-active' : 'text-muted hover:bg-paper'
                }`}
              >
                {t(item.label)}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {tab === 'dashboard' ? (
        <Dashboard
          categories={finance.categories}
          transactions={finance.transactions}
          onCreate={(input) => {
            const result = finance.createTransaction(input)
            return result.ok ? null : result.message
          }}
        />
      ) : null}

      {tab === 'transactions' ? (
        <TransactionsView
          categories={finance.categories}
          transactions={finance.transactions}
          onCreate={(input) => {
            const result = finance.createTransaction(input)
            return result.ok ? null : result.message
          }}
          onUpdate={(id, input) => {
            const result = finance.updateTransaction(id, input)
            return result.ok ? null : result.message
          }}
          onDelete={(id) => {
            finance.deleteTransaction(id)
          }}
        />
      ) : null}

      {tab === 'categories' ? (
        <CategoriesView
          categories={finance.categories}
          onCreate={(input) => {
            const result = finance.createCategory(input)
            return result.ok ? null : result.message
          }}
          onUpdate={(id, input) => {
            const result = finance.updateCategory(id, input)
            return result.ok ? null : result.message
          }}
          onDelete={(id) => {
            const result = finance.deleteCategory(id)
            return result.ok ? null : result.message
          }}
        />
      ) : null}
    </div>
  )
}

function themeLabel(theme: Theme, t: (key: 'theme.light' | 'theme.dark') => string): string {
  return theme === 'dark' ? t('theme.light') : t('theme.dark')
}
