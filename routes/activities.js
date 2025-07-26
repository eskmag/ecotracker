const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

// Simple CO2 calculation factors
const factors = {
    driving: 0.411,
    beef: 5,
    shower: 1.5,
};

// POST /api/activities
router.post('/', async (req, res) => {
    const { type, quantity } = req.body;
    const factor = factors[type.toLowerCase()] || 1;
    const co2 = parseFloat((factor * quantity).toFixed(2));
    
    try {
        const activity = new Activity({ type, quantity, co2 });
        await activity.save();
        res.status(201).json(activity);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/activities
router.get('/', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const filter = {};

        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const activities = await Activity.find(filter).sort({ date: -1 });
        res.json(activities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const { period = 'week', startDate, endDate } = req.query;

        const match = {};
        if (startDate || endDate) {
            match.date = {};
            if (startDate) match.date.$gte = new Date(startDate);
            if (endDate) match.date.$lte = new Date(endDate);
        }

        // MongoDB aggregation pipeline to group by period
        const groupId = 
            period === 'month'
                ? { year: { $year: '$date' }, month: { $month: '$date' } }
                : { year: { $year: '$date' }, week: { $week: '$date' } };

        const stats = await Activity.aggregate([
            { $match: match },
            {
                $group: {
                    _id: groupId,
                    totalCO2: { $sum: '$co2' },
                    count: { $sum: 1 },
                },
            },
            { $sort : { '_id.year': 1, '_id.week': 1, '_id.month': 1 } },
        ]);

        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;