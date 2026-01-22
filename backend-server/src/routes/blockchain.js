const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const blockchainService = require('../utils/blockchain');

const router = express.Router();

function getMockTransactions({ userId, limit = 20 } = {}) {
    const now = new Date();
    const baseUserId = userId || 'demo-farmer-1';

    const mock = [
        {
            transactionHash: '0x9a2f0b8c8d7e4c1b9e3d2a1f0c4b6a8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b',
            blockNumber: 52133421,
            fromAddress: 'demo-buyer-1',
            toAddress: baseUserId,
            amount: 42500,
            currency: 'INR',
            transactionType: 'payment',
            status: 'confirmed',
            network: 'polygon',
            timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            explorerUrl: 'https://polygonscan.com/tx/0x9a2f0b8c8d7e4c1b9e3d2a1f0c4b6a8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b',
            payment: { amount: 42500, currency: 'INR', status: 'paid' }
        },
        {
            transactionHash: '0x1b3c5d7f9a0c2e4f6b8d0a2c4e6f8a0b2c4e6f8a0b2c4e6f8a0b2c4e6f8a0b2c',
            blockNumber: 52111209,
            fromAddress: baseUserId,
            toAddress: 'escrow-contract',
            amount: 5000,
            currency: 'INR',
            transactionType: 'escrow',
            status: 'confirmed',
            network: 'polygon',
            timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            explorerUrl: 'https://polygonscan.com/tx/0x1b3c5d7f9a0c2e4f6b8d0a2c4e6f8a0b2c4e6f8a0b2c4e6f8a0b2c4e6f8a0b2c',
            payment: { amount: 5000, currency: 'INR', status: 'paid' }
        },
        {
            transactionHash: '0x0f0e0d0c0b0a09080706050403020100ffeeddccbbaa99887766554433221100',
            blockNumber: 52099811,
            fromAddress: 'demo-buyer-2',
            toAddress: baseUserId,
            amount: 18200,
            currency: 'INR',
            transactionType: 'payment',
            status: 'confirmed',
            network: 'polygon',
            timestamp: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            explorerUrl: 'https://polygonscan.com/tx/0x0f0e0d0c0b0a09080706050403020100ffeeddccbbaa99887766554433221100',
            payment: { amount: 18200, currency: 'INR', status: 'paid' }
        },
        {
            transactionHash: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd',
            blockNumber: 52055432,
            fromAddress: baseUserId,
            toAddress: 'demo-buyer-3',
            amount: 3500,
            currency: 'INR',
            transactionType: 'refund',
            status: 'confirmed',
            network: 'polygon',
            timestamp: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
            explorerUrl: 'https://polygonscan.com/tx/0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd',
            payment: { amount: 3500, currency: 'INR', status: 'refunded' }
        }
    ];

    return mock.slice(0, Math.max(1, Math.min(limit, 50)));
}

// Get blockchain transaction history (used for showing "previous transactions" in farmer profile)
router.get('/transactions', optionalAuth, async (req, res) => {
    try {
        const userId = (req.query.userId || req.user?._id || '').toString() || undefined;
        const limit = Number(req.query.limit || 20);
        const transactionType = req.query.transactionType ? String(req.query.transactionType) : undefined;
        const status = req.query.status ? String(req.query.status) : undefined;

        // If DB isn't connected, return mock transaction history for UX/demo.
        if (!global.dbConnected) {
            const transactions = getMockTransactions({ userId, limit });
            return res.json({
                transactions,
                total: transactions.length,
                source: 'mock'
            });
        }

        // When DB is connected, use the blockchain service.
        const transactions = await blockchainService.getTransactionHistory(userId, {
            limit,
            transactionType,
            status
        });

        return res.json({
            transactions,
            total: transactions.length,
            source: 'db'
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch blockchain transactions',
            error: error.message
        });
    }
});

module.exports = router;
