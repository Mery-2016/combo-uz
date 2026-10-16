import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { intlLocale, translate, type Locale, type MessageKey } from '../i18n/messages'

export type Theme = 'light' | 'dark'

interface Preferences {
  locale: Locale
  theme: Theme
  setLocale: (locale: Locale) => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  t: (key: MessageKey) => string
  numberLocale: string
}

const STORAGE_KEY = 'salary-tracker.preferences'

const PreferencesContext = createContext<Preferences | null>(null)

function readPreferences(): { locale: Locale; theme: Theme } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { locale: 'ru', theme: 'light' }
    const parsed = JSON.parse(raw) as { locale?: Locale; theme?: Theme }
    return {
      locale: parsed.locale === 'uz' ? 'uz' : 'ru',
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
    }
  } catch {
    return { locale: 'ru', theme: 'light' }
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => readPreferences().locale)
  const [theme, setTheme] = useState<Theme>(() => readPreferences().theme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.lang = locale === 'uz' ? 'uz' : 'ru'
    document.title = translate(locale, 'app.title')
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ locale, theme }))
  }, [locale, theme])

  const value = useMemo<Preferences>(
    () => ({
      locale,
      theme,
      setLocale,
      setTheme,
      toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
      t: (key) => translate(locale, key),
      numberLocale: intlLocale(locale),
    }),
    [locale, theme],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences(): Preferences {
  const value = useContext(PreferencesContext)
  if (!value) throw new Error('usePreferences must be used within PreferencesProvider')
  return value
}
