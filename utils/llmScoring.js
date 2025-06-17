const OpenAI = require('openai');

// Initialize OpenAI only if API key is available
let openai;
try {
  console.log('Checking OpenAI API key...');
  if (process.env.OPENAI_API_KEY) {
    console.log('OpenAI API key found, initializing client...');
    openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
    console.log('OpenAI client initialized successfully');
  } else {
    console.log('OpenAI API key not found in environment variables');
  }
} catch (error) {
  console.error('OpenAI initialization failed:', error.message);
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
    console.log('Preparing prompt for OpenAI...');
    const prompt = `You are a financial risk assessment AI. Analyze this Saudi user's financial data for loan risk assessment.

Financial Data:
- Monthly Income: ${userData.incomeInsights?.accounts?.[0]?.recurringCreditSummary?.[0]?.avgAmount || 0} SAR
- Recent Transactions: ${JSON.stringify(userData.transactions?.slice(0, 5) || [])}
- Requested Loan Amount: ${loanAmount} SAR
- Current Balance: ${userData.accountBalance?.balances?.[0]?.amount?.value || 0} SAR
- Balance Trend: ${userData.balanceInsights?.trend || 'neutral'}

Assessment Tasks:
1. Calculate risk score (0-100) based on:
   - Income stability and amount
   - Transaction patterns
   - Balance trends
   - Loan amount relative to income
2. Identify any risky patterns (gambling, overdrafts, etc.)
3. Check if spending aligns with income
4. Consider Sharia compliance of transactions

Return a JSON object with:
{
  "risk_score": number (0-100),
  "reason": "string explaining the risk assessment",
  "details": {
    "income_risk": "string",
    "transaction_risk": "string",
    "balance_risk": "string"
  }
}`;

    console.log('Sending request to OpenAI...');
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower temperature for more consistent results
      max_tokens: 500
    });

    console.log('Received response from OpenAI:', response.choices[0].message.content);
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    
    // Handle specific error cases
    if (error.message.includes('429') || error.message.includes('quota')) {
      return {
        risk_score: 50,
        reason: 'Basic risk assessment (OpenAI quota exceeded - please check billing)',
        details: {
          error: 'OpenAI quota exceeded',
          recommendation: 'Please check your OpenAI billing status and quota limits'
        }
      };
    }
    
    // Return a basic risk assessment for other errors
    return {
      risk_score: 50,
      reason: `Basic risk assessment (OpenAI API error: ${error.message})`
    };
  }
};

module.exports = { llmRiskAssessment }; 