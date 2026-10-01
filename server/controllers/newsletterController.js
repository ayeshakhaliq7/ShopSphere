const Subscriber = require('../models/Subscriber');
const asyncHandler = require('../utils/asyncHandler');

exports.subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const existing = await Subscriber.findOne({ email });
  if (!existing) await Subscriber.create({ email });
  // Same response either way so the endpoint can't be used to probe who is subscribed.
  res.status(201).json({ message: 'Thanks for subscribing!' });
});
