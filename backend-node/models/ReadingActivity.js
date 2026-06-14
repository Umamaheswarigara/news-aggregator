import mongoose from 'mongoose';

const readingActivitySchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    index: true
  },
  articleId: {
    type: Number,
    required: true,
    index: true
  },
  readTime: {
    type: Date,
    default: Date.now
  },
  readingDuration: {
    type: Number, // duration in seconds
    default: 0
  }
});

const ReadingActivity = mongoose.model('ReadingActivity', readingActivitySchema);
export default ReadingActivity;
