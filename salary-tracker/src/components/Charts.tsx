import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { usePreferences } from '../context/Preferences'
import { formatSum } from '../lib/format'

interface MonthPoint {
  label: string
  income: number
  expense: number
}

interface Slice {
  name: string
  amount: number
  color: string
}

export function MonthlyChart({ data }: { data: MonthPoint[] }) {
  const { theme, t, numberLocale } = usePreferences()
  const axis = theme === 'dark' ? '#93c5fd' : '#0c4a6e'
  const grid = theme === 'dark' ? '#1e3a5f' : '#dbeafe'
  const money = (amount: number) => formatSum(amount, numberLocale, t('currency'))
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4}>
          <defs>
            <linearGradient id="incomeBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="expenseBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: axis, fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: axis, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={72}
            tickFormatter={(value: number) =>
              new Intl.NumberFormat('ru-RU', { notation: 'compact' }).format(value)
            }
          />
          <Tooltip
            formatter={(value, name) => [
              money(Number(value ?? 0)),
              name === 'income' ? t('chart.income') : t('chart.expense'),
            ]}
            contentStyle={{
              borderRadius: 12,
              borderColor: grid,
              background: theme === 'dark' ? '#0e1622' : '#ffffff',
              color: theme === 'dark' ? '#e7f3fc' : '#0b1220',
              fontSize: 13,
            }}
          />
          <Bar dataKey="income" fill="url(#incomeBar)" radius={[8, 8, 0, 0]} />
          <Bar dataKey="expense" fill="url(#expenseBar)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ExpensePie({ data }: { data: Slice[] }) {
  const { theme, t, numberLocale } = usePreferences()
  const money = (amount: number) => formatSum(amount, numberLocale, t('currency'))
  if (data.length === 0) {
    return (
      <p className="flex h-72 items-center justify-center text-sm text-muted">
        {t('chart.noExpenses')}
      </p>
    )
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="amount" nameKey="name" innerRadius={58} outerRadius={100} paddingAngle={4} stroke="#fff" strokeWidth={3}>
            {data.map((slice) => (
              <Cell key={slice.name} fill={slice.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [money(Number(value ?? 0)), String(name)]}
            contentStyle={{
              borderRadius: 12,
              borderColor: theme === 'dark' ? '#1e3a5f' : '#dbeafe',
              background: theme === 'dark' ? '#0e1622' : '#ffffff',
              color: theme === 'dark' ? '#e7f3fc' : '#0b1220',
              fontSize: 13,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
