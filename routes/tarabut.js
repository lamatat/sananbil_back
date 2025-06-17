const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/tarabut/balance:
 *   get:
 *     summary: Get account balance
 *     tags: [Tarabut]
 *     responses:
 *       200:
 *         description: Account balance retrieved successfully
 */
router.get('/balance', (req, res) => {
  res.json({
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
  });
});

/**
 * @swagger
 * /api/tarabut/transactions:
 *   get:
 *     summary: Get account raw transactions
 *     tags: [Tarabut]
 *     parameters:
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
 */
router.get('/transactions', (req, res) => {
  res.json({
    "transactions": [
      {
        "transactionId": "0318cbb4-4c82-3cc0-8b25-7895e1388087",
        "accountId": "c5950a78-122e-3fba-b8c7-8d43914bfe92",
        "providerId": "BLUE",
        "transactionDescription": "Time:24:00:00Note:Online Purchase from Meal at Al Baik, Jeddah (2222445477681911-191328013950)",
        "transactionType": "POS",
        "subTransactionType": "Purchase",
        "merchant": {
          "merchantCategoryCode": ""
        },
        "creditDebitIndicator": "Debit",
        "amount": {
          "value": 20,
          "currency": "SAR"
        },
        "bookingDateTime": "2023-01-11T00:00:00.000Z"
      }
      // Additional transactions would be added here
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
    },
    "links": [
      {
        "rel": "FIRST",
        "href": "https://api.sau.sandbox.tarabutgateway.io/accountInformation/v2/accounts/c5950a78-122e-3fba-b8c7-8d43914bfe92/rawtransactions?page=1&fromBookingDateTime=2023-01-01T15:34:12Z&toBookingDateTime=2023-08-27T15:34:12Z"
      },
      {
        "rel": "NEXT",
        "href": "https://api.sau.sandbox.tarabutgateway.io/accountInformation/v2/accounts/c5950a78-122e-3fba-b8c7-8d43914bfe92/rawtransactions?page=2&fromBookingDateTime=2023-01-01T15:34:12Z&toBookingDateTime=2023-08-27T15:34:12Z"
      }
    ]
  });
});

/**
 * @swagger
 * /api/tarabut/balance-insights:
 *   get:
 *     summary: Get balance insights
 *     tags: [Tarabut]
 *     responses:
 *       200:
 *         description: Balance insights retrieved successfully
 */
router.get('/balance-insights', (req, res) => {
  res.json({
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
    "accountId": "7eeec027-16d2-41bf-abad-70a81aabb2b3",
    "providerId": "BLUE",
    "accountProductType": "account"
  });
});

/**
 * @swagger
 * /api/tarabut/income-insights:
 *   get:
 *     summary: Get income insights summary
 *     tags: [Tarabut]
 *     responses:
 *       200:
 *         description: Income insights retrieved successfully
 */
router.get('/income-insights', (req, res) => {
  res.json({
    "accounts": [
      {
        "accountId": "7eeec027-16d2-41bf-abad-70a81aabb2b3",
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
  });
});

/**
 * @swagger
 * /api/tarabut/transaction-insights:
 *   get:
 *     summary: Get transaction insights summary
 *     tags: [Tarabut]
 *     responses:
 *       200:
 *         description: Transaction insights retrieved successfully
 */
router.get('/transaction-insights', (req, res) => {
  res.json({
    "accounts": [
      {
        "accountId": "7eeec027-16d2-41bf-abad-70a81aabb2b3",
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
  });
});

/**
 * @swagger
 * /api/tarabut/spending-insights:
 *   get:
 *     summary: Get spending insights
 *     tags: [Tarabut]
 *     responses:
 *       200:
 *         description: Spending insights retrieved successfully
 */
router.get('/spending-insights', (req, res) => {
  res.json({
    "accounts": [
      {
        "accountId": "7eeec027-16d2-41bf-abad-70a81aabb2b3",
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
  });
});

module.exports = router; 