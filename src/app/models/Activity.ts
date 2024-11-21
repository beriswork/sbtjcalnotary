import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'signup', 'login', 'request_made'],
    required: true
  },
  action: {
    type: String,
    required: true
  },
  creditsRemaining: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Activity || mongoose.model('Activity', activitySchema); 