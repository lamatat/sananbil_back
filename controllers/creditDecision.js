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

  // Step 2: Fast rule-based check
  const ruleResult = ruleBasedApproval(userData, loanAmount);
  if (ruleResult.decision === 'Reject') {
    return {
      ...ruleResult,
      details: {
        sharia_compliant: true,
        rule_based: false
      }
    };
  }

  // Step 3: LLM for nuanced analysis
  const llmResult = await llmRiskAssessment(userData, loanAmount);
  if (llmResult.risk_score > 70) {
    return { 
      decision: 'Reject', 
      reason: `LLM: ${llmResult.reason}`,
      details: {
        sharia_compliant: true,
        rule_based: true,
        llm_risk_score: llmResult.risk_score
      }
    };
  }

  return { 
    decision: 'Approve', 
    reason: 'Passed all checks',
    details: {
      sharia_compliant: true,
      rule_based: true,
      llm_risk_score: llmResult.risk_score
    }
  };
};

module.exports = { hybridApproval }; 