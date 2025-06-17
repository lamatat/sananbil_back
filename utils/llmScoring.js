const OpenAI = require('openai');

// Initialize OpenAI only if API key is available
let openai;
try {
  console.log('Checking OpenAI API key...');
  if (process.env.OPENAI_API_KEY) {
    console.log('OpenAI API key found, initializing client...');
    openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // Add this for browser environments
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
    const prompt = `
    Analyze this Saudi user's financial data for loan risk:
    - Income: ${userData.incomeInsights?.accounts?.[0]?.recurringCreditSummary?.[0]?.avgAmount || 0} SAR
    - Transactions: ${JSON.stringify(userData.transactions?.slice(0, 5) || [])}
    - Loan Request: ${loanAmount} SAR

    Tasks:
    1. Flag risky patterns (e.g., gambling, overdrafts).
    2. Check if spending aligns with income.
    3. Return JSON: { "risk_score": 0-100, "reason": "..." }
    `;

    console.log('Sending request to OpenAI...');
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    console.log('Received response from OpenAI:', response.choices[0].message.content);
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    // Return a basic risk assessment if API call fails
    return {
      risk_score: 50,
      reason: `Basic risk assessment (OpenAI API error: ${error.message})`
    };
  }
};

module.exports = { llmRiskAssessment }; 