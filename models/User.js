const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        default: ''
    },
    position: {
        type: String,
        default: ''
    },
    avatar: {
        type: String,
        default: ''
    },
    level: {
        type: Number,
        default: 1
    },
    kudosReceived: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Kudo'
    }],
    kudosGiven: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Kudo'
    }],
    badges: [{
        name: String,
        description: String,
        dateEarned: Date
    }]
}, {
    timestamps: true
});

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Add indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ department: 1 });
userSchema.index({ level: -1 });

// Virtual field for total kudos count
userSchema.virtual('totalKudos').get(function() {
    return this.kudosReceived.length;
});

// Method to check if user has earned a new level
userSchema.methods.checkLevel = function() {
    const kudosCount = this.kudosReceived.length;
    const newLevel = Math.floor(Math.sqrt(kudosCount) / 2) + 1;
    if (newLevel > this.level) {
        this.level = newLevel;
        return true;
    }
    return false;
};

// Method to award badges
userSchema.methods.checkAndAwardBadges = function() {
    const kudosCount = this.kudosReceived.length;
    const newBadges = [];

    const badgeCriteria = [
        { count: 1, name: 'First Kudos', description: 'Received your first kudos!' },
        { count: 10, name: 'Rising Star', description: 'Received 10 kudos' },
        { count: 50, name: 'Superstar', description: 'Received 50 kudos' },
        { count: 100, name: 'Legend', description: 'Received 100 kudos' }
    ];

    badgeCriteria.forEach(criteria => {
        if (kudosCount >= criteria.count && !this.badges.some(b => b.name === criteria.name)) {
            newBadges.push({
                name: criteria.name,
                description: criteria.description,
                dateEarned: new Date()
            });
        }
    });

    if (newBadges.length > 0) {
        this.badges.push(...newBadges);
    }

    return newBadges;
};

module.exports = mongoose.model('User', userSchema);
