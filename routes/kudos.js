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
      $or: [{ from: req.user.id }, { to: req.user.id }],
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
    const kudo = new Kudo({
      from: req.user.id,
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
    res.status(500).json({ message: 'Server error' });
  }
});

// Get kudos statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const kudosReceived = await Kudo.countDocuments({ to: req.user.id });
    const kudosGiven = await Kudo.countDocuments({ from: req.user.id });
    const categoryStats = await Kudo.aggregate([
      { $match: { to: req.user.id } },
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

    const likeIndex = kudo.likes.indexOf(req.user.id);
    if (likeIndex > -1) {
      kudo.likes.splice(likeIndex, 1);
    } else {
      kudo.likes.push(req.user.id);
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
    const pipeline = [
      {
        $group: {
          _id: '$to',
          score: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: '$user._id',
          name: '$user.name',
          department: '$user.department',
          score: 1,
        },
      },
      {
        $sort: { score: -1 },
      },
      {
        $limit: 10,
      },
    ];

    const [received, given, trending] = await Promise.all([
      Kudo.aggregate(pipeline),
      Kudo.aggregate([
        ...pipeline.slice(0, 1),
        { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        ...pipeline.slice(1),
      ]),
      Kudo.aggregate([
        { $match: { from: req.user.id } },
        ...pipeline.slice(1),
      ]),
    ]);

    res.json({
      received,
      given,
      trending,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
