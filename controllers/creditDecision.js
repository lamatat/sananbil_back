const { ruleBasedApproval } = require('../utils/ruleEngine');
const { llmRiskAssessment } = require('../utils/llmScoring');
const { isShariaCompliant } = require('../utils/shariaCheck');

const hybridApproval = async (userData, loanAmount) => {
  // Step 1: Sharia compliance check
  if (!isShariaCompliant(userData.transactions)) {
    return { 
      decision: 'Reject', 
      reason: 'Non-Sharia-compliant transactions detected',
      details: {
        sharia_compliant: false
      }
    };
  }

  // Step 2: Rule-based check
  const ruleResult = ruleBasedApproval(userData, loanAmount);

  // Step 3: LLM for nuanced analysis (always perform this check)
  const llmResult = await llmRiskAssessment(userData, loanAmount);
  
  // If using fallback assessment
  if (llmResult.reason.includes('Basic risk assessment')) {
    return {
      decision: ruleResult.decision,
      reason: `${ruleResult.reason} (LLM not available)`,
      details: {
        sharia_compliant: true,
        rule_based: ruleResult.decision === 'Approve',
        rule_based_details: {
          dti_ratio: ruleResult.dti_ratio,
          liquidity_ratio: ruleResult.liquidity_ratio,
          balance_trend: ruleResult.balance_trend,
          explanation: ruleResult.explanation
        },
        llm_risk_score: llmResult.risk_score,
        llm_available: false
      }
    };
  }

  // If both rule-based and LLM reject
  if (ruleResult.decision === 'Reject' && llmResult.risk_score > 70) {
    return { 
      decision: 'Reject', 
      reason: `Rule-based: ${ruleResult.reason}, LLM: ${llmResult.reason}`,
      details: {
        sharia_compliant: true,
        rule_based: false,
        rule_based_details: {
          dti_ratio: ruleResult.dti_ratio,
          liquidity_ratio: ruleResult.liquidity_ratio,
          balance_trend: ruleResult.balance_trend,
          explanation: ruleResult.explanation
        },
        llm_risk_score: llmResult.risk_score,
        llm_available: true,
        llm_details: llmResult.details
      }
    };
  }

  // If rule-based rejects but LLM approves
  if (ruleResult.decision === 'Reject' && llmResult.risk_score <= 70) {
    return { 
      decision: 'Approve', 
      reason: `Rule-based rejected but LLM approved: ${llmResult.reason}`,
      details: {
        sharia_compliant: true,
        rule_based: false,
        rule_based_details: {
          dti_ratio: ruleResult.dti_ratio,
          liquidity_ratio: ruleResult.liquidity_ratio,
          balance_trend: ruleResult.balance_trend,
          explanation: ruleResult.explanation
        },
        llm_risk_score: llmResult.risk_score,
        llm_available: true,
        llm_details: llmResult.details
      }
    };
  }

  // If rule-based approves but LLM rejects
  if (ruleResult.decision === 'Approve' && llmResult.risk_score > 70) {
    return { 
      decision: 'Reject', 
      reason: `Rule-based approved but LLM rejected: ${llmResult.reason}`,
      details: {
        sharia_compliant: true,
        rule_based: true,
        rule_based_details: {
          dti_ratio: ruleResult.dti_ratio,
          liquidity_ratio: ruleResult.liquidity_ratio,
          balance_trend: ruleResult.balance_trend,
          explanation: ruleResult.explanation
        },
        llm_risk_score: llmResult.risk_score,
        llm_available: true,
        llm_details: llmResult.details
      }
    };
  }

  // If both rule-based and LLM approve
  return { 
    decision: 'Approve', 
    reason: 'Passed all checks',
    details: {
      sharia_compliant: true,
      rule_based: true,
      rule_based_details: {
        dti_ratio: ruleResult.dti_ratio,
        liquidity_ratio: ruleResult.liquidity_ratio,
        balance_trend: ruleResult.balance_trend,
        explanation: ruleResult.explanation
      },
      llm_risk_score: llmResult.risk_score,
      llm_available: true,
      llm_details: llmResult.details
    }
  };
};

module.exports = { hybridApproval }; 