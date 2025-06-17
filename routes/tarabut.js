const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');

// Mock data for two accounts
const ACCOUNT_1 = "7eeec027-16d2-41bf-abad-70a81aabb2b3";
const ACCOUNT_2 = "c5950a78-122e-3fba-b8c7-8d43914bfe92";

// Mock data for testing
const mockAccounts = {
  '1234567890': {
    accounts: [
      {
        id: 'ACCOUNT_1',
        balance: 10000,
        transactions: [
          { type: 'SALARY', amount: 5000, date: '2024-03-01' },
          { type: 'SALARY', amount: 5000, date: '2024-02-01' },
          { type: 'SALARY', amount: 5000, date: '2024-01-01' }
        ],
        balanceTrend: 'stable'
      },
      {
        id: 'ACCOUNT_2',
        balance: 75000,
        transactions: [
          { type: 'SALARY', amount: 25000, date: '2024-03-01' },
          { type: 'SALARY', amount: 25000, date: '2024-02-01' },
          { type: 'SALARY', amount: 25000, date: '2024-01-01' }
        ],
        balanceTrend: 'positive'
      },
      {
        id: 'ACCOUNT_3',
        balance: 5000,
        transactions: [
          { type: 'SALARY', amount: 3000, date: '2024-03-01' },
          { type: 'SALARY', amount: 3000, date: '2024-02-01' },
          { type: 'SALARY', amount: 3000, date: '2024-01-01' },
          { type: 'LOAN_PAYMENT', amount: 2000, date: '2024-03-15' },
          { type: 'LOAN_PAYMENT', amount: 2000, date: '2024-02-15' },
          { type: 'LOAN_PAYMENT', amount: 2000, date: '2024-01-15' }
        ],
        balanceTrend: 'negative'
      }
    ]
  }
};

/**
 * @swagger
 * /api/tarabut/balance:
 *   get:
 *     summary: Get account balance
 *     tags: [Tarabut]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string
 *         description: Account ID to get balance for
 *     responses:
 *       200:
 *         description: Account balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: object
 *                   properties:
 *                     balanceType:
 *                       type: string
 *                       example: "CLOSING_BOOKED"
 *                     amount:
 *                       type: number
 *                       example: 5000.00
 *                     currency:
 *                       type: string
 *                       example: "SAR"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get('/balance', verifyToken, (req, res) => {
  const accountId = req.query.accountId || ACCOUNT_1;
  
  const balances = {
    [ACCOUNT_1]: {
      "balances": [
        {
          "type": "ClosingAvailable",
          "amount": {
            "value": 31.34,
            "currency": "SAR"
          }
        }
      ],
      "meta": {
        "lastBalancesUpdateDatetime": "2024-04-16T10:08:49.752196Z"
      }
    },
    [ACCOUNT_2]: {
      "balances": [
        {
          "accountId": ACCOUNT_2,
          "amount": {
            "value": 75000,
            "currency": "SAR"
          },
          "dateTime": "2024-03-01T00:00:00.000Z",
          "creditLineIncluded": false
        }
      ]
    }
  };

  res.json(balances[accountId] || balances[ACCOUNT_1]);
});

/**
 * @swagger
 * /api/tarabut/transactions:
 *   get:
 *     summary: Get account raw transactions
 *     tags: [Tarabut]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string
 *         description: Account ID to get transactions for
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: fromBookingDateTime
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for transactions
 *       - in: query
 *         name: toBookingDateTime
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for transactions
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       transactionId:
 *                         type: string
 *                       description:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       currency:
 *                         type: string
 *                       bookingDate:
 *                         type: string
 *                       valueDate:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get('/transactions', verifyToken, (req, res) => {
  const accountId = req.query.accountId || ACCOUNT_1;
  
  const transactions = {
    [ACCOUNT_1]: {
      "transactions": [
        {
          "transactionId": "0318cbb4-4c82-3cc0-8b25-7895e1388087",
          "accountId": ACCOUNT_1,
          "providerId": "BLUE",
          "transactionDescription": "Time:24:00:00Note:Online Purchase from Meal at Al Baik, Jeddah",
          "transactionType": "POS",
          "subTransactionType": "Purchase",
          "merchant": {
            "merchantCategoryCode": "5812"
          },
          "creditDebitIndicator": "Debit",
          "amount": {
            "value": 20,
            "currency": "SAR"
          },
          "bookingDateTime": "2023-01-11T00:00:00.000Z"
        },
        {
          "transactionId": "493ac419-ecfe-3a0d-8c17-7ae8ea0037f8",
          "accountId": ACCOUNT_1,
          "providerId": "BLUE",
          "transactionDescription": "Salary Deposit - ABC Corp",
          "transactionType": "CREDIT",
          "subTransactionType": "Salary",
          "merchant": {
            "merchantCategoryCode": ""
          },
          "creditDebitIndicator": "Credit",
          "amount": {
            "value": 25000,
            "currency": "SAR"
          },
          "bookingDateTime": "2023-01-10T00:00:00.000Z"
        }
      ],
      "meta": {
        "totalCountOfRecords": 25,
        "totalCountOfPages": 3,
        "pageNumber": 1,
        "pageSize": 10,
        "fromBookingDateTime": "2023-01-01T15:34:12.000Z",
        "toBookingDateTime": "2023-08-27T15:34:12.000Z",
        "lastTransactionsUpdateDatetime": "2024-01-30T10:10:28.069Z",
        "transactionsAvailability": "completed"
      }
    },
    [ACCOUNT_2]: {
      "transactions": [
        {
          "transactionId": "a4a5f506-2c83-3f92-ba59-ad8da5094d21",
          "accountId": ACCOUNT_2,
          "providerId": "BLUE",
          "transactionDescription": "Salary - Company XYZ",
          "transactionType": "CREDIT",
          "subTransactionType": "Salary",
          "merchant": {
            "merchantCategoryCode": ""
          },
          "creditDebitIndicator": "Credit",
          "amount": {
            "value": 25000,
            "currency": "SAR"
          },
          "bookingDateTime": "2023-01-09T00:00:00.000Z"
        },
        {
          "transactionId": "22e3a0ae-7fa0-3ecc-a7f7-2a24b5237034",
          "accountId": ACCOUNT_2,
          "providerId": "BLUE",
          "transactionDescription": "Grocery Shopping - Tamimi Markets",
          "transactionType": "POS",
          "subTransactionType": "Purchase",
          "merchant": {
            "merchantCategoryCode": "5411"
          },
          "creditDebitIndicator": "Debit",
          "amount": {
            "value": 350.50,
            "currency": "SAR"
          },
          "bookingDateTime": "2023-01-08T00:00:00.000Z"
        }
      ],
      "meta": {
        "totalCountOfRecords": 18,
        "totalCountOfPages": 2,
        "pageNumber": 1,
        "pageSize": 10,
        "fromBookingDateTime": "2023-01-01T15:34:12.000Z",
        "toBookingDateTime": "2023-08-27T15:34:12.000Z",
        "lastTransactionsUpdateDatetime": "2024-01-30T10:10:28.069Z",
        "transactionsAvailability": "completed"
      }
    }
  };

  res.json(transactions[accountId] || transactions[ACCOUNT_1]);
});

/**
 * @swagger
 * /api/tarabut/balance-insights:
 *   get:
 *     summary: Get balance insights
 *     tags: [Tarabut]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string
 *         description: Account ID to get balance insights for
 *     responses:
 *       200:
 *         description: Balance insights retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balanceInsights:
 *                   type: object
 *                   properties:
 *                     currentBalance:
 *                       type: number
 *                     availableBalance:
 *                       type: number
 *                     currency:
 *                       type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get('/balance-insights', verifyToken, (req, res) => {
  const accountId = req.query.accountId || ACCOUNT_1;
  
  const insights = {
    [ACCOUNT_1]: {
      "minBalance": {
        "date": "2023-07-21",
        "amount": {
          "value": 123,
          "currency": "SAR"
        }
      },
      "maxBalance": {
        "date": "2023-07-20",
        "amount": {
          "value": 1123,
          "currency": "SAR"
        }
      },
      "averageBalance": {
        "amount": {
          "value": 923,
          "currency": "SAR"
        }
      },
      "trend": "positive",
      "from": "2023-02-01",
      "to": "2023-09-30",
      "accountId": ACCOUNT_1,
      "providerId": "BLUE",
      "accountProductType": "account"
    },
    [ACCOUNT_2]: {
      "trend": "positive",
      "averageBalance": 75000,
      "minimumBalance": 50000,
      "maximumBalance": 100000
    }
  };

  res.json(insights[accountId] || insights[ACCOUNT_1]);
});

/**
 * @swagger
 * /api/tarabut/income-insights:
 *   get:
 *     summary: Get income insights summary
 *     tags: [Tarabut]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string
 *         description: Account ID to get income insights for
 *     responses:
 *       200:
 *         description: Income insights retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 incomeInsights:
 *                   type: object
 *                   properties:
 *                     totalIncome:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     period:
 *                       type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get('/income-insights', verifyToken, (req, res) => {
  const accountId = req.query.accountId || ACCOUNT_1;
  
  const insights = {
    [ACCOUNT_1]: {
      "accounts": [
        {
          "accountId": ACCOUNT_1,
          "accountCurrency": "SAR",
          "source": "Bank API",
          "lastUpdated": "2023-10-04T00:00:00.123Z",
          "accountHasSalary": true,
          "startDate": "2023-01-01",
          "endDate": "2023-09-30",
          "recurringCreditSummary": [
            {
              "streamDescriptionPattern": "Monthly Salary from ABC Corp",
              "streamType": "Salary",
              "frequency": "Monthly",
              "avgAmount": "25000.00",
              "links": [
                {
                  "ref": "TRANSACTIONS",
                  "href": "https://api.sau.sandbox.tarabutgateway.io/accountInformation/v1/accounts/7eeec027-16d2-41bf-abad-70a81aabb2b3/transactions?fromBookingDateTime=2023-12-01T00:00:00.000Z&toBookingDateTime=2024-03-01T00:00:00.000Z"
                }
              ]
            }
          ],
          "irregularCreditSummary": {
            "totalAmount": "100.00",
            "avgAmount": "10.00",
            "links": [
              {
                "ref": "TRANSACTIONS",
                "href": "https://api.sau.sandbox.tarabutgateway.io/accountInformation/v1/accounts/7eeec027-16d2-41bf-abad-70a81aabb2b3/transactions?fromBookingDateTime=2023-12-01T00:00:00.000Z&toBookingDateTime=2024-03-01T00:00:00.000Z"
              }
            ]
          },
          "creditSummary": {
            "minTransaction": {
              "transactionDescription": "Loyalty Cashback",
              "amount": "50.00",
              "date": "2023-02-14T00:00:00.123Z"
            },
            "maxTransaction": {
              "transactionDescription": "Tax Refund",
              "amount": "1500.00",
              "date": "2023-05-10T00:00:00.123Z"
            },
            "totalTransactions": "23500.00",
            "avgMonthlyTransactions": "2611.11"
          }
        }
      ]
    },
    [ACCOUNT_2]: {
      "accounts": [
        {
          "accountId": ACCOUNT_2,
          "accountCurrency": "SAR",
          "source": "Bank API",
          "lastUpdated": "2023-10-04T00:00:00.123Z",
          "accountHasSalary": true,
          "startDate": "2023-01-01",
          "endDate": "2023-09-30",
          "recurringCreditSummary": [
            {
              "streamDescriptionPattern": "Salary from Company XYZ",
              "streamType": "Salary",
              "frequency": "Monthly",
              "avgAmount": "25000.00",
              "links": [
                {
                  "ref": "TRANSACTIONS",
                  "href": "https://api.sau.sandbox.tarabutgateway.io/accountInformation/v1/accounts/c5950a78-122e-3fba-b8c7-8d43914bfe92/transactions?fromBookingDateTime=2023-12-01T00:00:00.000Z&toBookingDateTime=2024-03-01T00:00:00.000Z"
                }
              ]
            }
          ],
          "irregularCreditSummary": {
            "totalAmount": "500.00",
            "avgAmount": "50.00",
            "links": [
              {
                "ref": "TRANSACTIONS",
                "href": "https://api.sau.sandbox.tarabutgateway.io/accountInformation/v1/accounts/c5950a78-122e-3fba-b8c7-8d43914bfe92/transactions?fromBookingDateTime=2023-12-01T00:00:00.000Z&toBookingDateTime=2024-03-01T00:00:00.000Z"
              }
            ]
          }
        }
      ]
    }
  };

  res.json(insights[accountId] || insights[ACCOUNT_1]);
});

/**
 * @swagger
 * /api/tarabut/transaction-insights:
 *   get:
 *     summary: Get transaction insights summary
 *     tags: [Tarabut]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string
 *         description: Account ID to get transaction insights for
 *     responses:
 *       200:
 *         description: Transaction insights retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactionInsights:
 *                   type: object
 *                   properties:
 *                     totalTransactions:
 *                       type: integer
 *                     period:
 *                       type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get('/transaction-insights', verifyToken, (req, res) => {
  const accountId = req.query.accountId || ACCOUNT_1;
  
  const insights = {
    [ACCOUNT_1]: {
      "accounts": [
        {
          "accountId": ACCOUNT_1,
          "accountCurrency": "SAR",
          "providerId": "BLUE",
          "source": "Bank API",
          "lastUpdated": "2024-08-31T00:00:00.123Z",
          "accountHasCreditTransactions": true,
          "accountHasDebitTransactions": true,
          "startDate": "2024-07-01",
          "endDate": "2024-08-31",
          "transactionCreditSummary": {
            "totalAmount": "9000.00",
            "totalCount": 2,
            "avgMonthlyAmount": "4500.00",
            "avgMonthlyCount": 1,
            "maxMonthlyAmount": {
              "amount": "4500.00",
              "monthIndicator": "07",
              "yearIndicator": "2024"
            },
            "minMonthlyAmount": {
              "amount": "2500.00",
              "monthIndicator": "08",
              "yearIndicator": "2024"
            }
          },
          "transactionDebitSummary": {
            "totalAmount": "12000.00",
            "totalCount": 6,
            "avgMonthlyAmount": "6000.00",
            "avgMonthlyCount": 3,
            "maxMonthlyAmount": {
              "amount": "2300.00",
              "monthIndicator": "07",
              "yearIndicator": "2024"
            },
            "minMonthlyAmount": {
              "amount": "28.00",
              "monthIndicator": "08",
              "yearIndicator": "2024"
            }
          }
        }
      ]
    },
    [ACCOUNT_2]: {
      "accounts": [
        {
          "accountId": ACCOUNT_2,
          "accountCurrency": "SAR",
          "providerId": "BLUE",
          "source": "Bank API",
          "lastUpdated": "2024-08-31T00:00:00.123Z",
          "accountHasCreditTransactions": true,
          "accountHasDebitTransactions": true,
          "startDate": "2024-07-01",
          "endDate": "2024-08-31",
          "transactionCreditSummary": {
            "totalAmount": "24000.00",
            "totalCount": 2,
            "avgMonthlyAmount": "12000.00",
            "avgMonthlyCount": 1,
            "maxMonthlyAmount": {
              "amount": "12000.00",
              "monthIndicator": "07",
              "yearIndicator": "2024"
            },
            "minMonthlyAmount": {
              "amount": "12000.00",
              "monthIndicator": "08",
              "yearIndicator": "2024"
            }
          },
          "transactionDebitSummary": {
            "totalAmount": "5000.00",
            "totalCount": 8,
            "avgMonthlyAmount": "2500.00",
            "avgMonthlyCount": 4,
            "maxMonthlyAmount": {
              "amount": "1500.00",
              "monthIndicator": "07",
              "yearIndicator": "2024"
            },
            "minMonthlyAmount": {
              "amount": "100.00",
              "monthIndicator": "08",
              "yearIndicator": "2024"
            }
          }
        }
      ]
    }
  };

  res.json(insights[accountId] || insights[ACCOUNT_1]);
});

/**
 * @swagger
 * /api/tarabut/spending-insights:
 *   get:
 *     summary: Get spending insights
 *     tags: [Tarabut]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string
 *         description: Account ID to get spending insights for
 *     responses:
 *       200:
 *         description: Spending insights retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 spendingInsights:
 *                   type: object
 *                   properties:
 *                     totalSpending:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     period:
 *                       type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get('/spending-insights', verifyToken, (req, res) => {
  const accountId = req.query.accountId || ACCOUNT_1;
  
  const insights = {
    [ACCOUNT_1]: {
      "accounts": [
        {
          "accountId": ACCOUNT_1,
          "accountCurrency": "SAR",
          "source": "Bank API",
          "lastUpdated": "2023-10-04T00:00:00.123Z",
          "startDate": "2023-01-01",
          "endDate": "2023-09-30",
          "recurringDebitSummary": [
            {
              "streamDescriptionPattern": "POS   TAMIMI MARKETS123... JEDDAH SA",
              "streamType": "Groceries",
              "frequency": "Monthly",
              "avgAmount": "500.00",
              "links": [
                {
                  "ref": "TRANSACTIONS",
                  "href": "https://.../account/<accountId>/transactions?filter=123"
                }
              ]
            }
          ],
          "irregularSpendingSummary": {
            "totalAmount": "1000.00",
            "avgAmount": "100.00",
            "links": [
              {
                "ref": "TRANSACTIONS",
                "href": "https://.../account/<accountId>/transactions?filter=125"
              }
            ]
          },
          "SpendingSummary": {
            "minTransaction": {
              "transactionDescription": "D Donuts Jeddah SA",
              "amount": "50.00",
              "date": "2023-02-14T00:00:00.123Z"
            },
            "maxTransaction": {
              "transactionDescription": "POS Apple Store/ Dubai Mall1234",
              "amount": "1500.00",
              "date": "2023-05-10T00:00:00.123Z"
            },
            "totalTransactions": "15500.00",
            "avgMonthlyTransactions": "2611.11"
          }
        }
      ]
    },
    [ACCOUNT_2]: {
      "accounts": [
        {
          "accountId": ACCOUNT_2,
          "accountCurrency": "SAR",
          "source": "Bank API",
          "lastUpdated": "2023-10-04T00:00:00.123Z",
          "recurringDebitSummary": [
            {
              "streamDescriptionPattern": "Monthly Expenses",
              "streamType": "Regular",
              "frequency": "Monthly",
              "avgAmount": "5000.00",
              "links": [
                {
                  "ref": "TRANSACTIONS",
                  "href": "https://api.sau.sandbox.tarabutgateway.io/accountInformation/v1/accounts/c5950a78-122e-3fba-b8c7-8d43914bfe92/transactions?fromBookingDateTime=2023-12-01T00:00:00.000Z&toBookingDateTime=2024-03-01T00:00:00.000Z"
                }
              ]
            }
          ]
        }
      ]
    }
  };

  res.json(insights[accountId] || insights[ACCOUNT_1]);
});

module.exports = router; 