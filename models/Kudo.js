const mongoose = require('mongoose');

const kudoSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Teamwork', 'Innovation', 'Leadership', 'Excellence', 'Help'],
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

// Add index for faster queries
kudoSchema.index({ from: 1, to: 1, createdAt: -1 });
kudoSchema.index({ category: 1 });

module.exports = mongoose.model('Kudo', kudoSchema);
