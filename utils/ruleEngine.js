const ruleBasedApproval = (userData, loanAmount) => {
  try {
    // Extract data from Tarabut APIs with safe defaults
    const monthlyIncome = userData.incomeInsights?.accounts?.[0]?.recurringCreditSummary?.[0]?.avgAmount || 0;
    const monthlyDebt = userData.spendingInsights?.accounts?.[0]?.recurringDebitSummary?.[0]?.avgAmount || 0;
    const currentBalance = userData.accountBalance?.balances?.[0]?.amount?.value || 0;
    const balanceTrend = userData.balanceInsights?.trend || 'neutral';

    // Convert string values to numbers
    const income = parseFloat(monthlyIncome) || 0;
    const debt = parseFloat(monthlyDebt) || 0;
    const balance = parseFloat(currentBalance) || 0;

    // Calculate metrics
    const dti = income > 0 ? (debt / income) * 100 : 100; // If no income, DTI is 100%
    const liquidityRatio = loanAmount > 0 ? (balance / loanAmount) * 100 : 0;

    // Prepare detailed explanation
    const explanation = {
      income: {
        amount: income,
        status: income > 0 ? 'Present' : 'Missing'
      },
      debt: {
        amount: debt,
        status: debt > 0 ? 'Present' : 'None'
      },
      dti: {
        ratio: dti,
        threshold: 40,
        status: dti <= 40 ? 'Acceptable' : 'High'
      },
      liquidity: {
        ratio: liquidityRatio,
        threshold: 50,
        status: liquidityRatio >= 50 ? 'Sufficient' : 'Insufficient'
      },
      balance_trend: {
        value: balanceTrend,
        status: balanceTrend === 'negative' ? 'Concerning' : 'Acceptable'
      }
    };

    // Rules with detailed explanations
    if (dti > 40) {
      return { 
        decision: 'Reject', 
        reason: 'High DTI (>40%)',
        dti_ratio: dti,
        liquidity_ratio: liquidityRatio,
        balance_trend: balanceTrend,
        explanation
      };
    }
    if (liquidityRatio < 50) {
      return { 
        decision: 'Reject', 
        reason: 'Low liquidity (<50%)',
        dti_ratio: dti,
        liquidity_ratio: liquidityRatio,
        balance_trend: balanceTrend,
        explanation
      };
    }
    if (balanceTrend === 'negative') {
      return { 
        decision: 'Reject', 
        reason: 'Negative balance trend',
        dti_ratio: dti,
        liquidity_ratio: liquidityRatio,
        balance_trend: balanceTrend,
        explanation
      };
    }

    return { 
      decision: 'Approve', 
      reason: 'Passed all rules',
      dti_ratio: dti,
      liquidity_ratio: liquidityRatio,
      balance_trend: balanceTrend,
      explanation
    };
  } catch (error) {
    console.error('Error in rule-based approval:', error);
    return { 
      decision: 'Reject', 
      reason: 'Error in financial analysis',
      explanation: {
        error: error.message
      }
    };
  }
};

module.exports = { ruleBasedApproval }; 