const OpenAI = require('openai');

// Initialize OpenAI only if API key is available
let openai;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (error) {
  console.warn('OpenAI initialization failed:', error.message);
}

const llmRiskAssessment = async (userData, loanAmount) => {
  // If OpenAI is not initialized, return a basic risk assessment
  if (!openai) {
    console.log('Using fallback risk assessment (OpenAI not available)');
    return {
      risk_score: 50,
      reason: 'Basic risk assessment (OpenAI not available)'
    };
  }

  try {
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
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    // Return a basic risk assessment if API call fails
    return {
      risk_score: 50,
      reason: 'Basic risk assessment (OpenAI API error)'
    };
  }
};

module.exports = { llmRiskAssessment }; 