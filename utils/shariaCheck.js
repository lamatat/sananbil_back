const isShariaCompliant = (transactions) => {
  const haramKeywords = ['interest', 'riba', 'قمار', 'كازينو', 'gambling', 'casino', 'betting', 'lottery'];
  
  // Check transaction descriptions for haram keywords
  const hasHaramTransactions = transactions.some(tx => 
    haramKeywords.some(keyword => 
      tx.transactionDescription.toLowerCase().includes(keyword.toLowerCase())
    )
  );

  return !hasHaramTransactions;
};

module.exports = { isShariaCompliant }; 