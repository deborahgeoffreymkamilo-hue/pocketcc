import { supabase, isSupabaseConfigured } from '../lib/supabase'

// ======================== LOCAL STORAGE MOCK DATABASE ========================
// Used when Supabase credentials are not configured yet, providing a 100% functional experience

const INITIAL_MOCK_ACCOUNTS = [
  { id: 'acc-1', user_id: 'demo-user', name: 'Vodacom M-Pesa', type: 'mobile_money', provider: 'M-Pesa', balance: 450000, color: '#EF4444', currency: 'TZS', is_default: true, is_archived: false },
  { id: 'acc-2', user_id: 'demo-user', name: 'CRDB Bank', type: 'bank', provider: 'CRDB Bank', balance: 1250000, color: '#10B981', currency: 'TZS', is_default: false, is_archived: false },
  { id: 'acc-3', user_id: 'demo-user', name: 'Physical Cash', type: 'cash', provider: 'Cash', balance: 85000, color: '#06B6D4', currency: 'TZS', is_default: false, is_archived: false },
]

const INITIAL_MOCK_CATEGORIES = [
  { id: 'cat-1', name: 'Salary', type: 'income', icon: 'briefcase', color: '#10B981', is_default: true },
  { id: 'cat-2', name: 'Business', type: 'income', icon: 'trending-up', color: '#10B981', is_default: true },
  { id: 'cat-3', name: 'Food & Dining', type: 'expense', icon: 'utensils', color: '#EF4444', is_default: true },
  { id: 'cat-4', name: 'Transport', type: 'expense', icon: 'car', color: '#F97316', is_default: true },
  { id: 'cat-5', name: 'Rent & Housing', type: 'expense', icon: 'home', color: '#EAB308', is_default: true },
  { id: 'cat-6', name: 'Airtime & Data', type: 'expense', icon: 'smartphone', color: '#22C55E', is_default: true },
  { id: 'cat-7', name: 'Entertainment', type: 'expense', icon: 'tv', color: '#A78BFA', is_default: true },
  { id: 'cat-8', name: 'Shopping', type: 'expense', icon: 'shopping-bag', color: '#06B6D4', is_default: true },
]

const INITIAL_MOCK_TRANSACTIONS = [
  { id: 'tx-1', user_id: 'demo-user', type: 'income', amount: 1500000, description: 'Monthly Salary - Tech Consulting', payment_method: 'Bank Transfer', transaction_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString().split('T')[0], category_id: 'cat-1', account_id: 'acc-2', categories: INITIAL_MOCK_CATEGORIES[0], accounts: INITIAL_MOCK_ACCOUNTS[1] },
  { id: 'tx-2', user_id: 'demo-user', type: 'expense', amount: 450000, description: 'Apartment Monthly Rent', payment_method: 'Bank Transfer', transaction_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0], category_id: 'cat-5', account_id: 'acc-2', categories: INITIAL_MOCK_CATEGORIES[4], accounts: INITIAL_MOCK_ACCOUNTS[1] },
  { id: 'tx-3', user_id: 'demo-user', type: 'expense', amount: 35000, description: 'Monthly Data Bundle (Vodacom)', payment_method: 'M-Pesa', transaction_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString().split('T')[0], category_id: 'cat-6', account_id: 'acc-1', categories: INITIAL_MOCK_CATEGORIES[5], accounts: INITIAL_MOCK_ACCOUNTS[0] },
  { id: 'tx-4', user_id: 'demo-user', type: 'expense', amount: 25000, description: 'Lunch with colleagues', payment_method: 'M-Pesa', transaction_date: new Date().toISOString().split('T')[0], category_id: 'cat-3', account_id: 'acc-1', categories: INITIAL_MOCK_CATEGORIES[2], accounts: INITIAL_MOCK_ACCOUNTS[0] }
]

const INITIAL_MOCK_GOALS = [
  { id: 'goal-1', user_id: 'demo-user', name: 'Emergency Fund', description: '3-6 months essential expenses safety net', target_amount: 3000000, current_amount: 1500000, target_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120).toISOString().split('T')[0], color: '#10B981', status: 'active' },
  { id: 'goal-2', user_id: 'demo-user', name: 'MacBook Pro M3', description: 'Workstation upgrade', target_amount: 4500000, current_amount: 1800000, target_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString().split('T')[0], color: '#8B5CF6', status: 'active' }
]

const INITIAL_MOCK_RECURRING = [
  { id: 'rec-1', user_id: 'demo-user', name: 'Fiber Internet (SimbaNET)', type: 'expense', amount: 60000, frequency: 'monthly', next_due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString().split('T')[0], is_active: true }
]

const INITIAL_MOCK_DEBTS = [
  { id: 'debt-1', user_id: 'demo-user', name: 'Laptop Loan - CRDB', type: 'loan', original_amount: 1000000, remaining_amount: 350000, due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString().split('T')[0], description: 'Monthly direct deduction', is_settled: false }
]

const getMock = (key, initial) => {
  try {
    const raw = localStorage.getItem(`pocket_${key}`)
    return raw ? JSON.parse(raw) : initial
  } catch {
    return initial
  }
}

const setMock = (key, val) => {
  try {
    localStorage.setItem(`pocket_${key}`, JSON.stringify(val))
  } catch {}
}

// ======================== TRANSACTIONS ========================

export const getTransactions = async ({ userId, limit = 50, offset = 0, type, categoryId, accountId, startDate, endDate, search } = {}) => {
  if (!isSupabaseConfigured) {
    let list = getMock('transactions', INITIAL_MOCK_TRANSACTIONS)
    if (type) list = list.filter(t => t.type === type)
    if (categoryId) list = list.filter(t => t.category_id === categoryId)
    if (accountId) list = list.filter(t => t.account_id === accountId)
    if (startDate) list = list.filter(t => t.transaction_date >= startDate)
    if (endDate) list = list.filter(t => t.transaction_date <= endDate)
    if (search) list = list.filter(t => t.description?.toLowerCase().includes(search.toLowerCase()))
    return { data: list.slice(offset, offset + limit), error: null }
  }

  let query = supabase
    .from('transactions')
    .select(`
      *,
      categories(id, name, icon, color),
      accounts!transactions_account_id_fkey(id, name, type, color),
      to_account:accounts!transactions_to_account_id_fkey(id, name, type)
    `)
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (type) query = query.eq('type', type)
  if (categoryId) query = query.eq('category_id', categoryId)
  if (accountId) query = query.eq('account_id', accountId)
  if (startDate) query = query.gte('transaction_date', startDate)
  if (endDate) query = query.lte('transaction_date', endDate)
  if (search) query = query.ilike('description', `%${search}%`)

  return query
}

export const addTransaction = async (transaction) => {
  if (!isSupabaseConfigured) {
    const list = getMock('transactions', INITIAL_MOCK_TRANSACTIONS)
    const newTx = { ...transaction, id: `tx-${Date.now()}`, created_at: new Date().toISOString() }
    list.unshift(newTx)
    setMock('transactions', list)

    // Update account balance
    const accounts = getMock('accounts', INITIAL_MOCK_ACCOUNTS)
    const targetAcc = accounts.find(a => a.id === transaction.account_id)
    if (targetAcc) {
      if (transaction.type === 'income') targetAcc.balance += Number(transaction.amount)
      if (transaction.type === 'expense') targetAcc.balance -= Number(transaction.amount)
      setMock('accounts', accounts)
    }
    return { data: newTx, error: null }
  }

  return supabase.from('transactions').insert(transaction).select(`
    *,
    categories(id, name, icon, color),
    accounts!transactions_account_id_fkey(id, name, type, color)
  `).single()
}

export const updateTransaction = async (id, updates) => {
  if (!isSupabaseConfigured) {
    let list = getMock('transactions', INITIAL_MOCK_TRANSACTIONS)
    list = list.map(t => t.id === id ? { ...t, ...updates } : t)
    setMock('transactions', list)
    return { data: updates, error: null }
  }
  return supabase.from('transactions').update(updates).eq('id', id).select().single()
}

export const deleteTransaction = async (id) => {
  if (!isSupabaseConfigured) {
    let list = getMock('transactions', INITIAL_MOCK_TRANSACTIONS)
    list = list.filter(t => t.id !== id)
    setMock('transactions', list)
    return { error: null }
  }
  return supabase.from('transactions').delete().eq('id', id)
}

export const getMonthlyStats = async (userId, month) => {
  const startDate = `${month}-01`
  const endDate = new Date(month.split('-')[0], month.split('-')[1], 0).toISOString().split('T')[0]

  if (!isSupabaseConfigured) {
    const list = getMock('transactions', INITIAL_MOCK_TRANSACTIONS)
      .filter(t => t.transaction_date >= startDate && t.transaction_date <= endDate && t.type !== 'transfer')
    const income = list.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
    const expenses = list.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
    return {
      data: {
        income,
        expenses,
        saved: income - expenses,
        savingsRate: income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0
      }
    }
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('type, amount')
    .eq('user_id', userId)
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)
    .neq('type', 'transfer')

  if (error) return { error }

  const income = data.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expenses = data.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  return {
    data: {
      income,
      expenses,
      saved: income - expenses,
      savingsRate: income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0
    }
  }
}

// ======================== ACCOUNTS ========================

export const getAccounts = async (userId) => {
  if (!isSupabaseConfigured) {
    return { data: getMock('accounts', INITIAL_MOCK_ACCOUNTS), error: null }
  }
  return supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('is_default', { ascending: false })
    .order('created_at')
}

export const addAccount = async (account) => {
  if (!isSupabaseConfigured) {
    const list = getMock('accounts', INITIAL_MOCK_ACCOUNTS)
    const newAcc = { ...account, id: `acc-${Date.now()}` }
    list.push(newAcc)
    setMock('accounts', list)
    return { data: newAcc, error: null }
  }
  return supabase.from('accounts').insert(account).select().single()
}

export const updateAccount = async (id, updates) => {
  if (!isSupabaseConfigured) {
    let list = getMock('accounts', INITIAL_MOCK_ACCOUNTS)
    list = list.map(a => a.id === id ? { ...a, ...updates } : a)
    setMock('accounts', list)
    return { data: updates, error: null }
  }
  return supabase.from('accounts').update(updates).eq('id', id).select().single()
}

export const deleteAccount = async (id) => {
  if (!isSupabaseConfigured) {
    let list = getMock('accounts', INITIAL_MOCK_ACCOUNTS)
    list = list.filter(a => a.id !== id)
    setMock('accounts', list)
    return { error: null }
  }
  return supabase.from('accounts').update({ is_archived: true }).eq('id', id)
}

// ======================== CATEGORIES ========================

export const getCategories = async (userId, type) => {
  if (!isSupabaseConfigured) {
    let list = INITIAL_MOCK_CATEGORIES
    if (type && type !== 'both') list = list.filter(c => c.type === type || c.type === 'both')
    return { data: list, error: null }
  }

  let query = supabase
    .from('categories')
    .select('*')
    .or(`user_id.eq.${userId},is_default.eq.true`)
    .order('is_default', { ascending: false })
    .order('name')

  if (type && type !== 'both') {
    query = query.or(`type.eq.${type},type.eq.both`)
  }

  return query
}

export const addCategory = async (category) => {
  if (!isSupabaseConfigured) return { data: category, error: null }
  return supabase.from('categories').insert(category).select().single()
}

export const deleteCategory = async (id) => {
  if (!isSupabaseConfigured) return { error: null }
  return supabase.from('categories').delete().eq('id', id)
}

// ======================== BUDGETS ========================

export const getBudget = async (userId, month) => {
  if (!isSupabaseConfigured) {
    const rawBudget = getMock(`budget_${month}`, {
      id: `bgt-${month}`,
      month: `${month}-01`,
      budget_categories: [
        { id: 'bc-1', category_id: 'cat-3', limit_amount: 150000, alert_threshold: 80, categories: INITIAL_MOCK_CATEGORIES[2] },
        { id: 'bc-2', category_id: 'cat-4', limit_amount: 80000, alert_threshold: 80, categories: INITIAL_MOCK_CATEGORIES[3] },
        { id: 'bc-3', category_id: 'cat-6', limit_amount: 50000, alert_threshold: 80, categories: INITIAL_MOCK_CATEGORIES[5] },
      ]
    })
    return { data: rawBudget, error: null }
  }

  return supabase
    .from('budgets')
    .select(`
      *,
      budget_categories(
        *,
        categories(id, name, icon, color)
      )
    `)
    .eq('user_id', userId)
    .eq('month', `${month}-01`)
    .single()
}

export const createOrUpdateBudget = async (userId, month, data) => {
  if (!isSupabaseConfigured) {
    const bgt = { id: `bgt-${month}`, month: `${month}-01`, ...data, budget_categories: [] }
    setMock(`budget_${month}`, bgt)
    return { data: bgt, error: null }
  }
  return supabase
    .from('budgets')
    .upsert({ user_id: userId, month: `${month}-01`, ...data }, { onConflict: 'user_id,month' })
    .select().single()
}

export const setBudgetCategory = async (budgetId, userId, categoryId, limitAmount, alertThreshold = 80) => {
  if (!isSupabaseConfigured) {
    const cat = INITIAL_MOCK_CATEGORIES.find(c => c.id === categoryId)
    return { data: { id: `bc-${Date.now()}`, limit_amount: limitAmount, categories: cat }, error: null }
  }
  return supabase
    .from('budget_categories')
    .upsert({
      budget_id: budgetId,
      user_id: userId,
      category_id: categoryId,
      limit_amount: limitAmount,
      alert_threshold: alertThreshold
    }, { onConflict: 'budget_id,category_id' })
    .select().single()
}

export const deleteBudgetCategory = async (id) => {
  if (!isSupabaseConfigured) return { error: null }
  return supabase.from('budget_categories').delete().eq('id', id)
}

// ======================== SAVINGS GOALS ========================

export const getSavingsGoals = async (userId) => {
  if (!isSupabaseConfigured) {
    return { data: getMock('goals', INITIAL_MOCK_GOALS), error: null }
  }
  return supabase
    .from('savings_goals')
    .select(`*, accounts(id, name)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}

export const addSavingsGoal = async (goal) => {
  if (!isSupabaseConfigured) {
    const list = getMock('goals', INITIAL_MOCK_GOALS)
    const newGoal = { ...goal, id: `goal-${Date.now()}` }
    list.push(newGoal)
    setMock('goals', list)
    return { data: newGoal, error: null }
  }
  return supabase.from('savings_goals').insert(goal).select().single()
}

export const updateSavingsGoal = async (id, updates) => {
  if (!isSupabaseConfigured) {
    let list = getMock('goals', INITIAL_MOCK_GOALS)
    list = list.map(g => g.id === id ? { ...g, ...updates } : g)
    setMock('goals', list)
    return { data: updates, error: null }
  }
  return supabase.from('savings_goals').update(updates).eq('id', id).select().single()
}

export const deleteSavingsGoal = async (id) => {
  if (!isSupabaseConfigured) {
    let list = getMock('goals', INITIAL_MOCK_GOALS)
    list = list.filter(g => g.id !== id)
    setMock('goals', list)
    return { error: null }
  }
  return supabase.from('savings_goals').delete().eq('id', id)
}

export const addGoalContribution = async (contribution) => {
  if (!isSupabaseConfigured) {
    const list = getMock('goals', INITIAL_MOCK_GOALS)
    const target = list.find(g => g.id === contribution.goal_id)
    if (target) {
      target.current_amount = Number(target.current_amount || 0) + Number(contribution.amount)
      setMock('goals', list)
    }
    return { data: contribution, error: null }
  }

  const { data, error } = await supabase
    .from('goal_contributions')
    .insert(contribution)
    .select().single()

  if (!error) {
    supabase.from('savings_goals')
      .select('current_amount')
      .eq('id', contribution.goal_id)
      .single()
      .then(({ data: goal }) => {
        if (goal) {
          supabase.from('savings_goals')
            .update({ current_amount: Number(goal.current_amount) + Number(contribution.amount) })
            .eq('id', contribution.goal_id)
        }
      })
  }

  return { data, error }
}

// ======================== RECURRING ========================

export const getRecurringTransactions = async (userId) => {
  if (!isSupabaseConfigured) {
    return { data: getMock('recurring', INITIAL_MOCK_RECURRING), error: null }
  }
  return supabase
    .from('recurring_transactions')
    .select(`*, categories(id, name, icon, color), accounts(id, name)`)
    .eq('user_id', userId)
    .order('next_due_date')
}

export const addRecurring = async (recurring) => {
  if (!isSupabaseConfigured) {
    const list = getMock('recurring', INITIAL_MOCK_RECURRING)
    const newRec = { ...recurring, id: `rec-${Date.now()}` }
    list.push(newRec)
    setMock('recurring', list)
    return { data: newRec, error: null }
  }
  return supabase.from('recurring_transactions').insert(recurring).select().single()
}

export const updateRecurring = async (id, updates) => {
  if (!isSupabaseConfigured) return { data: updates, error: null }
  return supabase.from('recurring_transactions').update(updates).eq('id', id).select().single()
}

export const deleteRecurring = async (id) => {
  if (!isSupabaseConfigured) {
    let list = getMock('recurring', INITIAL_MOCK_RECURRING)
    list = list.filter(r => r.id !== id)
    setMock('recurring', list)
    return { error: null }
  }
  return supabase.from('recurring_transactions').delete().eq('id', id)
}

// ======================== DEBTS ========================

export const getDebts = async (userId) => {
  if (!isSupabaseConfigured) {
    return { data: getMock('debts', INITIAL_MOCK_DEBTS), error: null }
  }
  return supabase
    .from('debts')
    .select('*')
    .eq('user_id', userId)
    .order('next_payment_date')
}

export const addDebt = async (debt) => {
  if (!isSupabaseConfigured) {
    const list = getMock('debts', INITIAL_MOCK_DEBTS)
    const newDebt = { ...debt, id: `debt-${Date.now()}` }
    list.push(newDebt)
    setMock('debts', list)
    return { data: newDebt, error: null }
  }
  return supabase.from('debts').insert(debt).select().single()
}

export const updateDebt = async (id, updates) => {
  if (!isSupabaseConfigured) {
    let list = getMock('debts', INITIAL_MOCK_DEBTS)
    list = list.map(d => d.id === id ? { ...d, ...updates } : d)
    setMock('debts', list)
    return { data: updates, error: null }
  }
  return supabase.from('debts').update(updates).eq('id', id).select().single()
}

export const deleteDebt = async (id) => {
  if (!isSupabaseConfigured) {
    let list = getMock('debts', INITIAL_MOCK_DEBTS)
    list = list.filter(d => d.id !== id)
    setMock('debts', list)
    return { error: null }
  }
  return supabase.from('debts').delete().eq('id', id)
}

// ======================== NOTIFICATIONS ========================

export const getNotifications = async (userId, unreadOnly = false) => {
  if (!isSupabaseConfigured) return { data: [], error: null }
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (unreadOnly) query = query.eq('is_read', false)
  return query
}

export const markNotificationRead = async (id) => {
  if (!isSupabaseConfigured) return { error: null }
  return supabase.from('notifications').update({ is_read: true }).eq('id', id)
}

export const markAllNotificationsRead = async (userId) => {
  if (!isSupabaseConfigured) return { error: null }
  return supabase.from('notifications').update({ is_read: true }).eq('user_id', userId)
}

// ======================== ANALYTICS ========================

export const getSpendingByCategory = async (userId, startDate, endDate) => {
  if (!isSupabaseConfigured) {
    const list = getMock('transactions', INITIAL_MOCK_TRANSACTIONS)
      .filter(t => t.type === 'expense' && t.transaction_date >= startDate && t.transaction_date <= endDate)
    const grouped = {}
    list.forEach(t => {
      const cat = t.categories
      const key = cat?.name || 'Uncategorized'
      if (!grouped[key]) grouped[key] = { name: key, color: cat?.color || '#8B5CF6', amount: 0 }
      grouped[key].amount += Number(t.amount)
    })
    return { data: Object.values(grouped).sort((a, b) => b.amount - a.amount) }
  }

  const { data, error } = await supabase
    .from('transactions')
    .select(`amount, categories(id, name, icon, color)`)
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)

  if (error) return { error }

  const grouped = {}
  data.forEach(t => {
    const cat = t.categories
    const key = cat?.id || 'uncategorized'
    if (!grouped[key]) {
      grouped[key] = { ...cat, name: cat?.name || 'Uncategorized', amount: 0 }
    }
    grouped[key].amount += Number(t.amount)
  })

  return { data: Object.values(grouped).sort((a, b) => b.amount - a.amount) }
}

export const getMonthlyTrend = async (userId, months = 6) => {
  const results = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const stats = await getMonthlyStats(userId, monthStr)
    results.push({
      month: monthStr,
      label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      ...stats.data
    })
  }

  return { data: results }
}

// ======================== DEMO DATA SEEDER ========================

export const seedDemoFinancialData = async (userId, currency = 'TZS') => {
  setMock('accounts', INITIAL_MOCK_ACCOUNTS)
  setMock('transactions', INITIAL_MOCK_TRANSACTIONS)
  setMock('goals', INITIAL_MOCK_GOALS)
  setMock('recurring', INITIAL_MOCK_RECURRING)
  setMock('debts', INITIAL_MOCK_DEBTS)
  return { success: true }
}
