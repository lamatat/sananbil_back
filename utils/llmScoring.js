const OpenAI = require('openai');
const openai = new OpenAI(process.env.OPENAI_KEY);

const llmRiskAssessment = async (userData, loanAmount) => {
  const prompt = `
  Analyze this Saudi user's financial data for loan risk:
  - Income: ${userData.incomeInsights.recurringCreditSummary[0].avgAmount} SAR
  - Transactions: ${JSON.stringify(userData.transactions.slice(0, 5))}
  - Loan Request: ${loanAmount} SAR

  Tasks:
  1. Flag risky patterns (e.g., gambling, overdrafts).
  2. Check if spending aligns with income.
  3. Return JSON: { "risk_score": 0-100, "reason": "..." }
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
};

module.exports = { llmRiskAssessment }; 