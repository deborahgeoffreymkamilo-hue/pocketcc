import React, { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext({})

export const useLanguage = () => useContext(LanguageContext)

export const translations = {
  en: {
    dashboard: 'Dashboard',
    market: 'Market',
    trade: 'Trade Desk',
    portfolio: 'Portfolio',
    aiInsights: 'AI Insights',
    goals: 'Goals',
    transactions: 'Transactions',
    budget: 'Budget',
    reports: 'Reports',
    calendar: 'Calendar',
    recurring: 'Recurring',
    debts: 'Debts',
    settings: 'Settings',
    signOut: 'Sign Out',
    welcome: 'Welcome',
    investmentOverview: "Here's your investment portfolio overview",
    totalHolding: 'Total Holding',
    savingsRate: 'Savings Rate',
    monthlyIncome: 'Monthly Income',
    monthlyExpenses: 'Monthly Expenses',
    amountSaved: 'Amount Saved',
    accounts: 'Accounts',
    watchlist: 'Watchlist',
    myPortfolio: 'My Portfolio',
    recentActivities: 'Recent Activities',
    addTransaction: 'Add Transaction',
    exploreAi: 'Explore AI Insights',
    decisionsData: 'Decisions Powered by Data',
    performance: 'Portfolio Performance',
    yourAssets: 'Your Assets',
    income: 'Income',
    expense: 'Expense',
    transfer: 'Transfer',
    seeAll: 'See all'
  },
  sw: {
    dashboard: 'Dashibodi',
    market: 'Soko la Mitaji',
    trade: 'Biashara & Hisa',
    portfolio: 'Pochi & Uwekezaji',
    aiInsights: 'Uchambuzi wa AI',
    goals: 'Malengo ya Akiba',
    transactions: 'Miamala',
    budget: 'Bajeti ya Mwezi',
    reports: 'Ripoti & Hesabu',
    calendar: 'Kalenda ya Fedha',
    recurring: 'Malipo ya Kila Mwezi',
    debts: 'Madeni & Mikopo',
    settings: 'Mipangilio',
    signOut: 'Ondoka',
    welcome: 'Karibu',
    investmentOverview: 'Huu hapa mtazamo wa uwekezaji na fedha zako',
    totalHolding: 'Jumla ya Mtaji',
    savingsRate: 'Kiwango cha Akiba',
    monthlyIncome: 'Mapato ya Mwezi',
    monthlyExpenses: 'Matumizi ya Mwezi',
    amountSaved: 'Kiasi Kilichohifadhiwa',
    accounts: 'Akaunti na Pochi',
    watchlist: 'Hisa Zinazofuatiliwa',
    myPortfolio: 'Uwekezaji Wangu',
    recentActivities: 'Miamala ya Hivi Karibuni',
    addTransaction: 'Ongeza Muamala',
    exploreAi: 'Uliza Helios AI',
    decisionsData: 'Uamuzi Kulingana na Data',
    performance: 'Mwenendo wa Uwekezaji',
    yourAssets: 'Mali na Uwekezaji Wako',
    income: 'Mapato',
    expense: 'Matumizi',
    transfer: 'Uhamisho',
    seeAll: 'Tazama zote'
  }
}

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('pocket_lang') || 'en'
  })

  useEffect(() => {
    localStorage.setItem('pocket_lang', lang)
  }, [lang])

  const t = (key) => {
    return translations[lang]?.[key] || translations.en[key] || key
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
