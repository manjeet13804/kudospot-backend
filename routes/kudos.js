const express = require('express');
const router = express.Router();
const Kudo = require('../models/Kudo');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all kudos
router.get('/', auth, async (req, res) => {
  try {
    const kudos = await Kudo.find()
      .populate('from', 'name department')
      .populate('to', 'name department')
      .sort({ createdAt: -1 });
    res.json(kudos);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's kudos
router.get('/user', auth, async (req, res) => {
  try {
    const kudos = await Kudo.find({
      $or: [{ from: req.user.userId }, { to: req.user.userId }],
    })
      .populate('from', 'name department')
      .populate('to', 'name department')
      .sort({ createdAt: -1 });
    res.json(kudos);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new kudo
router.post('/', auth, async (req, res) => {
  try {
    const { to, message, category } = req.body;
    
    // Validate inputs
    if (!to || !message || !category) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Validate recipient exists
    const recipient = await User.findById(to);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const kudo = new Kudo({
      from: req.user.userId,  // Changed from req.user.id to req.user.userId
      to,
      message,
      category,
      likes: [],
    });

    await kudo.save();
    await kudo.populate('from', 'name department');
    await kudo.populate('to', 'name department');

    res.status(201).json(kudo);
  } catch (err) {
    console.error('Error creating kudo:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get kudos statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const kudosReceived = await Kudo.countDocuments({ to: req.user.userId });
    const kudosGiven = await Kudo.countDocuments({ from: req.user.userId });
    const categoryStats = await Kudo.aggregate([
      { $match: { to: req.user.userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.json({
      kudosReceived,
      kudosGiven,
      categoryStats,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike a kudo
router.post('/:id/like', auth, async (req, res) => {
  try {
    const kudo = await Kudo.findById(req.params.id);
    if (!kudo) {
      return res.status(404).json({ message: 'Kudo not found' });
    }

    const likeIndex = kudo.likes.indexOf(req.user.userId);
    if (likeIndex > -1) {
      kudo.likes.splice(likeIndex, 1);
    } else {
      kudo.likes.push(req.user.userId);
    }

    await kudo.save();
    res.json(kudo);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const receivedStats = await Kudo.aggregate([
      { $group: { _id: '$to', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          count: 1,
          name: '$user.name',
          department: '$user.department',
        },
      },
    ]);

    const givenStats = await Kudo.aggregate([
      { $group: { _id: '$from', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          count: 1,
          name: '$user.name',
          department: '$user.department',
        },
      },
    ]);

    res.json({
      received: receivedStats,
      given: givenStats,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
