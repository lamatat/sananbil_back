const ruleBasedApproval = (userData, loanAmount) => {
  // Extract data from Tarabut APIs
  const monthlyIncome = userData.incomeInsights.recurringCreditSummary[0].avgAmount;
  const monthlyDebt = userData.spendingInsights.recurringDebitSummary[0].avgAmount;
  const currentBalance = userData.accountBalance.balances[0].amount.value;
  const balanceTrend = userData.balanceInsights.trend;

  // Calculate metrics
  const dti = (parseFloat(monthlyDebt) / parseFloat(monthlyIncome)) * 100;
  const liquidityRatio = (currentBalance / loanAmount) * 100;

  // Rules
  if (dti > 40) return { decision: 'Reject', reason: 'High DTI (>40%)' };
  if (liquidityRatio < 50) return { decision: 'Reject', reason: 'Low liquidity (<50%)' };
  if (balanceTrend === 'negative') return { decision: 'Reject', reason: 'Negative balance trend' };

  return { decision: 'Approve', reason: 'Passed all rules' };
};

module.exports = { ruleBasedApproval }; 