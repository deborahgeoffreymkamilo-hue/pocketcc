// Currency Conversion Rates (Base: TZS)
export const EXCHANGE_RATES = {
  TZS: 1,
  USD: 2600,
  EUR: 2800,
  KES: 20,
  UGX: 0.70,
  GBP: 3300
}

export const convertCurrency = (amount, from = 'TZS', to = 'TZS') => {
  if (!amount || from === to) return Number(amount || 0)
  // Convert from source to TZS, then TZS to target
  const inTZS = Number(amount) * (EXCHANGE_RATES[from] || 1)
  const targetRate = EXCHANGE_RATES[to] || 1
  return inTZS / targetRate
}

// Format currency
export const formatCurrency = (amount, currency = 'TZS') => {
  if (amount === null || amount === undefined) return '0'
  const num = Number(amount)
  
  if (currency === 'TZS') {
    return `TSh ${Math.round(num).toLocaleString('en-US')}`
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2
  }).format(num)
}

// Format date
export const formatDate = (date, format = 'medium') => {
  if (!date) return ''
  const d = new Date(date)
  
  const formats = {
    short: { month: 'short', day: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' },
    monthYear: { month: 'long', year: 'numeric' },
    dayMonth: { day: 'numeric', month: 'short' }
  }
  
  return d.toLocaleDateString('en-US', formats[format] || formats.medium)
}

// Format relative time
export const formatRelativeTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(date, 'short')
}

// Get current month string (YYYY-MM)
export const getCurrentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// Get date range for a month
export const getMonthDateRange = (monthStr) => {
  const [year, month] = monthStr.split('-').map(Number)
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDay = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`
  return { startDate, endDate }
}

// Calculate days until a date
export const daysUntil = (date) => {
  if (!date) return null
  const target = new Date(date)
  const now = new Date()
  const diff = target - now
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// Calculate monthly contribution needed for a goal
export const calculateMonthlyContribution = (targetAmount, currentAmount, targetDate) => {
  if (!targetDate) return null
  const remaining = targetAmount - currentAmount
  if (remaining <= 0) return 0
  const months = Math.ceil(daysUntil(targetDate) / 30)
  if (months <= 0) return remaining
  return Math.ceil(remaining / months)
}

// Get color for a value (positive = green, negative = red)
export const getValueColor = (value, inverse = false) => {
  if (value === 0) return 'text-gray-400'
  if (value > 0) return inverse ? 'text-red-400' : 'text-green-400'
  return inverse ? 'text-green-400' : 'text-red-400'
}

// Get progress color
export const getProgressColor = (percentage) => {
  if (percentage >= 100) return '#EF4444'
  if (percentage >= 80) return '#F97316'
  if (percentage >= 60) return '#EAB308'
  return '#8B5CF6'
}

// Calculate health score
export const calculateHealthScore = ({ savingsRate, hasEmergencyFund, hasActiveBudget, debtRatio, budgetAdherence }) => {
  let score = 0
  
  // Savings rate (30 points)
  if (savingsRate >= 20) score += 30
  else if (savingsRate >= 10) score += 20
  else if (savingsRate > 0) score += 10

  // Emergency fund (20 points)
  if (hasEmergencyFund) score += 20

  // Active budget (20 points)
  if (hasActiveBudget) score += 20

  // Budget adherence (20 points)
  if (budgetAdherence >= 90) score += 20
  else if (budgetAdherence >= 70) score += 14
  else if (budgetAdherence >= 50) score += 8

  // Debt ratio (10 points)
  if (debtRatio === 0) score += 10
  else if (debtRatio < 0.3) score += 7
  else if (debtRatio < 0.5) score += 4

  return Math.min(score, 100)
}

// Type colors and icons
export const TRANSACTION_TYPES = {
  income: { color: 'text-green-400', bg: 'bg-green-400/10', label: 'Income', sign: '+' },
  expense: { color: 'text-red-400', bg: 'bg-red-400/10', label: 'Expense', sign: '-' },
  transfer: { color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Transfer', sign: '↔' }
}

export const ACCOUNT_TYPES = {
  cash: { label: 'Cash', icon: 'banknote' },
  bank: { label: 'Bank Account', icon: 'building-2' },
  mobile_money: { label: 'Mobile Money', icon: 'smartphone' },
  card: { label: 'Card', icon: 'credit-card' },
  crypto: { label: 'Crypto', icon: 'bitcoin' },
  other: { label: 'Other', icon: 'wallet' }
}

export const CURRENCIES = [
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
]

export const NEON_COLORS = [
  '#8B5CF6', '#EC4899', '#06B6D4', '#10B981',
  '#F59E0B', '#EF4444', '#3B82F6', '#A78BFA',
  '#34D399', '#F472B6', '#60A5FA', '#FBBF24'
]
