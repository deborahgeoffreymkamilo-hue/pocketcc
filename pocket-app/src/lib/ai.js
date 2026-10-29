// Helios.ai Financial Intelligence Engine powered by Groq API
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

// Reads Groq API Key from environment or local storage
export const getGroqApiKey = () => {
  return (
    localStorage.getItem('pocket_groq_api_key') ||
    import.meta.env.VITE_GROQ_API_KEY ||
    ''
  )
}

export const setGroqApiKey = (key) => {
  localStorage.setItem('pocket_groq_api_key', key)
}

/**
 * Ask Helios.ai with full financial awareness
 * @param {Array} messages - Chat history [{ role: 'user'|'assistant'|'system', content: string }]
 * @param {Object} financialContext - User's current financial snapshot
 * @returns {Promise<string>}
 */
export async function askHeliosAI(messages, financialContext = {}) {
  const apiKey = getGroqApiKey()

  const {
    totalBalance = 'TSh 1,785,000',
    monthlyIncome = 'TSh 1,500,000',
    monthlyExpenses = 'TSh 510,000',
    amountSaved = 'TSh 990,000',
    savingsRate = '66%',
    emergencyRunway = '2.8 months',
    currency = 'TZS',
    topCategories = 'Rent & Housing, Food & Dining, Airtime & Data',
    accounts = 'Vodacom M-Pesa, CRDB Bank, Cash',
    debts = 'Laptop Loan (TSh 350,000 remaining)'
  } = financialContext

  const systemPrompt = `You are Helios.ai, an elite AI-powered personal financial companion and wealth advisor integrated into Pocket, a modern personal finance application tailored for Tanzania and global investors.

CURRENT USER FINANCIAL SNAPSHOT:
- Base Currency: ${currency}
- Total Liquid Balance: ${totalBalance}
- Monthly Inflows: ${monthlyIncome}
- Monthly Outflows: ${monthlyExpenses}
- Net Amount Saved This Month: ${amountSaved} (Savings Rate: ${savingsRate})
- Emergency Fund Runway: ${emergencyRunway}
- Active Accounts: ${accounts}
- Top Expense Categories: ${topCategories}
- Outstanding Debts/Liabilities: ${debts}

YOUR CORE TRAITS & INSTRUCTIONS:
1. Ground your answers using the user's actual numbers provided above.
2. Be insightful, concise, empowering, and pragmatic.
3. Understand Tanzanian financial realities (Mobile Money like M-Pesa/Airtel Money/Tigo Pesa, CRDB/NMB banks, Airtime/LUKU/Wi-Fi utility patterns, DSE investments).
4. Provide actionable guidance (e.g. 50/30/20 budget framework, emergency fund prioritization, savings goal timelines).
5. Always maintain a professional yet warm tone.
6. Clearly provide financial guidance rather than binding professional financial certification (as mandated by finance compliance).`

  const payload = {
    model: 'openai/gpt-oss-120b',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text || m.content
      }))
    ],
    temperature: 0.6,
    max_tokens: 800
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      // Fallback to openai/gpt-oss-20b if 120b is busy or returns an error
      payload.model = 'openai/gpt-oss-20b'
      const retryResp = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      })

      if (!retryResp.ok) {
        throw new Error(`HTTP ${retryResp.status}`)
      }

      const retryData = await retryResp.json()
      return retryData.choices?.[0]?.message?.content || 'Helios.ai is analyzing your finances.'
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || 'I have analyzed your request based on your current financial metrics.'
  } catch (err) {
    console.error('Groq Helios.ai error:', err)
    // Intelligent contextual fallback
    return `Helios.ai Advisor Note: Based on your current monthly surplus of ${amountSaved} and ${savingsRate} savings rate, you are on a positive trajectory. Focus on extending your ${emergencyRunway} emergency reserve to at least 3-6 full months of essential living expenses.`
  }
}
