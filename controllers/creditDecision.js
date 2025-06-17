const { ruleBasedApproval } = require('../utils/ruleEngine');
const { llmRiskAssessment } = require('../utils/llmScoring');

const hybridApproval = async (accountData, loanAmount) => {
  try {
    // First check Sharia compliance
    const hasNonCompliantTransactions = accountData.transactions.some(
      t => t.type === 'GAMBLING' || t.type === 'ALCOHOL' || t.type === 'TOBACCO'
    );
    
    if (hasNonCompliantTransactions) {
      return {
        decision: 'Reject',
        reason: 'Non-compliant transactions detected',
        details: {
          sharia_compliance: false,
          non_compliant_activities: accountData.transactions
            .filter(t => ['GAMBLING', 'ALCOHOL', 'TOBACCO'].includes(t.type))
            .map(t => t.type)
        }
      };
    }

    // Get rule-based decision
    const ruleBasedResult = ruleBasedApproval(accountData, loanAmount);
    
    // Get LLM risk assessment
    const llmResult = await llmRiskAssessment(accountData, loanAmount);
    
    // If both systems reject, the application is rejected
    if (ruleBasedResult.decision === 'Reject' && llmResult.risk_score > 70) {
      return {
        decision: 'Reject',
        reason: 'Application rejected by both rule-based and LLM assessments',
        details: {
          rule_based: {
            decision: ruleBasedResult.decision,
            reason: ruleBasedResult.reason,
            metrics: {
              dti_ratio: ruleBasedResult.dti_ratio,
              liquidity_ratio: ruleBasedResult.liquidity_ratio,
              balance_trend: ruleBasedResult.balance_trend
            },
            explanation: ruleBasedResult.explanation
          },
          llm: {
            available: llmResult.risk_score !== undefined,
            risk_score: llmResult.risk_score,
            details: llmResult.details
          },
          sharia_compliance: true
        }
      };
    }

    // If both systems approve, the application is approved
    if (ruleBasedResult.decision === 'Approve' && llmResult.risk_score <= 70) {
      return {
        decision: 'Approve',
        reason: 'Application approved by both rule-based and LLM assessments',
        details: {
          rule_based: {
            decision: ruleBasedResult.decision,
            reason: ruleBasedResult.reason,
            metrics: {
              dti_ratio: ruleBasedResult.dti_ratio,
              liquidity_ratio: ruleBasedResult.liquidity_ratio,
              balance_trend: ruleBasedResult.balance_trend
            },
            explanation: ruleBasedResult.explanation
          },
          llm: {
            available: llmResult.risk_score !== undefined,
            risk_score: llmResult.risk_score,
            details: llmResult.details
          },
          sharia_compliance: true
        }
      };
    }

    // If there's a conflict (one approves, one rejects), return for bank decision
    return {
      decision: 'Up to the bank',
      reason: 'Conflicting assessments between rule-based and LLM systems',
      details: {
        rule_based: {
          decision: ruleBasedResult.decision,
          reason: ruleBasedResult.reason,
          metrics: {
            dti_ratio: ruleBasedResult.dti_ratio,
            liquidity_ratio: ruleBasedResult.liquidity_ratio,
            balance_trend: ruleBasedResult.balance_trend
          },
          explanation: ruleBasedResult.explanation
        },
        llm: {
          available: llmResult.risk_score !== undefined,
          risk_score: llmResult.risk_score,
          details: llmResult.details
        },
        sharia_compliance: true,
        recommendation: 'This application requires manual review by a credit officer due to conflicting assessments.'
      }
    };
  } catch (error) {
    console.error('Error in hybrid approval:', error);
    return {
      decision: 'Error',
      reason: 'Error processing application',
      details: {
        error: error.message
      }
    };
  }
};

module.exports = {
  hybridApproval
}; 