const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User!'],
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price!'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paid: {
    type: Boolean,
    default: false,
  },
});

// Auto-populate references
bookingSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name email',
  }).populate({
    path: 'tour',
    select: 'name duration price',
  });
  next();
});

// Add compound index for efficiency
bookingSchema.index({ user: 1, tour: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
