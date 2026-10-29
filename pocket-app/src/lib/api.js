import { supabase } from '../lib/supabase'

// ======================== TRANSACTIONS ========================

export const getTransactions = async ({ userId, limit = 50, offset = 0, type, categoryId, accountId, startDate, endDate, search } = {}) => {
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
  return supabase.from('transactions').insert(transaction).select(`
    *,
    categories(id, name, icon, color),
    accounts!transactions_account_id_fkey(id, name, type, color)
  `).single()
}

export const updateTransaction = async (id, updates) => {
  return supabase.from('transactions').update(updates).eq('id', id).select().single()
}

export const deleteTransaction = async (id) => {
  return supabase.from('transactions').delete().eq('id', id)
}

export const getMonthlyStats = async (userId, month) => {
  const startDate = `${month}-01`
  const endDate = new Date(month.split('-')[0], month.split('-')[1], 0).toISOString().split('T')[0]

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
  return supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('is_default', { ascending: false })
    .order('created_at')
}

export const addAccount = async (account) => {
  return supabase.from('accounts').insert(account).select().single()
}

export const updateAccount = async (id, updates) => {
  return supabase.from('accounts').update(updates).eq('id', id).select().single()
}

export const deleteAccount = async (id) => {
  return supabase.from('accounts').update({ is_archived: true }).eq('id', id)
}

// ======================== CATEGORIES ========================

export const getCategories = async (userId, type) => {
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
  return supabase.from('categories').insert(category).select().single()
}

export const deleteCategory = async (id) => {
  return supabase.from('categories').delete().eq('id', id)
}

// ======================== BUDGETS ========================

export const getBudget = async (userId, month) => {
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
  return supabase
    .from('budgets')
    .upsert({ user_id: userId, month: `${month}-01`, ...data }, { onConflict: 'user_id,month' })
    .select().single()
}

export const setBudgetCategory = async (budgetId, userId, categoryId, limitAmount, alertThreshold = 80) => {
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
  return supabase.from('budget_categories').delete().eq('id', id)
}

// ======================== SAVINGS GOALS ========================

export const getSavingsGoals = async (userId) => {
  return supabase
    .from('savings_goals')
    .select(`*, accounts(id, name)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}

export const addSavingsGoal = async (goal) => {
  return supabase.from('savings_goals').insert(goal).select().single()
}

export const updateSavingsGoal = async (id, updates) => {
  return supabase.from('savings_goals').update(updates).eq('id', id).select().single()
}

export const deleteSavingsGoal = async (id) => {
  return supabase.from('savings_goals').delete().eq('id', id)
}

export const addGoalContribution = async (contribution) => {
  const { data, error } = await supabase
    .from('goal_contributions')
    .insert(contribution)
    .select().single()

  if (!error) {
    // Update goal current amount
    await supabase.rpc('increment_goal_amount', {
      goal_id: contribution.goal_id,
      amount: contribution.amount
    }).catch(() => {
      // Fallback: manual update
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
    })
  }

  return { data, error }
}

// ======================== RECURRING ========================

export const getRecurringTransactions = async (userId) => {
  return supabase
    .from('recurring_transactions')
    .select(`*, categories(id, name, icon, color), accounts(id, name)`)
    .eq('user_id', userId)
    .order('next_due_date')
}

export const addRecurring = async (recurring) => {
  return supabase.from('recurring_transactions').insert(recurring).select().single()
}

export const updateRecurring = async (id, updates) => {
  return supabase.from('recurring_transactions').update(updates).eq('id', id).select().single()
}

export const deleteRecurring = async (id) => {
  return supabase.from('recurring_transactions').delete().eq('id', id)
}

// ======================== DEBTS ========================

export const getDebts = async (userId) => {
  return supabase
    .from('debts')
    .select('*')
    .eq('user_id', userId)
    .order('next_payment_date')
}

export const addDebt = async (debt) => {
  return supabase.from('debts').insert(debt).select().single()
}

export const updateDebt = async (id, updates) => {
  return supabase.from('debts').update(updates).eq('id', id).select().single()
}

export const deleteDebt = async (id) => {
  return supabase.from('debts').delete().eq('id', id)
}

// ======================== NOTIFICATIONS ========================

export const getNotifications = async (userId, unreadOnly = false) => {
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
  return supabase.from('notifications').update({ is_read: true }).eq('id', id)
}

export const markAllNotificationsRead = async (userId) => {
  return supabase.from('notifications').update({ is_read: true }).eq('user_id', userId)
}

// ======================== ANALYTICS ========================

export const getSpendingByCategory = async (userId, startDate, endDate) => {
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
