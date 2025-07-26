const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    type: { type: String, required: true },
    quantity: { type: Number, required: true },
    co2: { type: Number, required: true },
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Activity', activitySchema);